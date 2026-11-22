<?php

use App\Models\Electrician;
use App\Models\ElectricianDocument;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('local');
    config(['filesystems.documents_disk' => 'database']);
});

function freeHostingApplicant(): Electrician
{
    $user = User::factory()->create(['role' => 'electrician']);

    return Electrician::create(['user_id' => $user->id, 'license_no' => 'LIC-'.$user->id, 'status' => 'pending']);
}

test('an admin can mark an account as verified', function () {
    $user = User::factory()->unverified()->create(['role' => 'household']);
    $admin = User::factory()->create(['role' => 'admin']);

    $this->actingAs($admin)->post("/admin/users/{$user->id}/verify-email")->assertRedirect();

    expect($user->fresh()->hasVerifiedEmail())->toBeTrue();
});

test('only admins can mark an account as verified', function () {
    $user = User::factory()->unverified()->create(['role' => 'household']);
    $other = User::factory()->create(['role' => 'household']);

    $this->actingAs($other)->post("/admin/users/{$user->id}/verify-email")->assertForbidden();

    expect($user->fresh()->hasVerifiedEmail())->toBeFalse();
});

test('admin accounts cannot be touched by the verify button', function () {
    $target = User::factory()->unverified()->create(['role' => 'admin']);
    $admin = User::factory()->create(['role' => 'admin']);

    $this->actingAs($admin)->post("/admin/users/{$target->id}/verify-email")->assertForbidden();
});

test('documents can be stored in the database instead of on disk', function () {
    $electrician = freeHostingApplicant();

    $this->actingAs($electrician->user)->post('/electrician/application/documents', [
        'type' => 'id',
        'file' => UploadedFile::fake()->create('my-id.pdf', 10, 'application/pdf'),
    ])->assertRedirect();

    $document = $electrician->documents()->firstOrFail();

    expect($document->path)->toBeNull()
        ->and($document->contents)->not->toBeNull()
        ->and(Storage::disk('local')->allFiles())->toBe([]);
});

test('a database stored document downloads with its original bytes', function () {
    $electrician = freeHostingApplicant();
    $document = $electrician->documents()->create([
        'type' => 'id',
        'contents' => base64_encode('secret bytes'),
        'original_name' => 'id.pdf',
        'mime' => 'application/pdf',
        'size' => 12,
    ]);

    $response = $this->actingAs(User::factory()->create(['role' => 'admin']))->get("/documents/{$document->id}");

    $response->assertOk()->assertDownload('id.pdf');
    expect($response->streamedContent())->toBe('secret bytes');
});

test('document contents are never serialized', function () {
    $electrician = freeHostingApplicant();
    $document = $electrician->documents()->create([
        'type' => 'id',
        'contents' => base64_encode('x'),
        'original_name' => 'id.pdf',
        'mime' => 'application/pdf',
        'size' => 1,
    ]);

    expect($document->toArray())->not->toHaveKey('contents');
});

test('deleting an electrician with database stored documents works', function () {
    $electrician = freeHostingApplicant();
    $electrician->documents()->create([
        'type' => 'id',
        'contents' => base64_encode('x'),
        'original_name' => 'id.pdf',
        'mime' => 'application/pdf',
        'size' => 1,
    ]);

    $this->actingAs(User::factory()->create(['role' => 'admin']))
        ->delete("/admin/electricians/{$electrician->id}")->assertRedirect();

    expect(ElectricianDocument::count())->toBe(0);
});
