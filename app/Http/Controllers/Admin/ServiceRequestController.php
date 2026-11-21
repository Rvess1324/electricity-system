<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Electrician;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServiceRequestController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->string('status')->toString();
        $search = trim($request->string('q')->toString());

        $requests = ServiceRequest::with(['household.user', 'meter', 'electrician.user'])
            ->when(
                in_array($status, ['pending', 'assigned', 'resolved'], true),
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
            ->latest('id')
            ->paginate(10)
            ->withQueryString()
            ->through(fn ($r) => [
                'id' => $r->id,
                'household' => $r->household->user->name,
                'address' => $r->household->address,
                'meter_no' => $r->meter->meter_no,
                'issue_description' => $r->issue_description,
                'status' => $r->status,
                'requested_date' => $r->requested_date,
                'resolved_date' => $r->resolved_date,
                'electrician_id' => $r->electrician_id,
                'electrician' => $r->electrician?->user?->name,
            ]);

        $electricians = Electrician::with('user')->get()->map(fn ($e) => [
            'id' => $e->id,
            'name' => $e->user->name,
            'specialization' => $e->specialization,
        ]);

        return Inertia::render('admin/requests/index', [
            'requests' => $requests,
            'electricians' => $electricians,
            'filters' => ['q' => $search, 'status' => $status],
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
            'status' => 'assigned',
        ]);

        return back();
    }
}
