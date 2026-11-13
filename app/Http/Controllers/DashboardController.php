<?php

namespace App\Http\Controllers;

use App\Models\EnergyTip;
use App\Models\Household;
use App\Models\ServiceRequest;
use App\Models\UsageRecord;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function admin()
    {
        return Inertia::render('admin/dashboard', [
            'stats' => [
                'users'      => User::count(),
                'households' => Household::count(),
                'electricians' => User::where('role', 'electrician')->count(),
                'tips'       => EnergyTip::count(),
                'pending'    => ServiceRequest::where('status', 'pending')->count(),
                'assigned'   => ServiceRequest::where('status', 'assigned')->count(),
                'resolved'   => ServiceRequest::where('status', 'resolved')->count(),
            ],
            'pendingRequests' => ServiceRequest::with(['household.user', 'meter'])
                ->where('status', 'pending')
                ->latest('id')
                ->take(5)
                ->get()
                ->map(fn ($r) => [
                    'id'                => $r->id,
                    'household'         => $r->household->user->name,
                    'meter_no'          => $r->meter->meter_no,
                    'issue_description' => $r->issue_description,
                    'requested_date'    => $r->requested_date,
                ]),
        ]);
    }

    public function household()
    {
        $household = Auth::user()->household()->firstOrCreate([], ['address' => 'Not set yet']);
        $meterIds = $household->meters()->pluck('id');

        // Usage in the last 30 days (today and the 29 days before)
        $since = now()->subDays(29)->toDateString();
        $recent = UsageRecord::whereIn('meter_id', $meterIds)->where('usage_date', '>=', $since);
        $last30Kwh  = (float) (clone $recent)->sum('kwh_used');
        $last30Cost = (float) (clone $recent)->sum('estimated_cost');

        $latest = UsageRecord::with('meter')
            ->whereIn('meter_id', $meterIds)
            ->orderByDesc('usage_date')
            ->first();

        // The plan that covers today, if any
        $today = now()->toDateString();
        $plan = $household->energyPlans()
            ->where('start_date', '<=', $today)
            ->where('end_date', '>=', $today)
            ->latest('id')
            ->first();

        $applianceKwh = $household->appliances()->get()
            ->sum(fn ($a) => $a->wattage * $a->quantity * (float) $a->hours_per_day * 30 / 1000);

        return Inertia::render('household/dashboard', [
            'stats' => [
                'meters'           => $household->meters()->count(),
                'appliances'       => $household->appliances()->count(),
                'plans'            => $household->energyPlans()->count(),
                'saved_tips'       => $household->savedTips()->count(),
                'pending_requests' => $household->serviceRequests()->whereIn('status', ['pending', 'assigned'])->count(),
                'appliance_kwh'    => round($applianceKwh, 1),
                'last30_kwh'       => round($last30Kwh, 1),
                'last30_cost'      => round($last30Cost, 2),
            ],
            'latest' => $latest ? [
                'usage_date' => $latest->usage_date,
                'kwh_used'   => $latest->kwh_used,
                'meter_no'   => $latest->meter->meter_no,
            ] : null,
            'activePlan' => $plan ? [
                'id'                 => $plan->id,
                'plan_name'          => $plan->plan_name,
                'monthly_kwh_target' => $plan->monthly_kwh_target,
                'monthly_budget'     => $plan->monthly_budget,
                'summary'            => $plan->summary(),
            ] : null,
        ]);
    }

    public function electrician()
    {
        $electrician = Auth::user()->electrician;

        $requests = $electrician?->serviceRequests() ?? null;

        return Inertia::render('electrician/dashboard', [
            'stats' => [
                'assigned' => $requests ? (clone $requests)->where('status', 'assigned')->count() : 0,
                'resolved' => $requests ? (clone $requests)->where('status', 'resolved')->count() : 0,
            ],
            'upcoming' => $requests
                ? (clone $requests)->with(['household.user', 'meter'])
                    ->where('status', 'assigned')
                    ->latest('id')
                    ->take(5)
                    ->get()
                    ->map(fn ($r) => [
                        'id'                => $r->id,
                        'household'         => $r->household->user->name,
                        'address'           => $r->household->address,
                        'meter_no'          => $r->meter->meter_no,
                        'issue_description' => $r->issue_description,
                        'requested_date'    => $r->requested_date,
                    ])
                : [],
            'hasProfile' => (bool) $electrician,
        ]);
    }
}