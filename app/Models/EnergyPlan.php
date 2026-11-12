<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class EnergyPlan extends Model
{
    protected $fillable = ['household_id', 'plan_name', 'monthly_kwh_target', 'monthly_budget', 'start_date', 'end_date'];

    public function household() { return $this->belongsTo(Household::class); }
    public function planItems() { return $this->hasMany(PlanItem::class); }

    // All the plan math in one place
    public function summary(): array
    {
        $rate = (float) config('electricity.rate');
        $items = $this->planItems()->with('appliance')->get();

        // kWh/month = watts x hours/day x 30 / 1000
                $plannedKwh = $items->sum(fn ($i) => $i->appliance->wattage * $i->appliance->quantity * (float) $i->planned_hours_per_day * 30 / 1000);
        $usualKwh   = $items->sum(fn ($i) => $i->appliance->wattage * $i->appliance->quantity * (float) $i->appliance->hours_per_day * 30 / 1000);
        $plannedCost = $plannedKwh * $rate;

        // Actual usage from the household's meters during the plan period
        $start = Carbon::parse($this->start_date)->startOfDay();
        $end   = Carbon::parse($this->end_date)->startOfDay();
        $today = Carbon::today();

        $actualTotal = null;
        $actualMonthly = null;

        if ($today->gte($start)) {
            $until = $today->lt($end) ? $today : $end;
            $days = (int) $start->diffInDays($until) + 1;
            $meterIds = $this->household->meters()->pluck('id');

            $records = UsageRecord::whereIn('meter_id', $meterIds)
                ->whereBetween('usage_date', [$start->toDateString(), $until->toDateString()]);

            // Only calculate when there is at least one record
            if ((clone $records)->exists()) {
                $actualTotal = (float) $records->sum('kwh_used');

                // Scale to 30 days (assumes you record usage regularly)
                $actualMonthly = $actualTotal / $days * 30;
            }
        }

        return [
            'planned_kwh'    => round($plannedKwh, 1),
            'usual_kwh'      => round($usualKwh, 1),
            'saving_kwh'     => round($usualKwh - $plannedKwh, 1),
            'planned_cost'   => round($plannedCost, 2),
            'kwh_ok'         => $plannedKwh <= (float) $this->monthly_kwh_target,
            'budget_ok'      => $plannedCost <= (float) $this->monthly_budget,
            'actual_total'   => $actualTotal === null ? null : round($actualTotal, 1),
            'actual_monthly' => $actualMonthly === null ? null : round($actualMonthly, 1),
            'actual_ok'      => $actualMonthly === null ? null : $actualMonthly <= (float) $this->monthly_kwh_target,
        ];
    }
}