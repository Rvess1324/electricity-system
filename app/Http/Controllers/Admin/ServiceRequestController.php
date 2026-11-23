<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Electrician;
use App\Models\ServiceRequest;
use App\Notifications\ServiceRequestUpdated;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ServiceRequestController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->string('status')->toString();
        $search = trim($request->string('q')->toString());

        $requests = ServiceRequest::with(['household.user', 'meter', 'electrician.user'])
            ->when(
                in_array($status, ServiceRequest::STATUSES, true),
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
                'scheduled_date' => $r->scheduled_date,
                'resolved_date' => $r->resolved_date,
                'electrician_id' => $r->electrician_id,
                'electrician' => $r->electrician?->user?->name,
            ]);

        $electricians = Electrician::with('user')->where('status', Electrician::APPROVED)->get()->map(fn ($e) => [
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
        abort_unless(
            in_array($serviceRequest->status, ServiceRequest::OPEN, true),
            422,
            'Only open requests can be assigned.',
        );

        $data = $request->validate([
            'electrician_id' => ['required', Rule::exists('electricians', 'id')->where('status', Electrician::APPROVED)],
        ]);

        $serviceRequest->update([
            'electrician_id' => $data['electrician_id'],
            'status' => ServiceRequest::ASSIGNED,
        ]);

        $serviceRequest->load(['household.user', 'meter', 'electrician.user']);
        $meterNo = $serviceRequest->meter->meter_no;

        $serviceRequest->household->user->notify(new ServiceRequestUpdated(
            "An electrician was assigned to your request (meter {$meterNo}).",
            '/household/requests',
        ));
        $serviceRequest->electrician?->user->notify(new ServiceRequestUpdated(
            "A new job was assigned to you (meter {$meterNo}).",
            '/electrician/requests',
        ));

        return back();
    }
}
