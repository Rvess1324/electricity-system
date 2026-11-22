<?php

namespace Database\Seeders;

use App\Actions\Admin\DeleteAccount;
use App\Actions\Teams\CreateTeam;
use App\Models\Admin;
use App\Models\Electrician;
use App\Models\Household;
use App\Models\ServiceRequest;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Never create well-known demo accounts on a live site by accident.
        if (! app()->environment(['local', 'testing']) && ! config('app.seed_demo')) {
            $this->createAdminFromConfig();
            $this->removeDemoAccounts();

            return;
        }

        if (User::where('email', 'admin@example.com')->exists()) {
            return;
        }

        $adminUser = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'role' => 'admin',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);
        $houseUser = User::create([
            'name' => 'Juan Dela Cruz',
            'email' => 'household@example.com',
            'role' => 'household',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);
        $elecUser = User::create([
            'name' => 'Pedro Santos',
            'email' => 'electrician@example.com',
            'role' => 'electrician',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        // Starter kit requires a personal team for every user
        $createTeam = app(CreateTeam::class);
        foreach ([$adminUser, $houseUser, $elecUser] as $user) {
            $createTeam->handle($user, "{$user->name}'s Team", isPersonal: true);
        }

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
                'usage_date' => now()->subDays(13 - $i)->toDateString(),
                'kwh_used' => $kwh,
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
            'end_date' => now()->endOfMonth()->toDateString(),
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

    /**
     * Create the real administrator from ADMIN_EMAIL / ADMIN_PASSWORD, once.
     */
    /**
     * The demo accounts share a well-known password. Where demo data is off
     * (production), remove them if an earlier deploy created them.
     */
    private function removeDemoAccounts(): void
    {
        $keep = config('app.admin_email');

        User::whereIn('email', ['admin@example.com', 'household@example.com', 'electrician@example.com'])
            ->when(is_string($keep) && $keep !== '', fn ($query) => $query->where('email', '!=', $keep))
            ->get()
            ->each(fn (User $user) => app(DeleteAccount::class)->handle($user));
    }

    private function createAdminFromConfig(): void
    {
        $email = config('app.admin_email');
        $password = config('app.admin_password');

        if (! is_string($email) || ! is_string($password) || $email === '' || $password === '') {
            return;
        }

        if (User::where('email', $email)->exists()) {
            return;
        }

        $user = User::create([
            'name' => 'Administrator',
            'email' => $email,
            'role' => 'admin',
            'password' => Hash::make($password),
            'email_verified_at' => now(),
        ]);

        app(CreateTeam::class)->handle($user, "{$user->name}'s Team", isPersonal: true);
        Admin::create(['user_id' => $user->id, 'permissions' => 'all']);
    }
}
