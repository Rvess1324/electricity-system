<?php

use App\Models\Electrician;
use App\Models\Household;
use App\Models\Meter;
use App\Models\ServiceRequest;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function adminUser(): User
{
    return User::factory()->create(['role' => 'admin']);
}

function adminTestElectrician(string $name = 'Eli Electric'): Electrician
{
    $user = User::factory()->create(['role' => 'electrician', 'name' => $name]);

    return Electrician::create(['user_id' => $user->id, 'license_no' => 'LIC-'.$user->id]);
}

function adminTestHousehold(string $name = 'Hannah Home'): Household
{
    $user = User::factory()->create(['role' => 'household', 'name' => $name]);

    return Household::create(['user_id' => $user->id, 'address' => '1 Test Street']);
}

test('only admins can open the electrician and household lists', function () {
    $household = adminTestHousehold();

    foreach (['/admin/electricians', '/admin/households'] as $url) {
        $this->actingAs($household->user)->get($url)->assertForbidden();
        $this->actingAs(adminUser())->get($url)->assertOk();
    }
});

test('guests are redirected away from the admin management pages', function () {
    $this->get('/admin/electricians')->assertRedirect();
    $this->post('/admin/electricians', [])->assertRedirect();
});

test('non-admins cannot create or delete accounts', function () {
    $household = adminTestHousehold();
    $electrician = adminTestElectrician();

    $this->actingAs($household->user)->post('/admin/electricians', [])->assertForbidden();
    $this->actingAs($household->user)->delete("/admin/electricians/{$electrician->id}")->assertForbidden();
    $this->actingAs($electrician->user)->delete("/admin/households/{$household->id}")->assertForbidden();
});

test('an admin can create an electrician account that is verified and has a team', function () {
    $this->actingAs(adminUser())->post('/admin/electricians', [
        'name' => 'New Sparky',
        'email' => 'Sparky@Example.com',
        'license_no' => 'LIC-9',
        'specialization' => 'Wiring',
        'password' => 'a-Strong-Passw0rd!',
    ])->assertRedirect('/admin/electricians');

    $user = User::where('email', 'sparky@example.com')->firstOrFail();

    expect($user->role)->toBe('electrician')
        ->and($user->email_verified_at)->not->toBeNull()
        ->and($user->personalTeam())->not->toBeNull()
        ->and($user->electrician->license_no)->toBe('LIC-9');
});

test('creating an electrician validates input and rejects duplicate emails', function () {
    $existing = adminTestElectrician();

    $this->actingAs(adminUser())
        ->post('/admin/electricians', [
            'name' => '',
            'email' => $existing->user->email,
            'license_no' => '',
            'password' => 'short',
        ])
        ->assertSessionHasErrors(['name', 'email', 'license_no', 'password']);
});

test('an admin can update an electrician and keep the password when left blank', function () {
    $electrician = adminTestElectrician();
    $oldHash = $electrician->user->password;

    $this->actingAs(adminUser())->put("/admin/electricians/{$electrician->id}", [
        'name' => 'Renamed',
        'email' => $electrician->user->email,
        'license_no' => 'LIC-NEW',
        'specialization' => '',
        'password' => '',
    ])->assertRedirect('/admin/electricians');

    $electrician->refresh();
    expect($electrician->user->name)->toBe('Renamed')
        ->and($electrician->license_no)->toBe('LIC-NEW')
        ->and($electrician->specialization)->toBeNull()
        ->and($electrician->user->password)->toBe($oldHash);
});

test('the electrician list is searchable and paginated', function () {
    foreach (range(1, 12) as $i) {
        adminTestElectrician("Bulk Electrician {$i}");
    }
    adminTestElectrician('Zed Unique');
    $admin = adminUser();

    $this->actingAs($admin)->get('/admin/electricians')
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/electricians/index')
            ->has('electricians.data', 10)
            ->where('electricians.total', 13));

    $this->actingAs($admin)->get('/admin/electricians?q=Zed')
        ->assertInertia(fn (Assert $page) => $page
            ->has('electricians.data', 1)
            ->where('electricians.data.0.name', 'Zed Unique'));
});

test('deleting an electrician removes the account and unassigns nothing else', function () {
    $electrician = adminTestElectrician();
    $other = adminTestElectrician('Other');

    $this->actingAs(adminUser())->delete("/admin/electricians/{$electrician->id}")
        ->assertRedirect('/admin/electricians');

    expect(User::find($electrician->user_id))->toBeNull()
        ->and(Electrician::find($electrician->id))->toBeNull()
        ->and(Electrician::find($other->id))->not->toBeNull();
});

test('an electrician with assigned jobs cannot be deleted', function () {
    $electrician = adminTestElectrician();
    $household = adminTestHousehold();
    $meter = Meter::create([
        'household_id' => $household->id,
        'meter_no' => 'MTR-ADM-1',
        'meter_type' => 'Single-phase',
        'installation_date' => '2024-01-01',
    ]);
    ServiceRequest::create([
        'household_id' => $household->id,
        'meter_id' => $meter->id,
        'electrician_id' => $electrician->id,
        'issue_description' => 'Buzzing',
        'status' => 'assigned',
        'requested_date' => now()->toDateString(),
    ]);

    $this->actingAs(adminUser())->delete("/admin/electricians/{$electrician->id}")->assertRedirect();

    expect(Electrician::find($electrician->id))->not->toBeNull();
});

test('an admin can update a household and cannot reuse another email', function () {
    $household = adminTestHousehold();
    $other = adminTestHousehold('Other Home');
    $admin = adminUser();

    $this->actingAs($admin)->put("/admin/households/{$household->id}", [
        'name' => 'Renamed Home',
        'email' => $other->user->email,
        'address' => 'New Address',
    ])->assertSessionHasErrors('email');

    $this->actingAs($admin)->put("/admin/households/{$household->id}", [
        'name' => 'Renamed Home',
        'email' => $household->user->email,
        'address' => 'New Address',
        'phone_no' => '0917',
    ])->assertRedirect('/admin/households');

    $household->refresh();
    expect($household->user->name)->toBe('Renamed Home')
        ->and($household->address)->toBe('New Address');
});

test('the household list is searchable by name', function () {
    adminTestHousehold('Findable Family');
    adminTestHousehold('Someone Else');

    $this->actingAs(adminUser())->get('/admin/households?q=Findable')
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/households/index')
            ->has('households.data', 1)
            ->where('households.data.0.name', 'Findable Family'));
});

test('deleting a household removes the user and its meters and requests', function () {
    $household = adminTestHousehold();
    $meter = Meter::create([
        'household_id' => $household->id,
        'meter_no' => 'MTR-ADM-2',
        'meter_type' => 'Single-phase',
        'installation_date' => '2024-01-01',
    ]);
    $request = ServiceRequest::create([
        'household_id' => $household->id,
        'meter_id' => $meter->id,
        'issue_description' => 'Flicker',
        'status' => 'pending',
        'requested_date' => now()->toDateString(),
    ]);

    $this->actingAs(adminUser())->delete("/admin/households/{$household->id}")
        ->assertRedirect('/admin/households');

    expect(User::find($household->user_id))->toBeNull()
        ->and(Household::find($household->id))->toBeNull()
        ->and(Meter::find($meter->id))->toBeNull()
        ->and(ServiceRequest::find($request->id))->toBeNull();
});

test('two electricians cannot share a license number', function () {
    $existing = adminTestElectrician();

    $this->actingAs(adminUser())
        ->post('/admin/electricians', [
            'name' => 'Copycat',
            'email' => 'copycat@example.com',
            'license_no' => $existing->license_no,
            'password' => 'a-Strong-Passw0rd!',
        ])
        ->assertSessionHasErrors('license_no');
});
