<?php

use App\Models\Appliance;
use App\Models\EnergyPlan;
use App\Models\Household;
use App\Models\User;
use Illuminate\Support\Facades\Schema;

test('plan_items.priority is a string column, not an integer', function () {
    $column = collect(Schema::getColumns('plan_items'))->firstWhere('name', 'priority');

    expect($column['type_name'])->toBe('varchar');
});

test('a plan item keeps its high, medium or low priority label', function () {
    $user = User::factory()->create(['role' => 'household']);
    $household = Household::create(['user_id' => $user->id, 'address' => 'Test address']);
    $appliance = Appliance::create([
        'household_id' => $household->id,
        'appliance_name' => 'Electric Fan',
        'wattage' => 60,
        'quantity' => 1,
        'hours_per_day' => 10,
    ]);
    $plan = EnergyPlan::create([
        'household_id' => $household->id,
        'plan_name' => 'Saving Plan',
        'monthly_kwh_target' => 300,
        'monthly_budget' => 3600,
        'start_date' => '2026-11-01',
        'end_date' => '2026-11-30',
    ]);

    $this->actingAs($user)
        ->post("/household/plans/{$plan->id}/items", [
            'appliance_id' => $appliance->id,
            'planned_hours_per_day' => '8',
            'priority' => 'high',
        ])
        ->assertSessionHasNoErrors();

    expect($plan->planItems()->first()->priority)->toBe('high');
});
