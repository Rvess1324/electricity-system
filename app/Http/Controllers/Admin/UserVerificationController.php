<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class UserVerificationController extends Controller
{
    /**
     * Lets an admin confirm an email address by hand, for example while the site
     * cannot send verification emails yet. Admin accounts are never touched here.
     */
    public function store(User $user): RedirectResponse
    {
        abort_if($user->role === 'admin', 403);

        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => "{$user->name}'s email was marked as verified."]);

        return back();
    }
}
