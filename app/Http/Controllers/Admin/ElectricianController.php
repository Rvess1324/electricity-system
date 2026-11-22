<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Admin\DeleteAccount;
use App\Actions\Teams\CreateTeam;
use App\Http\Controllers\Controller;
use App\Models\Electrician;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class ElectricianController extends Controller
{
    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, ?Electrician $electrician = null): array
    {
        $request->merge(['email' => mb_strtolower(trim($request->string('email')->toString()))]);

        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($electrician?->user_id)],
            'license_no' => ['required', 'string', 'max:50', Rule::unique('electricians', 'license_no')->ignore($electrician?->id)],
            'specialization' => ['nullable', 'string', 'max:100'],
            // Required for a new account; on edit, leave empty to keep the current password
            'password' => [$electrician ? 'nullable' : 'required', 'string', Password::default()],
        ]);
    }

    public function index(Request $request): Response
    {
        $search = trim($request->string('q')->toString());
        $status = $request->string('status')->toString();

        $electricians = Electrician::with('user')
            ->withCount(['serviceRequests as open_jobs' => fn ($query) => $query->where('status', 'assigned')])
            ->when(
                in_array($status, Electrician::STATUSES, true),
                fn ($query) => $query->where('status', $status),
            )
            ->when($search !== '', function ($query) use ($search) {
                $like = '%'.$search.'%';

                $query->where(fn ($query) => $query
                    ->where('license_no', 'like', $like)
                    ->orWhere('specialization', 'like', $like)
                    ->orWhereHas('user', fn ($user) => $user
                        ->where('name', 'like', $like)
                        ->orWhere('email', 'like', $like)));
            })
            ->latest('id')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Electrician $electrician) => [
                'id' => $electrician->id,
                'name' => $electrician->user->name,
                'email' => $electrician->user->email,
                'license_no' => $electrician->license_no,
                'specialization' => $electrician->specialization,
                'status' => $electrician->status,
                'open_jobs' => (int) $electrician->getAttribute('open_jobs'),
            ]);

        return Inertia::render('admin/electricians/index', [
            'electricians' => $electricians,
            'filters' => ['q' => $search, 'status' => $status],
            'statuses' => Electrician::STATUSES,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/electricians/create');
    }

    public function store(Request $request, CreateTeam $createTeam): RedirectResponse
    {
        $data = $this->validated($request);

        DB::transaction(function () use ($data, $createTeam) {
            // The admin vouches for this account, so it starts verified
            $user = User::forceCreate([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password'],
                'role' => 'electrician',
                'email_verified_at' => now(),
            ]);

            // Every account needs a personal team, or login redirects fail
            $createTeam->handle($user, "{$user->name}'s Team", isPersonal: true);

            Electrician::create([
                'user_id' => $user->id,
                'license_no' => $data['license_no'],
                'specialization' => $data['specialization'] ?? null,
                'status' => Electrician::APPROVED, // created by an admin, so already vouched for
            ]);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Electrician account created.']);

        return to_route('admin.electricians.index');
    }

    public function edit(Electrician $electrician): Response
    {
        return Inertia::render('admin/electricians/edit', [
            'electrician' => [
                'id' => $electrician->id,
                'name' => $electrician->user->name,
                'email' => $electrician->user->email,
                'license_no' => $electrician->license_no,
                'specialization' => $electrician->specialization,
            ],
        ]);
    }

    public function update(Request $request, Electrician $electrician): RedirectResponse
    {
        $data = $this->validated($request, $electrician);

        DB::transaction(function () use ($data, $electrician) {
            $user = $electrician->user;
            $user->fill(['name' => $data['name'], 'email' => $data['email']]);

            if (! empty($data['password'])) {
                $user->password = $data['password'];
            }

            $user->save();

            $electrician->update([
                'license_no' => $data['license_no'],
                'specialization' => $data['specialization'] ?? null,
            ]);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Electrician updated.']);

        return to_route('admin.electricians.index');
    }

    public function destroy(Electrician $electrician, DeleteAccount $deleteAccount): RedirectResponse
    {
        if ($electrician->serviceRequests()->where('status', 'assigned')->exists()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'This electrician still has assigned jobs. Reassign them first.',
            ]);

            return back();
        }

        $deleteAccount->handle($electrician->user);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Electrician deleted.']);

        return to_route('admin.electricians.index');
    }
}
