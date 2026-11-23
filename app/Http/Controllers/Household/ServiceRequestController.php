<?php

namespace App\Http\Controllers\Household;

use App\Http\Controllers\Controller;
use App\Models\ServiceRequest;
use App\Notifications\ServiceRequestUpdated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ServiceRequestController extends Controller
{
    private function household()
    {
        return Auth::user()->household()->firstOrCreate([], ['address' => 'Not set yet']);
    }

    public function index(Request $request)
    {
        $status = $request->string('status')->toString();

        $requests = $this->household()->serviceRequests()
            ->with(['meter', 'electrician.user'])
            ->when(
                in_array($status, ServiceRequest::STATUSES, true),
                fn ($query) => $query->where('status', $status),
            )
            ->latest('id')
            ->paginate(10)
            ->withQueryString()
            ->through(fn ($r) => [
                'id' => $r->id,
                'meter_no' => $r->meter->meter_no,
                'issue_description' => $r->issue_description,
                'status' => $r->status,
                'requested_date' => $r->requested_date,
                'scheduled_date' => $r->scheduled_date,
                'resolved_date' => $r->resolved_date,
                'work_notes' => $r->work_notes,
                'electrician' => $r->electrician?->user?->name,
            ]);

        return Inertia::render('household/requests/index', [
            'requests' => $requests,
            'filters' => ['status' => $status],
        ]);
    }

    public function create()
    {
        return Inertia::render('household/requests/create', [
            'meters' => $this->household()->meters()->orderBy('meter_no')->get(['id', 'meter_no']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            // must be one of MY meters
            'meter_id' => ['required', Rule::exists('meters', 'id')->where('household_id', $this->household()->id)],
            'issue_description' => ['required', 'string', 'min:5', 'max:1000'],
            'scheduled_date' => ['nullable', 'date', 'after_or_equal:today'],
        ]);

        // The server decides the status and the date, never the browser
        $this->household()->serviceRequests()->create($data + [
            'status' => ServiceRequest::PENDING,
            'requested_date' => now()->toDateString(),
        ]);

        return redirect()->route('household.requests.index');
    }

    /**
     * Cancel (not delete) so the history stays. Allowed until the work has started.
     */
    public function destroy(ServiceRequest $serviceRequest)
    {
        abort_unless($serviceRequest->household_id === $this->household()->id, 403);
        abort_unless(
            in_array($serviceRequest->status, [ServiceRequest::PENDING, ServiceRequest::ASSIGNED], true),
            403,
            'Only pending or assigned requests can be cancelled.',
        );

        $electrician = $serviceRequest->electrician;
        $serviceRequest->update(['status' => ServiceRequest::CANCELLED]);

        $electrician?->user->notify(new ServiceRequestUpdated(
            "The request for meter {$serviceRequest->meter->meter_no} was cancelled by the household.",
            '/electrician/requests',
        ));

        return redirect()->route('household.requests.index');
    }
}
