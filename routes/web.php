<?php

use App\Http\Controllers\Admin\ElectricianController;
use App\Http\Controllers\Admin\ElectricianReviewController;
use App\Http\Controllers\Admin\EnergyTipController;
use App\Http\Controllers\Admin\HouseholdController;
use App\Http\Controllers\Admin\ServiceRequestController as AdminServiceRequestController;
use App\Http\Controllers\Admin\UserVerificationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\Electrician\ApplicationController as ElectricianApplicationController;
use App\Http\Controllers\Electrician\ServiceRequestController as ElectricianServiceRequestController;
use App\Http\Controllers\Household\ApplianceController;
use App\Http\Controllers\Household\EnergyPlanController;
use App\Http\Controllers\Household\MeterController;
use App\Http\Controllers\Household\PlanItemController;
use App\Http\Controllers\Household\ServiceRequestController as HouseholdServiceRequestController;
use App\Http\Controllers\Household\TipController;
use App\Http\Controllers\Household\UsageRecordController;
use App\Http\Controllers\NotificationController;
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
    Route::resource('electricians', ElectricianController::class)->except(['show']);
    Route::get('electricians/{electrician}/review', [ElectricianReviewController::class, 'show'])->name('electricians.review');
    Route::post('electricians/{electrician}/approve', [ElectricianReviewController::class, 'approve'])->name('electricians.approve');
    Route::post('electricians/{electrician}/reject', [ElectricianReviewController::class, 'reject'])->name('electricians.reject');
    Route::post('electricians/{electrician}/suspend', [ElectricianReviewController::class, 'suspend'])->name('electricians.suspend');
    Route::post('electricians/{electrician}/reinstate', [ElectricianReviewController::class, 'reinstate'])->name('electricians.reinstate');
    Route::resource('households', HouseholdController::class)->only(['index', 'edit', 'update', 'destroy']);
    Route::post('users/{user}/verify-email', [UserVerificationController::class, 'store'])->name('users.verify-email');
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
    // Open to every electrician, so an applicant can follow and fix the application
    Route::get('application', [ElectricianApplicationController::class, 'show'])->name('application');
    Route::post('application/documents', [ElectricianApplicationController::class, 'storeDocument'])->name('application.documents.store');
    Route::delete('application/documents/{document}', [ElectricianApplicationController::class, 'destroyDocument'])->name('application.documents.destroy');
    Route::post('application/resubmit', [ElectricianApplicationController::class, 'resubmit'])->name('application.resubmit');

    // Only approved electricians can take jobs
    Route::middleware('electrician.approved')->group(function () {
        Route::get('dashboard', [DashboardController::class, 'electrician'])->name('dashboard');
        Route::get('requests', [ElectricianServiceRequestController::class, 'index'])->name('requests.index');
        Route::patch('requests/{serviceRequest}/start', [ElectricianServiceRequestController::class, 'start'])->name('requests.start');
        Route::patch('requests/{serviceRequest}/resolve', [ElectricianServiceRequestController::class, 'resolve'])->name('requests.resolve');
    });
});

// In-app notifications for every signed-in user
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('notifications/read', [NotificationController::class, 'readAll'])->name('notifications.read');
});

// Private documents; the controller allows only the owner and admins
Route::middleware(['auth', 'verified'])->get('documents/{document}', [DocumentController::class, 'show'])->name('documents.show');

// The starter kit's team dashboard, now redirecting each role to its own page
Route::prefix('{current_team}')
    ->middleware(['auth', 'verified', EnsureTeamMembership::class])
    ->group(function () {
        Route::get('dashboard', function () {
            return redirect()->route(match (Auth::user()->role) {
                'admin' => 'admin.dashboard',
                'electrician' => 'electrician.dashboard',
                default => 'household.dashboard',
            });
        })->name('dashboard');
    });

Route::middleware(['auth'])->group(function () {
    Route::post('invitations/{invitation}/accept', [TeamInvitationController::class, 'accept'])->name('invitations.accept');
    Route::delete('invitations/{invitation}', [TeamInvitationController::class, 'decline'])->name('invitations.decline');
});

require __DIR__.'/settings.php';
