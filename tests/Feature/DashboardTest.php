<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $this->get('/household/dashboard')->assertRedirect(route('login'));
});

test('household users are sent to the household dashboard', function () {
    $user = User::factory()->create(['role' => 'household']);

    $this->actingAs($user)->get(route('dashboard'))
        ->assertRedirect(route('household.dashboard'));
});

test('admins are sent to the admin dashboard', function () {
    $user = User::factory()->create(['role' => 'admin']);

    $this->actingAs($user)->get(route('dashboard'))
        ->assertRedirect(route('admin.dashboard'));
});

test('electricians are sent to the electrician dashboard', function () {
    $user = User::factory()->create(['role' => 'electrician']);

    $this->actingAs($user)->get(route('dashboard'))
        ->assertRedirect(route('electrician.dashboard'));
});

test('a household cannot open the admin dashboard', function () {
    $user = User::factory()->create(['role' => 'household']);

    $this->actingAs($user)->get('/admin/dashboard')->assertForbidden();
});