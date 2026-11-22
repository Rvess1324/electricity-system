<?php

use App\Models\User;
use Database\Seeders\DatabaseSeeder;

test('production does not create the well-known demo accounts', function () {
    app()->detectEnvironment(fn () => 'production');
    config(['app.seed_demo' => false, 'app.admin_email' => null, 'app.admin_password' => null]);

    app(DatabaseSeeder::class)->run();

    expect(User::where('email', 'admin@example.com')->exists())->toBeFalse();
    expect(User::count())->toBe(0);
});

test('production creates the real admin from configuration only', function () {
    app()->detectEnvironment(fn () => 'production');
    config([
        'app.seed_demo' => false,
        'app.admin_email' => 'owner@example.org',
        'app.admin_password' => 'a-long-unique-password',
    ]);

    app(DatabaseSeeder::class)->run();
    app(DatabaseSeeder::class)->run(); // running twice must not duplicate

    $admin = User::where('email', 'owner@example.org')->first();

    expect($admin)->not->toBeNull();
    expect($admin->role)->toBe('admin');
    expect(User::count())->toBe(1);
    expect(User::where('email', 'admin@example.com')->exists())->toBeFalse();
});

test('local environments still get the demo accounts', function () {
    app(DatabaseSeeder::class)->run();

    expect(User::where('email', 'admin@example.com')->exists())->toBeTrue();
});
