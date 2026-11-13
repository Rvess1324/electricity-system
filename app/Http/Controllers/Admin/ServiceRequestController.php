<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Electrician;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServiceRequestController extends Controller
{
    public function index()
    {
        $requests = ServiceRequest::with(['household.user', 'meter', 'electrician.user'])
            ->latest('id')
            ->get()
            ->map(fn ($r) => [
                'id'                => $r->id,
                'household'         => $r->household->user->name,
                'address'           => $r->household->address,
                'meter_no'          => $r->meter->meter_no,
                'issue_description' => $r->issue_description,
                'status'            => $r->status,
                'requested_date'    => $r->requested_date,
                'resolved_date'     => $r->resolved_date,
                'electrician_id'    => $r->electrician_id,
                'electrician'       => $r->electrician?->user?->name,
            ]);

        $electricians = Electrician::with('user')->get()->map(fn ($e) => [
            'id'             => $e->id,
            'name'           => $e->user->name,
            'specialization' => $e->specialization,
        ]);

        return Inertia::render('admin/requests/index', [
            'requests'     => $requests,
            'electricians' => $electricians,
        ]);
    }

    public function assign(Request $request, ServiceRequest $serviceRequest)
    {
        abort_if($serviceRequest->status === 'resolved', 422, 'A resolved request cannot be reassigned.');

        $data = $request->validate([
            'electrician_id' => ['required', 'exists:electricians,id'],
        ]);

        $serviceRequest->update([
            'electrician_id' => $data['electrician_id'],
            'status'         => 'assigned',
        ]);

        return back();
    }
}