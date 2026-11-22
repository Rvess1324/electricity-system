<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Electrician;
use App\Models\ElectricianDocument;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ElectricianReviewController extends Controller
{
    public function show(Electrician $electrician): Response
    {
        $electrician->load('user');

        return Inertia::render('admin/electricians/review', [
            'electrician' => [
                'id' => $electrician->id,
                'name' => $electrician->user->name,
                'email' => $electrician->user->email,
                'phone_no' => $electrician->phone_no,
                'address' => $electrician->address,
                'license_no' => $electrician->license_no,
                'qualification_type' => $electrician->qualification_type,
                'specialization' => $electrician->specialization,
                'years_experience' => $electrician->years_experience,
                'service_area' => $electrician->service_area,
                'previous_work' => $electrician->previous_work,
                'status' => $electrician->status,
                'status_reason' => $electrician->status_reason,
                'reviewed_at' => $electrician->reviewed_at?->toDateTimeString(),
                'has_required_documents' => $electrician->hasRequiredDocuments(),
            ],
            'documents' => $electrician->documents()->latest('id')->get(['id', 'type', 'original_name', 'size'])->map(fn (ElectricianDocument $document) => [
                'id' => $document->id,
                'type' => $document->type,
                'original_name' => $document->original_name,
                'size' => $document->size,
            ]),
        ]);
    }

    public function approve(Request $request, Electrician $electrician): RedirectResponse
    {
        abort_unless(in_array($electrician->status, [Electrician::PENDING, Electrician::REJECTED], true), 422);

        if (! $electrician->hasRequiredDocuments()) {
            return back()->withErrors(['status' => 'A valid ID and a license or certificate must be uploaded before approval.']);
        }

        $this->setStatus($request, $electrician, Electrician::APPROVED, null);

        return back();
    }

    public function reject(Request $request, Electrician $electrician): RedirectResponse
    {
        abort_unless($electrician->status === Electrician::PENDING, 422);

        $this->setStatus($request, $electrician, Electrician::REJECTED, $this->reason($request));

        return back();
    }

    public function suspend(Request $request, Electrician $electrician): RedirectResponse
    {
        abort_unless($electrician->status === Electrician::APPROVED, 422);

        $this->setStatus($request, $electrician, Electrician::SUSPENDED, $this->reason($request));

        return back();
    }

    public function reinstate(Request $request, Electrician $electrician): RedirectResponse
    {
        abort_unless($electrician->status === Electrician::SUSPENDED, 422);

        $this->setStatus($request, $electrician, Electrician::APPROVED, null);

        return back();
    }

    private function reason(Request $request): string
    {
        return $request->validate(['reason' => ['required', 'string', 'min:5', 'max:1000']])['reason'];
    }

    private function setStatus(Request $request, Electrician $electrician, string $status, ?string $reason): void
    {
        $electrician->update([
            'status' => $status,
            'status_reason' => $reason,
            'reviewed_at' => now(),
            'reviewed_by' => $request->user()->id,
        ]);
    }
}
