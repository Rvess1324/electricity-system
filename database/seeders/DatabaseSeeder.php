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
        foreach ([['2026-10-01', 8.5], ['2026-10-02', 9.2], ['2026-10-03', 7.8]] as [$date, $kwh]) {
            $meter->usageRecords()->create([
                'usage_date' => $date, 'kwh_used' => $kwh, 'estimated_cost' => $kwh * 12, // 12 per kWh for testing
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
            'plan_name' => 'November Saving Plan', 'monthly_kwh_target' => 200, 'monthly_budget' => 2400,
            'start_date' => '2026-11-01', 'end_date' => '2026-11-30',
        ]);
        $plan->planItems()->create(['appliance_id' => $fridge->id, 'planned_hours_per_day' => 24, 'priority' => 1]);
        $plan->planItems()->create(['appliance_id' => $fan->id, 'planned_hours_per_day' => 8, 'priority' => 2]);

        // Tips by admin, one saved by the household
        $tip1 = $admin->energyTips()->create([
            'title' => 'Unplug idle devices',
            'description' => 'Devices on standby still use power. Unplug chargers and TVs when not in use.',
            'category' => 'General',
        ]);
        $admin->energyTips()->create([
            'title' => 'Set AC to 25°C',
            'description' => 'Each degree lower increases power use noticeably.',
            'category' => 'Cooling',
        ]);
        $household->savedTips()->attach($tip1->id);

        // Service request assigned to the electrician
        ServiceRequest::create([
            'household_id' => $household->id, 'meter_id' => $meter->id, 'electrician_id' => $electrician->id,
            'issue_description' => 'Meter display is flickering.', 'status' => 'assigned',
            'requested_date' => '2026-11-05',
        ]);
    }
}