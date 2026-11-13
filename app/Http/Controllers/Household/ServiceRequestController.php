<?php

namespace App\Http\Controllers\Household;

use App\Http\Controllers\Controller;
use App\Models\ServiceRequest;
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

    public function index()
    {
        $requests = $this->household()->serviceRequests()
            ->with(['meter', 'electrician.user'])
            ->latest('id')
            ->get()
            ->map(fn ($r) => [
                'id'                => $r->id,
                'meter_no'          => $r->meter->meter_no,
                'issue_description' => $r->issue_description,
                'status'            => $r->status,
                'requested_date'    => $r->requested_date,
                'resolved_date'     => $r->resolved_date,
                'electrician'       => $r->electrician?->user?->name,
            ]);

        return Inertia::render('household/requests/index', ['requests' => $requests]);
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
            'meter_id'          => ['required', Rule::exists('meters', 'id')->where('household_id', $this->household()->id)],
            'issue_description' => ['required', 'string', 'min:5', 'max:1000'],
        ]);

        // The server decides the status and the date, never the browser
        $this->household()->serviceRequests()->create($data + [
            'status'         => 'pending',
            'requested_date' => now()->toDateString(),
        ]);

        return redirect()->route('household.requests.index');
    }

    public function destroy(ServiceRequest $serviceRequest)
    {
        abort_unless($serviceRequest->household_id === $this->household()->id, 403);
        abort_unless($serviceRequest->status === 'pending', 403, 'Only pending requests can be cancelled.');

        $serviceRequest->delete();

        return redirect()->route('household.requests.index');
    }
}