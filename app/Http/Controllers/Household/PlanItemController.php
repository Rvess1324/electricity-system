<?php

namespace App\Http\Controllers\Household;

use App\Http\Controllers\Controller;
use App\Models\EnergyPlan;
use App\Models\PlanItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PlanItemController extends Controller
{
    private function household()
    {
        return Auth::user()->household()->firstOrCreate([], ['address' => 'Not set yet']);
    }

    // The plan must be mine, and the item must belong to that plan
    private function check(EnergyPlan $plan, ?PlanItem $item = null): void
    {
        abort_unless($plan->household_id === $this->household()->id, 403);

        if ($item) {
            abort_unless($item->energy_plan_id === $plan->id, 404);
        }
    }

    private function rules(EnergyPlan $plan, ?PlanItem $item = null, bool $isNew = false): array
    {
        $rules = [
            'planned_hours_per_day' => ['required', 'numeric', 'min:0', 'max:24'],
            'priority'              => ['required', Rule::in(['high', 'medium', 'low'])],
        ];

        if ($isNew) {
            // The person chose "+ Create a new appliance"
            $rules += [
                'appliance_id'       => ['required', Rule::in(['new'])],
                'new_appliance_name' => ['required', 'string', 'max:100'],
                'new_wattage'        => ['required', 'integer', 'min:1', 'max:100000'],
                'new_quantity'       => ['required', 'integer', 'min:1', 'max:1000'],
                'new_hours_per_day'  => ['required', 'numeric', 'min:0', 'max:24'],
                'new_category'       => ['nullable', 'string', 'max:50'],
            ];
        } else {
            $rules['appliance_id'] = [
                'required',
                // must be one of MY appliances
                Rule::exists('appliances', 'id')->where('household_id', $this->household()->id),
                // and not already in this plan
                Rule::unique('plan_items', 'appliance_id')
                    ->where('energy_plan_id', $plan->id)
                    ->ignore($item?->id),
            ];
        }

        return $rules;
    }

    private function applianceOptions()
    {
        return $this->household()->appliances()->orderBy('appliance_name')->get(['id', 'appliance_name']);
    }

    public function create(EnergyPlan $plan)
    {
        $this->check($plan);

        return Inertia::render('household/plans/items/create', [
            'plan'       => $plan->only(['id', 'plan_name']),
            'appliances' => $this->applianceOptions(),
        ]);
    }

    public function store(Request $request, EnergyPlan $plan)
    {
        $this->check($plan);

        $isNew = $request->input('appliance_id') === 'new';
        $data = $request->validate($this->rules($plan, null, $isNew));

        if ($isNew) {
            // Save the new appliance in the household's own list first
            $appliance = $this->household()->appliances()->create([
                'appliance_name' => $data['new_appliance_name'],
                'wattage'        => $data['new_wattage'],
                'quantity'       => $data['new_quantity'],
                'hours_per_day'  => $data['new_hours_per_day'],
                'category'       => $data['new_category'] ?? null,
            ]);
            $data['appliance_id'] = $appliance->id;
        }

        $plan->planItems()->create([
            'appliance_id'          => $data['appliance_id'],
            'planned_hours_per_day' => $data['planned_hours_per_day'],
            'priority'              => $data['priority'],
        ]);

        return redirect()->route('household.plans.show', $plan);
    }

    public function edit(EnergyPlan $plan, PlanItem $item)
    {
        $this->check($plan, $item);

        return Inertia::render('household/plans/items/edit', [
            'plan'       => $plan->only(['id', 'plan_name']),
            'item'       => $item,
            'appliances' => $this->applianceOptions(),
        ]);
    }

    public function update(Request $request, EnergyPlan $plan, PlanItem $item)
    {
        $this->check($plan, $item);
        $data = $request->validate($this->rules($plan, $item));
        $item->update($data);

        return redirect()->route('household.plans.show', $plan);
    }

    public function destroy(EnergyPlan $plan, PlanItem $item)
    {
        $this->check($plan, $item);
        $item->delete();

        return redirect()->route('household.plans.show', $plan);
    }
}