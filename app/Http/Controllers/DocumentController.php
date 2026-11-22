<?php

namespace App\Http\Controllers;

use App\Models\ElectricianDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentController extends Controller
{
    /**
     * Private documents: only the owner and admins can download them.
     */
    public function show(Request $request, ElectricianDocument $document): StreamedResponse
    {
        $user = $request->user();
        $isOwner = $user->electrician?->id === $document->electrician_id;

        abort_unless($isOwner || $user->role === 'admin', 403);

        return Storage::disk(config('filesystems.documents_disk'))
            ->download($document->path, $document->original_name);
    }
}
