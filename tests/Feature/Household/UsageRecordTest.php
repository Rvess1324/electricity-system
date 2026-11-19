<?php

use App\Models\Household;
use App\Models\Meter;
use App\Models\User;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Carbon;

function householdWithMeter(string $meterNo = 'MTR-1001'): array
{
    $user = User::factory()->create(['role' => 'household']);
    $household = Household::create(['user_id' => $user->id, 'address' => 'Test address']);
    $meter = $household->meters()->create([
        'meter_no' => $meterNo,
        'meter_type' => 'Single-phase',
        'installation_date' => '2024-01-15',
    ]);

    return [$user, $meter];
}

function usageUrl(Meter $meter, ?int $recordId = null): string
{
    return "/household/meters/{$meter->id}/usage".($recordId ? "/{$recordId}" : '');
}

test('the app runs on Philippine time', function () {
    expect(config('app.timezone'))->toBe('Asia/Manila');
});

test('today in Manila is accepted even while it is still yesterday in UTC', function () {
    [$user, $meter] = householdWithMeter();

    // 20:00 UTC on the 19th is 04:00 on the 20th in Manila
    $this->travelTo(Carbon::parse('2026-11-19 20:00:00', 'UTC'));

    $this->actingAs($user)
        ->post(usageUrl($meter), ['usage_date' => '2026-11-20', 'kwh_used' => '8.5'])
        ->assertSessionHasNoErrors();

    $this->actingAs($user)
        ->post(usageUrl($meter), ['usage_date' => '2026-11-21', 'kwh_used' => '8.5'])
        ->assertSessionHasErrors('usage_date');

    expect($meter->usageRecords()->count())->toBe(1);
});

test('kwh with up to two decimals is stored with its cost', function () {
    [$user, $meter] = householdWithMeter();

    $this->actingAs($user)
        ->post(usageUrl($meter), ['usage_date' => '2026-01-10', 'kwh_used' => '8.25'])
        ->assertSessionHasNoErrors();

    $record = $meter->usageRecords()->first();

    expect((float) $record->kwh_used)->toBe(8.25)
        ->and((float) $record->estimated_cost)->toBe(99.0);
});

test('kwh with more than two decimals is rejected instead of rounded', function () {
    [$user, $meter] = householdWithMeter();

    $this->actingAs($user)
        ->post(usageUrl($meter), ['usage_date' => '2026-01-10', 'kwh_used' => '8.555'])
        ->assertSessionHasErrors('kwh_used');

    expect($meter->usageRecords()->count())->toBe(0);
});

test('a second reading for the same meter and date is rejected', function () {
    [$user, $meter] = householdWithMeter();
    $meter->usageRecords()->create(['usage_date' => '2026-01-10', 'kwh_used' => 8, 'estimated_cost' => 96]);

    $this->actingAs($user)
        ->post(usageUrl($meter), ['usage_date' => '2026-01-10', 'kwh_used' => '9'])
        ->assertSessionHasErrors('usage_date');

    expect($meter->usageRecords()->count())->toBe(1);
});

test('the same date is allowed on a different meter', function () {
    [$user, $meter] = householdWithMeter();
    $other = $meter->household->meters()->create([
        'meter_no' => 'MTR-1002',
        'meter_type' => 'Single-phase',
        'installation_date' => '2024-01-15',
    ]);
    $meter->usageRecords()->create(['usage_date' => '2026-01-10', 'kwh_used' => 8, 'estimated_cost' => 96]);

    $this->actingAs($user)
        ->post(usageUrl($other), ['usage_date' => '2026-01-10', 'kwh_used' => '9'])
        ->assertSessionHasNoErrors();

    expect($other->usageRecords()->count())->toBe(1);
});

test('editing a record may keep its own date but not take another record\'s date', function () {
    [$user, $meter] = householdWithMeter();
    $first = $meter->usageRecords()->create(['usage_date' => '2026-01-10', 'kwh_used' => 8, 'estimated_cost' => 96]);
    $meter->usageRecords()->create(['usage_date' => '2026-01-11', 'kwh_used' => 9, 'estimated_cost' => 108]);

    $this->actingAs($user)
        ->put(usageUrl($meter, $first->id), ['usage_date' => '2026-01-10', 'kwh_used' => '10'])
        ->assertSessionHasNoErrors();

    $this->actingAs($user)
        ->put(usageUrl($meter, $first->id), ['usage_date' => '2026-01-11', 'kwh_used' => '10'])
        ->assertSessionHasErrors('usage_date');

    expect((float) $first->fresh()->kwh_used)->toBe(10.0)
        ->and($first->fresh()->usage_date)->toStartWith('2026-01-10');
});

test('another household cannot add usage to my meter', function () {
    [, $meter] = householdWithMeter();
    $stranger = User::factory()->create(['role' => 'household']);

    $this->actingAs($stranger)
        ->post(usageUrl($meter), ['usage_date' => '2026-01-10', 'kwh_used' => '8'])
        ->assertForbidden();
});

test('the database itself refuses duplicate meter and date rows', function () {
    [, $meter] = householdWithMeter();
    $meter->usageRecords()->create(['usage_date' => '2026-01-10', 'kwh_used' => 8, 'estimated_cost' => 96]);

    expect(fn () => $meter->usageRecords()->create(['usage_date' => '2026-01-10', 'kwh_used' => 9, 'estimated_cost' => 108]))
        ->toThrow(UniqueConstraintViolationException::class);
});
