import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import PageHeader from '@/components/page-header';
import StatusBadge from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import {
    documentTypeLabels,
    formatSize,
    qualificationLabels,
} from '@/lib/electrician';

type Electrician = {
    id: number;
    name: string;
    email: string;
    phone_no: string | null;
    address: string | null;
    license_no: string;
    qualification_type: string | null;
    specialization: string | null;
    years_experience: number | null;
    service_area: string | null;
    previous_work: string | null;
    status: string;
    status_reason: string | null;
    reviewed_at: string | null;
    has_required_documents: boolean;
};

type Document = {
    id: number;
    type: string;
    original_name: string;
    size: number;
};

export default function Review({
    electrician,
    documents,
}: {
    electrician: Electrician;
    documents: Document[];
}) {
    const base = `/admin/electricians/${electrician.id}`;
    const [actionError, setActionError] = useState<string | null>(null);
    const form = useForm({ reason: '' });

    function post(action: string) {
        setActionError(null);
        router.post(
            `${base}/${action}`,
            {},
            {
                preserveScroll: true,
                onError: (errors) =>
                    setActionError(errors.status ?? 'The action failed.'),
            },
        );
    }

    function postWithReason(action: 'reject' | 'suspend') {
        return (e: FormEvent) => {
            e.preventDefault();
            form.post(`${base}/${action}`, {
                preserveScroll: true,
                onSuccess: () => form.reset(),
            });
        };
    }

    const details: [string, string | number | null][] = [
        ['Email', electrician.email],
        ['Phone', electrician.phone_no],
        ['Address', electrician.address],
        [
            'Qualification',
            qualificationLabels[electrician.qualification_type ?? ''] ?? null,
        ],
        ['License or certificate no.', electrician.license_no],
        ['Specialization', electrician.specialization],
        ['Years of experience', electrician.years_experience],
        ['Service area', electrician.service_area],
    ];

    const reasonBox = (action: 'reject' | 'suspend', label: string) => (
        <form onSubmit={postWithReason(action)} className="space-y-2">
            <label className="block text-sm font-medium">
                Reason (the electrician will see this)
            </label>
            <textarea
                rows={3}
                value={form.data.reason}
                onChange={(e) => form.setData('reason', e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
            {form.errors.reason && (
                <p className="text-sm text-destructive">{form.errors.reason}</p>
            )}
            <Button
                type="submit"
                variant="destructive"
                disabled={form.processing}
            >
                {label}
            </Button>
        </form>
    );

    return (
        <>
            <Head title={`Review ${electrician.name}`} />
            <div className="max-w-3xl space-y-8 p-4 md:p-8">
                <PageHeader
                    title={electrician.name}
                    description="Electrician application review"
                    actions={
                        <>
                            <StatusBadge status={electrician.status} />
                            <Link
                                href="/admin/electricians"
                                className="text-sm underline underline-offset-4"
                            >
                                Back to list
                            </Link>
                        </>
                    }
                />

                {electrician.status_reason && (
                    <p className="rounded-xl border bg-card p-4 text-sm">
                        <span className="font-medium">Last reason:</span>{' '}
                        {electrician.status_reason}
                    </p>
                )}

                <section>
                    <h2 className="mb-3 text-lg font-semibold">Details</h2>
                    <dl className="grid gap-3 rounded-xl border bg-card p-4 text-sm sm:grid-cols-2">
                        {details.map(([label, value]) => (
                            <div key={label}>
                                <dt className="text-muted-foreground">
                                    {label}
                                </dt>
                                <dd className="font-medium">{value ?? '-'}</dd>
                            </div>
                        ))}
                        {electrician.previous_work && (
                            <div className="sm:col-span-2">
                                <dt className="text-muted-foreground">
                                    Previous work
                                </dt>
                                <dd className="font-medium whitespace-pre-line">
                                    {electrician.previous_work}
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
                                            No documents uploaded.
                                        </td>
                                    </tr>
                                )}
                                {documents.map((d) => (
                                    <tr
                                        key={d.id}
                                        className="border-b last:border-0"
                                    >
                                        <td className="p-3">
                                            <span className="block font-medium">
                                                {documentTypeLabels[d.type] ??
                                                    d.type}
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
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {!electrician.has_required_documents && (
                        <p className="mt-2 text-sm text-warning">
                            A valid ID and a license or certificate are required
                            before approval.
                        </p>
                    )}
                </section>

                <section className="space-y-4">
                    <h2 className="text-lg font-semibold">Decision</h2>

                    {(electrician.status === 'pending' ||
                        electrician.status === 'rejected') && (
                        <Button onClick={() => post('approve')}>
                            Approve electrician
                        </Button>
                    )}
                    {electrician.status === 'pending' &&
                        reasonBox('reject', 'Reject application')}
                    {electrician.status === 'approved' &&
                        reasonBox('suspend', 'Suspend electrician')}
                    {electrician.status === 'suspended' && (
                        <Button onClick={() => post('reinstate')}>
                            Reinstate electrician
                        </Button>
                    )}
                    {actionError && (
                        <p className="text-sm text-destructive">
                            {actionError}
                        </p>
                    )}
                </section>
            </div>
        </>
    );
}
