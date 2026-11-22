<?php

namespace App\Actions\Admin;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

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
            $user->electrician?->documents->each(
                fn ($document) => Storage::disk(config('filesystems.documents_disk'))->delete($document->path),
            );

            $user->delete();
            $personalTeam?->delete();
        });
    }
}
