<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Appliance;
use App\Models\Electrician;
use App\Models\EnergyPlan;
use App\Models\EnergyTip;
use App\Models\Household;
use App\Models\PlanItem;
use App\Models\ServiceRequest;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // The factory sets password = "password" (hashed) and marks the email as verified
        $adminUser = User::factory()->create([
            'name' => 'Admin User', 'email' => 'admin@example.com', 'role' => 'admin',
        ]);
        $houseUser = User::factory()->create([
            'name' => 'Juan Dela Cruz', 'email' => 'household@example.com', 'role' => 'household',
        ]);
        $elecUser = User::factory()->create([
            'name' => 'Pedro Santos', 'email' => 'electrician@example.com', 'role' => 'electrician',
        ]);

        $admin = Admin::create(['user_id' => $adminUser->id, 'permissions' => 'all']);
        $household = Household::create([
            'user_id' => $houseUser->id, 'address' => 'Zamboanga City', 'phone_no' => '09123456789',
        ]);
        $electrician = Electrician::create([
            'user_id' => $elecUser->id, 'license_no' => 'EL-2024-001', 'specialization' => 'Residential wiring',
        ]);

        // Meter and usage
        $meter = $household->meters()->create([
            'meter_no' => 'MTR-1001', 'meter_type' => 'Single-phase', 'installation_date' => '2024-01-15',
        ]);
        // 14 days of usage ending today, so dashboards and plans always show real numbers
        $kwhPerDay = [8.5, 9.2, 7.8, 8.1, 9.0, 8.7, 7.5, 9.4, 8.3, 8.8, 7.9, 9.1, 8.6, 8.0];
        foreach ($kwhPerDay as $i => $kwh) {
            $meter->usageRecords()->create([
                'usage_date'     => now()->subDays(13 - $i)->toDateString(),
                'kwh_used'       => $kwh,
                'estimated_cost' => $kwh * 12, // 12 per kWh, matches ELECTRICITY_RATE
            ]);
        }

        // Appliances, plan, plan items
        $fridge = $household->appliances()->create([
            'appliance_name' => 'Refrigerator', 'wattage' => 150, 'hours_per_day' => 24, 'category' => 'Kitchen',
        ]);
        $fan = $household->appliances()->create([
            'appliance_name' => 'Electric Fan', 'wattage' => 60, 'hours_per_day' => 10, 'category' => 'Cooling',
        ]);
        $plan = $household->energyPlans()->create([
            'plan_name' => 'Monthly Saving Plan', 'monthly_kwh_target' => 300, 'monthly_budget' => 3600,
            'start_date' => now()->startOfMonth()->toDateString(),
            'end_date'   => now()->endOfMonth()->toDateString(),
        ]);
        $plan->planItems()->create(['appliance_id' => $fridge->id, 'planned_hours_per_day' => 24, 'priority' => 'high']);
        $plan->planItems()->create(['appliance_id' => $fan->id, 'planned_hours_per_day' => 8, 'priority' => 'medium']);

        // Tips by admin, one saved by the household
        $tip1 = $admin->energyTips()->create([
            'title' => 'Unplug idle devices',
            'description' => 'Devices on standby still use power. Unplug chargers and TVs when not in use.',
            'category' => 'Other',
        ]);
        $admin->energyTips()->create([
            'title' => 'Set AC to 25°C',
            'description' => 'Each degree lower increases power use noticeably.',
            'category' => 'Cooling',
        ]);
        $household->savedTips()->attach($tip1->id);

        // Service request assigned to the electrician
        // A pending request, so the admin has something to assign
        ServiceRequest::create([
            'household_id' => $household->id, 'meter_id' => $meter->id,
            'issue_description' => 'Sparks near the meter box.', 'status' => 'pending',
            'requested_date' => now()->toDateString(),
        ]);
    }
}