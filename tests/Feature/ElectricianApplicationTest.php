<?php

use App\Models\Electrician;
use App\Models\ElectricianDocument;
use App\Models\Household;
use App\Models\Meter;
use App\Models\ServiceRequest;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

function registrationData(array $overrides = []): array
{
    return $overrides + [
        'name' => 'New Person',
        'email' => 'new.person@example.com',
        'password' => 'a-Strong-Passw0rd!',
        'password_confirmation' => 'a-Strong-Passw0rd!',
        'role' => 'household',
        'phone_no' => '09123456789',
        'address' => '1 Test Street',
    ];
}

function electricianRegistration(array $overrides = []): array
{
    return registrationData($overrides + [
        'role' => 'electrician',
        'license_no' => 'PRC-12345',
        'qualification_type' => 'prc',
        'specialization' => 'Residential wiring',
        'years_experience' => 5,
        'service_area' => 'Zamboanga City',
        'previous_work' => 'Rewired 30 houses',
    ]);
}

function applicant(string $status = 'pending'): Electrician
{
    $user = User::factory()->create(['role' => 'electrician']);

    return Electrician::create([
        'user_id' => $user->id,
        'license_no' => 'LIC-'.$user->id,
        'status' => $status,
    ]);
}

function applicantDocument(Electrician $electrician, string $type = 'id'): ElectricianDocument
{
    $path = "electrician-documents/{$electrician->id}/{$type}.pdf";
    Storage::disk('local')->put($path, 'file contents');

    return $electrician->documents()->create([
        'type' => $type,
        'path' => $path,
        'original_name' => "{$type}.pdf",
        'mime' => 'application/pdf',
        'size' => 13,
    ]);
}

function applicationAdmin(): User
{
    return User::factory()->create(['role' => 'admin']);
}

beforeEach(fn () => Storage::fake('local'));

test('a household registers with a phone number and an address', function () {
    $this->post(route('register.store'), registrationData())->assertRedirect();

    $user = User::where('email', 'new.person@example.com')->firstOrFail();
    $household = Household::where('user_id', $user->id)->firstOrFail();

    expect($user->role)->toBe('household')
        ->and($household->phone_no)->toBe('09123456789')
        ->and($household->address)->toBe('1 Test Street')
        ->and(Electrician::where('user_id', $user->id)->exists())->toBeFalse();
});

test('an electrician registers and starts as a pending application', function () {
    $this->post(route('register.store'), electricianRegistration())->assertRedirect();

    $user = User::where('email', 'new.person@example.com')->firstOrFail();
    $electrician = Electrician::where('user_id', $user->id)->firstOrFail();

    expect($user->role)->toBe('electrician')
        ->and($electrician->status)->toBe('pending')
        ->and($electrician->license_no)->toBe('PRC-12345')
        ->and($electrician->qualification_type)->toBe('prc')
        ->and($electrician->years_experience)->toBe(5)
        ->and($electrician->service_area)->toBe('Zamboanga City')
        ->and(Household::where('user_id', $user->id)->exists())->toBeFalse();
});

test('an electrician must give the professional information', function () {
    $this->post(route('register.store'), registrationData(['role' => 'electrician']))
        ->assertSessionHasErrors(['license_no', 'qualification_type', 'years_experience', 'service_area']);

    expect(User::count())->toBe(0);
});

test('nobody can register as an admin or any other role', function () {
    foreach (['admin', 'superuser', ''] as $role) {
        $this->post(route('register.store'), registrationData(['role' => $role]))
            ->assertSessionHasErrors('role');
    }

    expect(User::count())->toBe(0);
});

test('a pending electrician is sent to the application page and cannot take jobs', function () {
    $electrician = applicant('pending');

    $this->actingAs($electrician->user)->get('/electrician/requests')->assertRedirect('/electrician/application');
    $this->actingAs($electrician->user)->get('/electrician/dashboard')->assertRedirect('/electrician/application');
    $this->actingAs($electrician->user)->get('/electrician/application')->assertOk();
});

test('rejected and suspended electricians cannot take jobs either', function () {
    foreach (['rejected', 'suspended'] as $status) {
        $electrician = applicant($status);

        $this->actingAs($electrician->user)->get('/electrician/requests')->assertRedirect('/electrician/application');
    }
});

test('an approved electrician can open the job pages', function () {
    $electrician = applicant('approved');

    $this->actingAs($electrician->user)->get('/electrician/requests')->assertOk();
    $this->actingAs($electrician->user)->get('/electrician/dashboard')->assertOk();
});

test('an applicant can upload a document and it is stored privately', function () {
    $electrician = applicant('pending');

    $this->actingAs($electrician->user)->post('/electrician/application/documents', [
        'type' => 'id',
        'file' => UploadedFile::fake()->create('my-id.pdf', 100, 'application/pdf'),
    ])->assertRedirect();

    $document = $electrician->documents()->firstOrFail();

    expect($document->type)->toBe('id')->and($document->original_name)->toBe('my-id.pdf');
    Storage::disk('local')->assertExists($document->path);
});

test('only safe file types and sizes are accepted', function () {
    $electrician = applicant('pending');

    $this->actingAs($electrician->user)->post('/electrician/application/documents', [
        'type' => 'id',
        'file' => UploadedFile::fake()->create('virus.exe', 10),
    ])->assertSessionHasErrors('file');

    $this->actingAs($electrician->user)->post('/electrician/application/documents', [
        'type' => 'id',
        'file' => UploadedFile::fake()->create('huge.pdf', 6000, 'application/pdf'),
    ])->assertSessionHasErrors('file');

    expect($electrician->documents()->count())->toBe(0);
});

test('an approved electrician cannot change the documents any more', function () {
    $electrician = applicant('approved');

    $this->actingAs($electrician->user)->post('/electrician/application/documents', [
        'type' => 'id',
        'file' => UploadedFile::fake()->create('id.pdf', 10, 'application/pdf'),
    ])->assertForbidden();
});

test('an applicant can remove only their own document', function () {
    $mine = applicant('pending');
    $other = applicant('pending');
    $myDocument = applicantDocument($mine);
    $otherDocument = applicantDocument($other);

    $this->actingAs($mine->user)->delete("/electrician/application/documents/{$otherDocument->id}")->assertForbidden();
    $this->actingAs($mine->user)->delete("/electrician/application/documents/{$myDocument->id}")->assertRedirect();

    expect(ElectricianDocument::find($myDocument->id))->toBeNull()
        ->and(ElectricianDocument::find($otherDocument->id))->not->toBeNull();
    Storage::disk('local')->assertMissing($myDocument->path);
});

test('documents can be downloaded only by the owner and admins', function () {
    $owner = applicant('pending');
    $document = applicantDocument($owner);
    $household = User::factory()->create(['role' => 'household']);

    $this->actingAs($owner->user)->get("/documents/{$document->id}")->assertOk();
    $this->actingAs(applicationAdmin())->get("/documents/{$document->id}")->assertOk();
    $this->actingAs(applicant('approved')->user)->get("/documents/{$document->id}")->assertForbidden();
    $this->actingAs($household)->get("/documents/{$document->id}")->assertForbidden();
});

test('guests cannot download documents', function () {
    $document = applicantDocument(applicant('pending'));

    $this->get("/documents/{$document->id}")->assertRedirect();
});

test('an admin cannot approve an application without an ID and a license document', function () {
    $electrician = applicant('pending');
    $admin = applicationAdmin();

    $this->actingAs($admin)->post("/admin/electricians/{$electrician->id}/approve")
        ->assertSessionHasErrors('status');
    expect($electrician->fresh()->status)->toBe('pending');

    applicantDocument($electrician, 'id');
    $this->actingAs($admin)->post("/admin/electricians/{$electrician->id}/approve")
        ->assertSessionHasErrors('status');

    applicantDocument($electrician, 'qualification');
    $this->actingAs($admin)->post("/admin/electricians/{$electrician->id}/approve")->assertRedirect();

    $electrician->refresh();
    expect($electrician->status)->toBe('approved')
        ->and($electrician->reviewed_by)->toBe($admin->id)
        ->and($electrician->reviewed_at)->not->toBeNull();
});

test('rejecting needs a reason, and the applicant can fix it and resubmit', function () {
    $electrician = applicant('pending');
    $admin = applicationAdmin();

    $this->actingAs($admin)->post("/admin/electricians/{$electrician->id}/reject", ['reason' => ''])
        ->assertSessionHasErrors('reason');

    $this->actingAs($admin)->post("/admin/electricians/{$electrician->id}/reject", ['reason' => 'The ID is blurry.'])
        ->assertRedirect();
    expect($electrician->fresh()->status)->toBe('rejected')
        ->and($electrician->fresh()->status_reason)->toBe('The ID is blurry.');

    // Resubmitting without the required documents is refused
    $this->actingAs($electrician->user)->post('/electrician/application/resubmit')
        ->assertSessionHasErrors('documents');

    applicantDocument($electrician, 'id');
    applicantDocument($electrician, 'qualification');
    $this->actingAs($electrician->user)->post('/electrician/application/resubmit')->assertRedirect();

    expect($electrician->fresh()->status)->toBe('pending')
        ->and($electrician->fresh()->status_reason)->toBeNull();
});

test('an admin can suspend and reinstate an approved electrician', function () {
    $electrician = applicant('approved');
    $admin = applicationAdmin();

    $this->actingAs($admin)->post("/admin/electricians/{$electrician->id}/suspend", ['reason' => 'Complaints received.'])
        ->assertRedirect();
    expect($electrician->fresh()->status)->toBe('suspended');
    $this->actingAs($electrician->user)->get('/electrician/requests')->assertRedirect('/electrician/application');

    $this->actingAs($admin)->post("/admin/electricians/{$electrician->id}/reinstate")->assertRedirect();
    expect($electrician->fresh()->status)->toBe('approved')
        ->and($electrician->fresh()->status_reason)->toBeNull();
});

test('only admins can review applications', function () {
    $electrician = applicant('pending');
    $household = User::factory()->create(['role' => 'household']);

    foreach (['approve', 'reject', 'suspend', 'reinstate'] as $action) {
        $this->actingAs($household)->post("/admin/electricians/{$electrician->id}/{$action}")->assertForbidden();
        $this->actingAs($electrician->user)->post("/admin/electricians/{$electrician->id}/{$action}")->assertForbidden();
    }

    $this->actingAs($electrician->user)->get("/admin/electricians/{$electrician->id}/review")->assertForbidden();
    expect($electrician->fresh()->status)->toBe('pending');
});

test('requests can be assigned only to approved electricians', function () {
    $householdUser = User::factory()->create(['role' => 'household']);
    $household = Household::create(['user_id' => $householdUser->id, 'address' => 'Somewhere']);
    $meter = Meter::create([
        'household_id' => $household->id,
        'meter_no' => 'MTR-APP-1',
        'meter_type' => 'Single-phase',
        'installation_date' => '2024-01-01',
    ]);
    $serviceRequest = ServiceRequest::create([
        'household_id' => $household->id,
        'meter_id' => $meter->id,
        'issue_description' => 'No power in the kitchen',
        'status' => 'pending',
        'requested_date' => now()->toDateString(),
    ]);
    $admin = applicationAdmin();
    $pending = applicant('pending');
    $approved = applicant('approved');

    $this->actingAs($admin)->patch("/admin/requests/{$serviceRequest->id}/assign", ['electrician_id' => $pending->id])
        ->assertSessionHasErrors('electrician_id');
    expect($serviceRequest->fresh()->status)->toBe('pending');

    $this->actingAs($admin)->patch("/admin/requests/{$serviceRequest->id}/assign", ['electrician_id' => $approved->id])
        ->assertRedirect();
    expect($serviceRequest->fresh()->electrician_id)->toBe($approved->id);
});

test('the admin list can be filtered by application status', function () {
    applicant('pending');
    applicant('approved');

    $this->actingAs(applicationAdmin())->get('/admin/electricians?status=pending')
        ->assertInertia(fn ($page) => $page
            ->component('admin/electricians/index')
            ->has('electricians.data', 1)
            ->where('electricians.data.0.status', 'pending'));
});

test('an electrician created by an admin is approved immediately', function () {
    $this->actingAs(applicationAdmin())->post('/admin/electricians', [
        'name' => 'Admin Made',
        'email' => 'admin.made@example.com',
        'license_no' => 'LIC-1',
        'password' => 'a-Strong-Passw0rd!',
    ])->assertRedirect('/admin/electricians');

    expect(User::where('email', 'admin.made@example.com')->first()->electrician->status)->toBe('approved');
});

test('deleting an electrician also deletes the uploaded files', function () {
    $electrician = applicant('pending');
    $document = applicantDocument($electrician);

    $this->actingAs(applicationAdmin())->delete("/admin/electricians/{$electrician->id}")->assertRedirect();

    Storage::disk('local')->assertMissing($document->path);
    expect(ElectricianDocument::count())->toBe(0);
});
