<?php

namespace App\Actions\Documents;

use App\Models\Electrician;
use App\Models\ElectricianDocument;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Stores private electrician documents either on a filesystem disk (local, s3/R2)
 * or, when DOCUMENTS_DISK=database, inside the database. The database mode needs no
 * extra service and survives Render redeploys; it is meant for small files.
 */
class DocumentStorage
{
    private function disk(): string
    {
        return (string) config('filesystems.documents_disk');
    }

    private function usesDatabase(): bool
    {
        return $this->disk() === 'database';
    }

    public function store(Electrician $electrician, string $type, UploadedFile $file): ElectricianDocument
    {
        $attributes = [
            'type' => $type,
            'original_name' => $file->getClientOriginalName(),
            'mime' => (string) $file->getMimeType(),
            'size' => (int) $file->getSize(),
        ];

        if ($this->usesDatabase()) {
            $attributes['contents'] = base64_encode((string) $file->get());
        } else {
            $attributes['path'] = $file->store("electrician-documents/{$electrician->id}", $this->disk());
        }

        return $electrician->documents()->create($attributes);
    }

    public function download(ElectricianDocument $document): StreamedResponse
    {
        if ($document->contents !== null) {
            return response()->streamDownload(
                fn () => print base64_decode($document->contents),
                $document->original_name,
                ['Content-Type' => $document->mime, 'X-Content-Type-Options' => 'nosniff'],
            );
        }

        return Storage::disk($this->disk())->download((string) $document->path, $document->original_name);
    }

    /** Removes the stored file. Database contents go away with the row itself. */
    public function deleteFile(ElectricianDocument $document): void
    {
        if ($document->path !== null) {
            Storage::disk($this->disk())->delete($document->path);
        }
    }
}
