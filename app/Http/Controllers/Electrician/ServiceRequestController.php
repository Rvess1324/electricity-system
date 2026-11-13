<?php

namespace App\Http\Controllers\Electrician;

use App\Http\Controllers\Controller;
use App\Models\ServiceRequest;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ServiceRequestController extends Controller
{
    // An electrician account needs a row in the electricians table
    private function electrician()
    {
        $electrician = Auth::user()->electrician;
        abort_unless($electrician, 403, 'No electrician profile is linked to this account.');

        return $electrician;
    }

    public function index()
    {
        $requests = $this->electrician()->serviceRequests()
            ->with(['household.user', 'meter'])
            ->orderByRaw("CASE status WHEN 'assigned' THEN 0 ELSE 1 END")
            ->latest('id')
            ->get()
            ->map(fn ($r) => [
                'id'                => $r->id,
                'household'         => $r->household->user->name,
                'address'           => $r->household->address,
                'phone_no'          => $r->household->phone_no,
                'meter_no'          => $r->meter->meter_no,
                'issue_description' => $r->issue_description,
                'status'            => $r->status,
                'requested_date'    => $r->requested_date,
                'resolved_date'     => $r->resolved_date,
            ]);

        return Inertia::render('electrician/requests/index', ['requests' => $requests]);
    }

    public function resolve(ServiceRequest $serviceRequest)
    {
        // Only MY request, and only if it is still assigned
        abort_unless($serviceRequest->electrician_id === $this->electrician()->id, 403);
        abort_unless($serviceRequest->status === 'assigned', 422, 'Only assigned requests can be resolved.');

        $serviceRequest->update([
            'status'        => 'resolved',
            'resolved_date' => now()->toDateString(),
        ]);

        return back();
    }
}