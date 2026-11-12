<?php

use App\Http\Controllers\Admin\EnergyTipController;
use App\Http\Controllers\Household\TipController;
use App\Http\Controllers\Household\EnergyPlanController;
use App\Http\Controllers\Household\PlanItemController;
use App\Http\Controllers\Household\MeterController;
use App\Http\Controllers\Household\UsageRecordController;
use App\Http\Controllers\Household\ApplianceController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Middleware\EnsureTeamMembership;
use App\Models\EnergyTip;
use App\Models\ServiceRequest;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::inertia('/', 'welcome')->name('home');

// ROLE PAGES FIRST, so /admin/dashboard is not mistaken for /{current_team}/dashboard 

// ADMIN
Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('admin/dashboard', [
            'stats' => [
                'users'    => User::count(),
                'tips'     => EnergyTip::count(),
                'requests' => ServiceRequest::count(),
            ],
        ]);
    })->name('dashboard');
        Route::resource('tips', EnergyTipController::class)->except(['show']);
});

// HOUSEHOLD
Route::middleware(['auth', 'verified', 'role:household'])->prefix('household')->name('household.')->group(function () {
    Route::get('dashboard', function () {
        $household = Auth::user()->household;

        return Inertia::render('household/dashboard', [
            'stats' => [
                'meters'     => $household?->meters()->count() ?? 0,
                'appliances' => $household?->appliances()->count() ?? 0,
                'plans'      => $household?->energyPlans()->count() ?? 0,
            ],
        ]);
    })->name('dashboard');
    Route::resource('appliances', ApplianceController::class)->except(['show']);
    Route::resource('meters', MeterController::class)->except(['show']);
    Route::resource('meters.usage', UsageRecordController::class)->except(['show']);
    Route::resource('plans', EnergyPlanController::class);
    Route::resource('plans.items', PlanItemController::class)->except(['index', 'show']);
    Route::get('tips', [TipController::class, 'index'])->name('tips.index');
    Route::get('saved-tips', [TipController::class, 'saved'])->name('tips.saved');
    Route::post('tips/{tip}/save', [TipController::class, 'save'])->name('tips.save');
    Route::delete('tips/{tip}/save', [TipController::class, 'unsave'])->name('tips.unsave');
});

// ELECTRICIAN
Route::middleware(['auth', 'verified', 'role:electrician'])->prefix('electrician')->name('electrician.')->group(function () {
    Route::get('dashboard', function () {
        $electrician = Auth::user()->electrician;

        return Inertia::render('electrician/dashboard', [
            'stats' => [
                'assigned' => $electrician?->serviceRequests()->where('status', 'assigned')->count() ?? 0,
                'resolved' => $electrician?->serviceRequests()->where('status', 'resolved')->count() ?? 0,
            ],
        ]);
    })->name('dashboard');
});

// The starter kit's team dashboard, now redirecting each role to its own page
Route::prefix('{current_team}')
    ->middleware(['auth', 'verified', EnsureTeamMembership::class])
    ->group(function () {
        Route::get('dashboard', function () {
            return redirect()->route(match (Auth::user()->role) {
                'admin'       => 'admin.dashboard',
                'electrician' => 'electrician.dashboard',
                default       => 'household.dashboard',
            });
        })->name('dashboard');
    });

Route::middleware(['auth'])->group(function () {
    Route::post('invitations/{invitation}/accept', [TeamInvitationController::class, 'accept'])->name('invitations.accept');
    Route::delete('invitations/{invitation}', [TeamInvitationController::class, 'decline'])->name('invitations.decline');
});

require __DIR__.'/settings.php';