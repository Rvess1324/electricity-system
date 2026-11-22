<?php

namespace App\Actions\Admin;

use App\Actions\Documents\DocumentStorage;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DeleteAccount
{
    /**
     * Delete a user and the personal team created for them at sign-up.
     * Role rows (household, electrician) are removed by their foreign keys.
     */
    public function handle(User $user): void
    {
        DB::transaction(function () use ($user) {
            $personalTeam = $user->personalTeam();

            // Uploaded IDs and licenses live outside the database; remove them too
            $user->electrician?->documents()->get(['id', 'path'])->each(
                fn ($document) => app(DocumentStorage::class)->deleteFile($document),
            );

            $user->delete();
            $personalTeam?->delete();
        });
    }
}
