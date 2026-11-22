<?php

namespace App\Http\Controllers;

use App\Actions\Documents\DocumentStorage;
use App\Models\ElectricianDocument;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentController extends Controller
{
    /**
     * Private documents: only the owner and admins can download them.
     */
    public function show(Request $request, ElectricianDocument $document, DocumentStorage $storage): StreamedResponse
    {
        $user = $request->user();
        $isOwner = $user->electrician?->id === $document->electrician_id;

        abort_unless($isOwner || $user->role === 'admin', 403);

        return $storage->download($document);
    }
}
