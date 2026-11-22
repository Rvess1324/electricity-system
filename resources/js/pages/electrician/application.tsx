import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import PageHeader from '@/components/page-header';
import StatusBadge from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { useConfirm } from '@/hooks/use-confirm';
import {
    documentTypeLabels,
    formatSize,
    qualificationLabels,
} from '@/lib/electrician';

type Application = {
    status: string;
    status_reason: string | null;
    license_no: string;
    qualification_type: string | null;
    specialization: string | null;
    years_experience: number | null;
    service_area: string | null;
    phone_no: string | null;
    address: string | null;
    previous_work: string | null;
    has_required_documents: boolean;
};

type Document = {
    id: number;
    type: string;
    original_name: string;
    size: number;
};

const messages: Record<string, string> = {
    pending:
        'Your application is waiting for an admin to review it. Make sure your valid ID and your license or certificate are uploaded.',
    approved:
        'Your application is approved. You can now receive and resolve service requests.',
    rejected:
        'Your application was not approved. Fix the problem below, then send it for review again.',
    suspended:
        'Your account is suspended, so you cannot take new jobs. Contact the admin for details.',
};

export default function ApplicationPage({
    application,
    documents,
    documentTypes,
}: {
    application: Application;
    documents: Document[];
    documentTypes: string[];
}) {
    const { ask, dialog } = useConfirm();
    const [fileKey, setFileKey] = useState(0);
    const [resubmitError, setResubmitError] = useState<string | null>(null);

    const form = useForm<{ type: string; file: File | null }>({
        type: 'id',
        file: null,
    });

    const editable =
        application.status === 'pending' || application.status === 'rejected';

    function upload(e: FormEvent) {
        e.preventDefault();
        form.post('/electrician/application/documents', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.reset('file');
                setFileKey((key) => key + 1);
            },
        });
    }

    function remove(document: Document) {
        ask({
            title: 'Remove document',
            description: `Remove "${document.original_name}"?`,
            confirmLabel: 'Remove',
            destructive: true,
            onConfirm: () =>
                router.delete(
                    `/electrician/application/documents/${document.id}`,
                    { preserveScroll: true },
                ),
        });
    }

    function resubmit() {
        setResubmitError(null);
        router.post(
            '/electrician/application/resubmit',
            {},
            {
                preserveScroll: true,
                onError: (errors) =>
                    setResubmitError(errors.documents ?? 'Could not resubmit.'),
            },
        );
    }

    const details: [string, string | number | null][] = [
        ['Qualification', qualificationLabels[application.qualification_type ?? ''] ?? null],
        ['License or certificate no.', application.license_no],
        ['Specialization', application.specialization],
        ['Years of experience', application.years_experience],
        ['Service area', application.service_area],
        ['Phone', application.phone_no],
        ['Address', application.address],
    ];

    return (
        <>
            <Head title="My Application" />
            {dialog}
            <div className="max-w-3xl space-y-8 p-4 md:p-8">
                <PageHeader
                    title="My Application"
                    description="Your electrician application and supporting documents."
                    actions={<StatusBadge status={application.status} />}
                />

                <div className="rounded-xl border bg-card p-4 text-sm">
                    <p>{messages[application.status]}</p>
                    {application.status_reason && (
                        <p className="mt-2 font-medium">
                            Reason: {application.status_reason}
                        </p>
                    )}
                    {application.status === 'approved' && (
                        <Link
                            href="/electrician/requests"
                            className="mt-3 inline-block font-medium text-primary underline underline-offset-4"
                        >
                            Go to my requests
                        </Link>
                    )}
                </div>

                <section>
                    <h2 className="mb-3 text-lg font-semibold">Your details</h2>
                    <dl className="grid gap-3 rounded-xl border bg-card p-4 text-sm sm:grid-cols-2">
                        {details.map(([label, value]) => (
                            <div key={label}>
                                <dt className="text-muted-foreground">{label}</dt>
                                <dd className="font-medium">{value ?? '-'}</dd>
                            </div>
                        ))}
                        {application.previous_work && (
                            <div className="sm:col-span-2">
                                <dt className="text-muted-foreground">
                                    Previous work
                                </dt>
                                <dd className="whitespace-pre-line font-medium">
                                    {application.previous_work}
                                </dd>
                            </div>
                        )}
                    </dl>
                </section>

                <section>
                    <h2 className="mb-3 text-lg font-semibold">Documents</h2>
                    <div className="overflow-x-auto rounded-xl border bg-card">
                        <table className="w-full text-left text-sm">
                            <tbody>
                                {documents.length === 0 && (
                                    <tr>
                                        <td className="p-4 text-muted-foreground">
                                            No documents uploaded yet.
                                        </td>
                                    </tr>
                                )}
                                {documents.map((d) => (
                                    <tr key={d.id} className="border-b last:border-0">
                                        <td className="p-3">
                                            <span className="block font-medium">
                                                {documentTypeLabels[d.type] ?? d.type}
                                            </span>
                                            <a
                                                href={`/documents/${d.id}`}
                                                className="text-primary underline underline-offset-4"
                                            >
                                                {d.original_name}
                                            </a>{' '}
                                            <span className="text-muted-foreground">
                                                ({formatSize(d.size)})
                                            </span>
                                        </td>
                                        <td className="p-3 text-right">
                                            {editable && (
                                                <button
                                                    onClick={() => remove(d)}
                                                    className="text-destructive underline"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {editable && (
                        <form
                            onSubmit={upload}
                            className="mt-4 grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-[auto_1fr_auto] sm:items-end"
                        >
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Type
                                </label>
                                <select
                                    value={form.data.type}
                                    onChange={(e) => form.setData('type', e.target.value)}
                                    className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                                >
                                    {documentTypes.map((t) => (
                                        <option key={t} value={t}>
                                            {documentTypeLabels[t] ?? t}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    File (PDF, JPG or PNG, up to 5 MB)
                                </label>
                                <input
                                    key={fileKey}
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) =>
                                        form.setData('file', e.target.files?.[0] ?? null)
                                    }
                                    className="w-full text-sm"
                                />
                            </div>
                            <Button type="submit" disabled={form.processing || !form.data.file}>
                                Upload
                            </Button>
                            {(form.errors.file || form.errors.type) && (
                                <p className="text-sm text-destructive sm:col-span-3">
                                    {form.errors.file ?? form.errors.type}
                                </p>
                            )}
                        </form>
                    )}
                </section>

                {application.status === 'rejected' && (
                    <div>
                        <Button onClick={resubmit}>Send for review again</Button>
                        {resubmitError && (
                            <p className="mt-2 text-sm text-destructive">{resubmitError}</p>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
