<?php

use App\Http\Controllers\Admin\EnergyTipController;
use App\Http\Controllers\Admin\ServiceRequestController as AdminServiceRequestController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Electrician\ServiceRequestController as ElectricianServiceRequestController;
use App\Http\Controllers\Household\ApplianceController;
use App\Http\Controllers\Household\EnergyPlanController;
use App\Http\Controllers\Household\MeterController;
use App\Http\Controllers\Household\PlanItemController;
use App\Http\Controllers\Household\ServiceRequestController as HouseholdServiceRequestController;
use App\Http\Controllers\Household\TipController;
use App\Http\Controllers\Household\UsageRecordController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

// ROLE PAGES FIRST, so /admin/dashboard is not mistaken for /{current_team}/dashboard

// ADMIN
Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('dashboard', [DashboardController::class, 'admin'])->name('dashboard');
    Route::resource('tips', EnergyTipController::class)->except(['show']);
    Route::get('requests', [AdminServiceRequestController::class, 'index'])->name('requests.index');
    Route::patch('requests/{serviceRequest}/assign', [AdminServiceRequestController::class, 'assign'])->name('requests.assign');
});

// HOUSEHOLD
Route::middleware(['auth', 'verified', 'role:household'])->prefix('household')->name('household.')->group(function () {
    Route::get('dashboard', [DashboardController::class, 'household'])->name('dashboard');
    Route::resource('appliances', ApplianceController::class)->except(['show']);
    Route::resource('meters', MeterController::class)->except(['show']);
    Route::resource('meters.usage', UsageRecordController::class)->except(['show']);
    Route::resource('plans', EnergyPlanController::class);
    Route::resource('plans.items', PlanItemController::class)->except(['index', 'show']);
    Route::get('tips', [TipController::class, 'index'])->name('tips.index');
    Route::get('saved-tips', [TipController::class, 'saved'])->name('tips.saved');
    Route::post('tips/{tip}/save', [TipController::class, 'save'])->name('tips.save');
    Route::delete('tips/{tip}/save', [TipController::class, 'unsave'])->name('tips.unsave');
    Route::get('requests', [HouseholdServiceRequestController::class, 'index'])->name('requests.index');
    Route::get('requests/create', [HouseholdServiceRequestController::class, 'create'])->name('requests.create');
    Route::post('requests', [HouseholdServiceRequestController::class, 'store'])->name('requests.store');
    Route::delete('requests/{serviceRequest}', [HouseholdServiceRequestController::class, 'destroy'])->name('requests.destroy');
});

// ELECTRICIAN
Route::middleware(['auth', 'verified', 'role:electrician'])->prefix('electrician')->name('electrician.')->group(function () {
    Route::get('dashboard', [DashboardController::class, 'electrician'])->name('dashboard');
    Route::get('requests', [ElectricianServiceRequestController::class, 'index'])->name('requests.index');
    Route::patch('requests/{serviceRequest}/resolve', [ElectricianServiceRequestController::class, 'resolve'])->name('requests.resolve');
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