<?php

use App\Models\Electrician;
use App\Models\Household;
use App\Models\Meter;
use App\Models\ServiceRequest;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function makeHousehold(string $name = 'Household Owner'): array
{
    static $counter = 0;
    $counter++;

    $user = User::factory()->create(['role' => 'household', 'name' => $name]);
    $household = Household::create(['user_id' => $user->id, 'address' => 'Test Address']);
    $meter = Meter::create([
        'household_id' => $household->id,
        'meter_no' => 'MTR-T'.$counter,
        'meter_type' => 'Single-phase',
        'installation_date' => '2024-01-01',
    ]);

    return [$user, $household, $meter];
}

function makeRequest(Household $household, Meter $meter, array $attributes = []): ServiceRequest
{
    return ServiceRequest::create($attributes + [
        'household_id' => $household->id,
        'meter_id' => $meter->id,
        'issue_description' => 'Lights keep flickering',
        'status' => 'pending',
        'requested_date' => now()->toDateString(),
    ]);
}

function makeElectrician(): array
{
    $user = User::factory()->create(['role' => 'electrician']);
    $electrician = Electrician::create(['user_id' => $user->id, 'license_no' => 'EL-T-'.$user->id]);

    return [$user, $electrician];
}

test('the admin request list is paginated ten per page', function () {
    [, $household, $meter] = makeHousehold();
    foreach (range(1, 12) as $i) {
        makeRequest($household, $meter);
    }
    $admin = User::factory()->create(['role' => 'admin']);

    $this->actingAs($admin)->get('/admin/requests')
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/requests/index')
            ->has('requests.data', 10)
            ->where('requests.total', 12));
});

test('the admin request list can be filtered by status and searched', function () {
    [, $household, $meter] = makeHousehold('Maria Clara');
    [, $otherHousehold, $otherMeter] = makeHousehold('Jose Rizal');
    makeRequest($household, $meter, ['status' => 'assigned']);
    makeRequest($household, $meter);
    makeRequest($otherHousehold, $otherMeter);
    $admin = User::factory()->create(['role' => 'admin']);

    $this->actingAs($admin)->get('/admin/requests?status=assigned')
        ->assertInertia(fn (Assert $page) => $page->where('requests.total', 1));

    $this->actingAs($admin)->get('/admin/requests?q=Rizal')
        ->assertInertia(fn (Assert $page) => $page->where('requests.total', 1));
});

test('an electrician only sees requests assigned to them', function () {
    [, $household, $meter] = makeHousehold();
    [$userA, $electricianA] = makeElectrician();
    [, $electricianB] = makeElectrician();
    makeRequest($household, $meter, ['electrician_id' => $electricianA->id, 'status' => 'assigned']);
    makeRequest($household, $meter, ['electrician_id' => $electricianB->id, 'status' => 'assigned']);

    $this->actingAs($userA)->get('/electrician/requests')
        ->assertInertia(fn (Assert $page) => $page->where('requests.total', 1));
});

test('an electrician cannot resolve another electricians request', function () {
    [, $household, $meter] = makeHousehold();
    [$userA] = makeElectrician();
    [, $electricianB] = makeElectrician();
    $request = makeRequest($household, $meter, ['electrician_id' => $electricianB->id, 'status' => 'assigned']);

    $this->actingAs($userA)->patch("/electrician/requests/{$request->id}/resolve")->assertForbidden();

    expect($request->fresh()->status)->toBe('assigned');
});

test('a household only sees its own requests', function () {
    [$userA, $householdA, $meterA] = makeHousehold();
    [, $householdB, $meterB] = makeHousehold();
    makeRequest($householdA, $meterA);
    makeRequest($householdB, $meterB);

    $this->actingAs($userA)->get('/household/requests')
        ->assertInertia(fn (Assert $page) => $page->where('requests.total', 1));
});

test('a household cannot cancel another households request', function () {
    [$userA] = makeHousehold();
    [, $householdB, $meterB] = makeHousehold();
    $request = makeRequest($householdB, $meterB);

    $this->actingAs($userA)->delete("/household/requests/{$request->id}")->assertForbidden();

    expect(ServiceRequest::find($request->id))->not->toBeNull();
});

test('a household cannot open another households meter usage', function () {
    [$userA] = makeHousehold();
    [, , $meterB] = makeHousehold();

    $this->actingAs($userA)->get("/household/meters/{$meterB->id}/usage")->assertForbidden();
});
