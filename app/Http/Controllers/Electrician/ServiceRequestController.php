<?php

namespace App\Http\Controllers\Electrician;

use App\Http\Controllers\Controller;
use App\Models\ServiceRequest;
use App\Notifications\ServiceRequestUpdated;
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
                in_array($status, [ServiceRequest::ASSIGNED, ServiceRequest::IN_PROGRESS, ServiceRequest::RESOLVED], true),
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
            ->orderByRaw("CASE status WHEN 'in_progress' THEN 0 WHEN 'assigned' THEN 1 ELSE 2 END")
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
                'scheduled_date' => $r->scheduled_date,
                'resolved_date' => $r->resolved_date,
                'work_notes' => $r->work_notes,
            ]);

        return Inertia::render('electrician/requests/index', [
            'requests' => $requests,
            'filters' => ['q' => $search, 'status' => $status],
        ]);
    }

    public function start(ServiceRequest $serviceRequest)
    {
        $this->authorizeJob($serviceRequest, [ServiceRequest::ASSIGNED], 'Only assigned requests can be started.');

        $serviceRequest->update(['status' => ServiceRequest::IN_PROGRESS]);
        $this->notifyHousehold($serviceRequest, 'The electrician has started work on your request');

        return back();
    }

    public function resolve(Request $request, ServiceRequest $serviceRequest)
    {
        $this->authorizeJob(
            $serviceRequest,
            [ServiceRequest::ASSIGNED, ServiceRequest::IN_PROGRESS],
            'Only assigned or in-progress requests can be completed.',
        );

        $data = $request->validate(['work_notes' => ['nullable', 'string', 'max:1000']]);

        $serviceRequest->update([
            'status' => ServiceRequest::RESOLVED,
            'resolved_date' => now()->toDateString(),
            'work_notes' => $data['work_notes'] ?? null,
        ]);
        $this->notifyHousehold($serviceRequest, 'Your request was completed');

        return back();
    }

    /**
     * Only MY request, and only from one of the allowed statuses.
     *
     * @param  array<int, string>  $allowed
     */
    private function authorizeJob(ServiceRequest $serviceRequest, array $allowed, string $message): void
    {
        abort_unless($serviceRequest->electrician_id === $this->electrician()->id, 403);
        abort_unless(in_array($serviceRequest->status, $allowed, true), 422, $message);
    }

    private function notifyHousehold(ServiceRequest $serviceRequest, string $text): void
    {
        $serviceRequest->household->user->notify(new ServiceRequestUpdated(
            "{$text} (meter {$serviceRequest->meter->meter_no}).",
            '/household/requests',
        ));
    }
}
