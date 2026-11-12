<?php

namespace App\Http\Controllers\Household;

use App\Http\Controllers\Controller;
use App\Models\EnergyPlan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class EnergyPlanController extends Controller
{
    private function household()
    {
        return Auth::user()->household()->firstOrCreate([], ['address' => 'Not set yet']);
    }

    private function ownOrFail(EnergyPlan $plan): void
    {
        abort_unless($plan->household_id === $this->household()->id, 403);
    }

        private function rules(): array
    {
        return [
            'plan_name'          => ['required', 'string', 'max:100'],
            'monthly_kwh_target' => ['required', 'numeric', 'min:1', 'max:100000'],
            'monthly_budget'     => ['required', 'numeric', 'min:0', 'max:10000000'],
            'start_date'         => ['required', 'date', 'after_or_equal:2000-01-01', 'before:2100-01-01'],
            'end_date'           => ['required', 'date', 'after:start_date', 'before:2100-01-01'],
        ];
    }

    public function index()
    {
        $plans = $this->household()->energyPlans()->latest()->get()
            ->map(fn ($p) => $p->toArray() + ['summary' => $p->summary()]);

        return Inertia::render('household/plans/index', ['plans' => $plans]);
    }

    public function create()
    {
        return Inertia::render('household/plans/create');
    }

    public function store(Request $request)
    {
        $plan = $this->household()->energyPlans()->create($request->validate($this->rules()));

        return redirect()->route('household.plans.show', $plan);
    }

    public function show(EnergyPlan $plan)
    {
        $this->ownOrFail($plan);

        $items = $plan->planItems()->with('appliance')->get()->map(fn ($i) => [
            'id'                    => $i->id,
            'appliance_name'        => $i->appliance->appliance_name,
            'wattage'               => $i->appliance->wattage,
            'quantity'              => $i->appliance->quantity,
            'usual_hours_per_day'   => $i->appliance->hours_per_day,
            'planned_hours_per_day' => $i->planned_hours_per_day,
            'priority'              => $i->priority,
            'planned_kwh'           => round($i->appliance->wattage * $i->appliance->quantity * (float) $i->planned_hours_per_day * 30 / 1000, 1),
        ]);

        return Inertia::render('household/plans/show', [
            'plan'    => $plan,
            'items'   => $items,
            'summary' => $plan->summary(),
            'rate'    => (float) config('electricity.rate'),
        ]);
    }

    public function edit(EnergyPlan $plan)
    {
        $this->ownOrFail($plan);

        return Inertia::render('household/plans/edit', ['plan' => $plan]);
    }

    public function update(Request $request, EnergyPlan $plan)
    {
        $this->ownOrFail($plan);
        $plan->update($request->validate($this->rules()));

        return redirect()->route('household.plans.show', $plan);
    }

    public function destroy(EnergyPlan $plan)
    {
        $this->ownOrFail($plan);
        $plan->delete();

        return redirect()->route('household.plans.index');
    }
}