import { useConfirm } from '@/hooks/use-confirm';
import EmailCell from '@/components/email-cell';
import ListToolbar from '@/components/list-toolbar';
import Pagination, { type Paginated } from '@/components/pagination';
import StatusBadge from '@/components/status-badge';
import { Head, Link, router } from '@inertiajs/react';

type Electrician = {
    id: number;
    name: string;
    email: string;
    user_id: number;
    email_verified: boolean;
    license_no: string;
    specialization: string | null;
    status: string;
    open_jobs: number;
};

export default function Index({
    electricians,
    statuses,
}: {
    electricians: Paginated<Electrician>;
    statuses: string[];
}) {
    const { ask, dialog } = useConfirm();

    function remove(e: Electrician) {
        ask({
            title: 'Delete electrician account',
            description: `Delete the account of ${e.name}? This cannot be undone.`,
            confirmLabel: 'Delete',
            destructive: true,
            onConfirm: () => {
                router.delete(`/admin/electricians/${e.id}`);
            },
        });
    }

    return (
        <>
            <Head title="Electricians" />
            {dialog}
            <div className="p-4 md:p-8">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Electricians
                    </h1>
                    <Link
                        href="/admin/electricians/create"
                        className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                    >
                        Add electrician
                    </Link>
                </div>

                <ListToolbar
                    options={statuses}
                    placeholder="Search name, email, license..."
                />
                <div className="overflow-x-auto rounded-xl border bg-card shadow-xs">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="p-3 font-medium">Name</th>
                                <th className="p-3 font-medium">Email</th>
                                <th className="p-3 font-medium">License</th>
                                <th className="p-3 font-medium">
                                    Specialization
                                </th>
                                <th className="p-3 font-medium">Status</th>
                                <th className="p-3 font-medium">Open jobs</th>
                                <th className="p-3 font-medium"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {electricians.data.length === 0 && (
                                <tr>
                                    <td className="p-3" colSpan={7}>
                                        No electricians found.
                                    </td>
                                </tr>
                            )}
                            {electricians.data.map((e) => (
                                <tr
                                    key={e.id}
                                    className="border-b last:border-0"
                                >
                                    <td className="p-3 font-medium">
                                        {e.name}
                                    </td>
                                    <td className="p-3">
                                        <EmailCell
                                            email={e.email}
                                            verified={e.email_verified}
                                            userId={e.user_id}
                                        />
                                    </td>
                                    <td className="p-3">{e.license_no}</td>
                                    <td className="p-3">
                                        {e.specialization ?? '-'}
                                    </td>
                                    <td className="p-3">
                                        <StatusBadge status={e.status} />
                                    </td>
                                    <td className="p-3">{e.open_jobs}</td>
                                    <td className="space-x-3 p-3 text-right">
                                        <Link
                                            href={`/admin/electricians/${e.id}/review`}
                                            className="underline"
                                        >
                                            Review
                                        </Link>
                                        <Link
                                            href={`/admin/electricians/${e.id}/edit`}
                                            className="underline"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => remove(e)}
                                            className="text-red-600 underline"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination page={electricians} />
            </div>
        </>
    );
}
