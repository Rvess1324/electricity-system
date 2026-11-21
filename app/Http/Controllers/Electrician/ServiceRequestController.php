<?php

namespace App\Http\Controllers\Electrician;

use App\Http\Controllers\Controller;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;
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

    public function index(Request $request)
    {
        $status = $request->string('status')->toString();
        $search = trim($request->string('q')->toString());

        $requests = $this->electrician()->serviceRequests()
            ->with(['household.user', 'meter'])
            ->when(
                in_array($status, ['assigned', 'resolved'], true),
                fn ($query) => $query->where('status', $status),
            )
            ->when($search !== '', function ($query) use ($search) {
                $like = '%'.$search.'%';

                $query->where(function ($query) use ($like) {
                    $query->where('issue_description', 'like', $like)
                        ->orWhereHas('meter', fn ($m) => $m->where('meter_no', 'like', $like))
                        ->orWhereHas('household.user', fn ($u) => $u->where('name', 'like', $like));
                });
            })
            ->orderByRaw("CASE status WHEN 'assigned' THEN 0 ELSE 1 END")
            ->latest('id')
            ->paginate(10)
            ->withQueryString()
            ->through(fn ($r) => [
                'id' => $r->id,
                'household' => $r->household->user->name,
                'address' => $r->household->address,
                'phone_no' => $r->household->phone_no,
                'meter_no' => $r->meter->meter_no,
                'issue_description' => $r->issue_description,
                'status' => $r->status,
                'requested_date' => $r->requested_date,
                'resolved_date' => $r->resolved_date,
            ]);

        return Inertia::render('electrician/requests/index', [
            'requests' => $requests,
            'filters' => ['q' => $search, 'status' => $status],
        ]);
    }

    public function resolve(ServiceRequest $serviceRequest)
    {
        // Only MY request, and only if it is still assigned
        abort_unless($serviceRequest->electrician_id === $this->electrician()->id, 403);
        abort_unless($serviceRequest->status === 'assigned', 422, 'Only assigned requests can be resolved.');

        $serviceRequest->update([
            'status' => 'resolved',
            'resolved_date' => now()->toDateString(),
        ]);

        return back();
    }
}
