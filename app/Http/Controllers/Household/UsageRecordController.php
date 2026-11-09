<?php

namespace App\Http\Controllers\Household;

use App\Http\Controllers\Controller;
use App\Models\Meter;
use App\Models\UsageRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class UsageRecordController extends Controller
{
    private function household()
    {
        return Auth::user()->household()->firstOrCreate([], ['address' => 'Not set yet']);
    }

    // The meter must be mine
    private function meterOrFail(Meter $meter): void
    {
        abort_unless($meter->household_id === $this->household()->id, 403);
    }

    // The record must belong to that meter
    private function recordOrFail(Meter $meter, UsageRecord $usage): void
    {
        $this->meterOrFail($meter);
        abort_unless($usage->meter_id === $meter->id, 404);
    }

    private function rules(): array
    {
        return [
            'usage_date' => ['required', 'date', 'before_or_equal:today'],
            'kwh_used'   => ['required', 'numeric', 'min:0', 'max:99999'],
        ];
    }

    // Cost is calculated here, never typed by the user
    private function withCost(array $data): array
    {
        $data['estimated_cost'] = round($data['kwh_used'] * config('electricity.rate'), 2);

        return $data;
    }

    public function index(Meter $meter)
    {
        $this->meterOrFail($meter);

        $records = $meter->usageRecords()->orderByDesc('usage_date')->get();

        return Inertia::render('household/usage/index', [
            'meter'   => $meter,
            'records' => $records,
            'rate'    => config('electricity.rate'),
            'totals'  => [
                'kwh'  => (float) $records->sum('kwh_used'),
                'cost' => (float) $records->sum('estimated_cost'),
            ],
        ]);
    }

    public function create(Meter $meter)
    {
        $this->meterOrFail($meter);

        return Inertia::render('household/usage/create', [
            'meter' => $meter,
            'rate'  => config('electricity.rate'),
        ]);
    }

    public function store(Request $request, Meter $meter)
    {
        $this->meterOrFail($meter);
        $meter->usageRecords()->create($this->withCost($request->validate($this->rules())));

        return redirect()->route('household.meters.usage.index', $meter);
    }

    public function edit(Meter $meter, UsageRecord $usage)
    {
        $this->recordOrFail($meter, $usage);

        return Inertia::render('household/usage/edit', [
            'meter'  => $meter,
            'record' => $usage,
            'rate'   => config('electricity.rate'),
        ]);
    }

    public function update(Request $request, Meter $meter, UsageRecord $usage)
    {
        $this->recordOrFail($meter, $usage);
        $usage->update($this->withCost($request->validate($this->rules())));

        return redirect()->route('household.meters.usage.index', $meter);
    }

    public function destroy(Meter $meter, UsageRecord $usage)
    {
        $this->recordOrFail($meter, $usage);
        $usage->delete();

        return redirect()->route('household.meters.usage.index', $meter);
    }
}