<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Admin\DeleteAccount;
use App\Http\Controllers\Controller;
use App\Models\Household;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class HouseholdController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim($request->string('q')->toString());

        $households = Household::with('user')
            ->withCount([
                'meters',
                'serviceRequests as open_requests' => fn ($query) => $query->whereIn('status', ['pending', 'assigned']),
            ])
            ->when($search !== '', function ($query) use ($search) {
                $like = '%'.$search.'%';

                $query->where(fn ($query) => $query
                    ->where('address', 'like', $like)
                    ->orWhere('phone_no', 'like', $like)
                    ->orWhereHas('user', fn ($user) => $user
                        ->where('name', 'like', $like)
                        ->orWhere('email', 'like', $like)));
            })
            ->latest('id')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Household $household) => [
                'id' => $household->id,
                'name' => $household->user->name,
                'email' => $household->user->email,
                'address' => $household->address,
                'phone_no' => $household->phone_no,
                'meters_count' => (int) $household->getAttribute('meters_count'),
                'open_requests' => (int) $household->getAttribute('open_requests'),
            ]);

        return Inertia::render('admin/households/index', [
            'households' => $households,
            'filters' => ['q' => $search],
        ]);
    }

    public function edit(Household $household): Response
    {
        return Inertia::render('admin/households/edit', [
            'household' => [
                'id' => $household->id,
                'name' => $household->user->name,
                'email' => $household->user->email,
                'address' => $household->address,
                'phone_no' => $household->phone_no,
            ],
        ]);
    }

    public function update(Request $request, Household $household): RedirectResponse
    {
        $request->merge(['email' => mb_strtolower(trim($request->string('email')->toString()))]);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($household->user_id)],
            'address' => ['required', 'string', 'max:255'],
            'phone_no' => ['nullable', 'string', 'max:20'],
        ]);

        $household->user->update(['name' => $data['name'], 'email' => $data['email']]);
        $household->update(['address' => $data['address'], 'phone_no' => $data['phone_no'] ?? null]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Household updated.']);

        return to_route('admin.households.index');
    }

    public function destroy(Household $household, DeleteAccount $deleteAccount): RedirectResponse
    {
        // Meters, usage, appliances, plans, saved tips and requests go with the account
        $deleteAccount->handle($household->user);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Household deleted.']);

        return to_route('admin.households.index');
    }
}
