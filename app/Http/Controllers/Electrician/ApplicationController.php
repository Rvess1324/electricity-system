<?php

namespace App\Http\Controllers\Electrician;

use App\Http\Controllers\Controller;
use App\Models\Electrician;
use App\Models\ElectricianDocument;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ApplicationController extends Controller
{
    private const MAX_DOCUMENTS = 10;

    private function electrician(): Electrician
    {
        $electrician = Auth::user()->electrician;
        abort_unless($electrician, 403, 'No electrician profile is linked to this account.');

        return $electrician;
    }

    public function show(): Response
    {
        $electrician = $this->electrician();

        return Inertia::render('electrician/application', [
            'application' => [
                'status' => $electrician->status,
                'status_reason' => $electrician->status_reason,
                'license_no' => $electrician->license_no,
                'qualification_type' => $electrician->qualification_type,
                'specialization' => $electrician->specialization,
                'years_experience' => $electrician->years_experience,
                'service_area' => $electrician->service_area,
                'phone_no' => $electrician->phone_no,
                'address' => $electrician->address,
                'previous_work' => $electrician->previous_work,
                'has_required_documents' => $electrician->hasRequiredDocuments(),
            ],
            'documents' => $electrician->documents()->latest('id')->get()->map(fn (ElectricianDocument $document) => [
                'id' => $document->id,
                'type' => $document->type,
                'original_name' => $document->original_name,
                'size' => $document->size,
            ]),
            'documentTypes' => ElectricianDocument::TYPES,
        ]);
    }

    public function storeDocument(Request $request): RedirectResponse
    {
        $electrician = $this->electrician();
        abort_unless(
            in_array($electrician->status, [Electrician::PENDING, Electrician::REJECTED], true),
            403,
            'Documents can only be changed while the application is pending or rejected.',
        );

        $data = $request->validate([
            'type' => ['required', 'in:'.implode(',', ElectricianDocument::TYPES)],
            'file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ]);

        abort_if($electrician->documents()->count() >= self::MAX_DOCUMENTS, 422, 'You reached the limit of '.self::MAX_DOCUMENTS.' documents.');

        $file = $data['file'];
        $path = $file->store("electrician-documents/{$electrician->id}", config('filesystems.documents_disk'));

        $electrician->documents()->create([
            'type' => $data['type'],
            'path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime' => (string) $file->getMimeType(),
            'size' => $file->getSize(),
        ]);

        return back();
    }

    public function destroyDocument(ElectricianDocument $document): RedirectResponse
    {
        $electrician = $this->electrician();
        abort_unless($document->electrician_id === $electrician->id, 403);
        abort_unless(
            in_array($electrician->status, [Electrician::PENDING, Electrician::REJECTED], true),
            403,
            'Documents can only be changed while the application is pending or rejected.',
        );

        Storage::disk(config('filesystems.documents_disk'))->delete($document->path);
        $document->delete();

        return back();
    }

    /** A rejected applicant fixes the problem and sends the application back for review. */
    public function resubmit(): RedirectResponse
    {
        $electrician = $this->electrician();
        abort_unless($electrician->status === Electrician::REJECTED, 403);

        if (! $electrician->hasRequiredDocuments()) {
            return back()->withErrors(['documents' => 'Upload a valid ID and a license or certificate first.']);
        }

        $electrician->update(['status' => Electrician::PENDING, 'status_reason' => null]);

        return back();
    }
}
