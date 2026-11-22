import { useConfirm } from '@/hooks/use-confirm';
import ListToolbar from '@/components/list-toolbar';
import Pagination, { type Paginated } from '@/components/pagination';
import StatusBadge from '@/components/status-badge';
import { Head, router } from '@inertiajs/react';

type Req = {
    id: number;
    household: string;
    address: string;
    phone_no: string | null;
    meter_no: string;
    issue_description: string;
    status: string;
    requested_date: string;
    resolved_date: string | null;
};

export default function Index({ requests }: { requests: Paginated<Req> }) {
    const { ask, dialog } = useConfirm();

    function resolve(r: Req) {
        ask({
            title: 'Mark as resolved',
            description: `Mark the request for meter ${r.meter_no} as resolved?`,
            confirmLabel: 'Mark resolved',
            destructive: false,
            onConfirm: () => {
                router.patch(
                    `/electrician/requests/${r.id}/resolve`,
                    {},
                    {
                        preserveScroll: true,
                        onSuccess: () => router.flushAll(),
                    },
                );
            },
        });
    }

    return (
        <>
            <Head title="My Assigned Requests" />
            {dialog}
            <div className="p-4 md:p-8">
                <h1 className="mb-4 text-2xl font-semibold tracking-tight">
                    My Assigned Requests
                </h1>

                <ListToolbar
                    options={['assigned', 'resolved']}
                    placeholder="Search household, meter or issue..."
                />
                <div className="space-y-3 md:hidden">
                    {requests.data.length === 0 && (
                        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                            No requests found.
                        </p>
                    )}
                    {requests.data.map((r) => (
                        <div
                            key={r.id}
                            className="rounded-xl border bg-card p-4 shadow-xs"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <p className="font-semibold">{r.household}</p>
                                <StatusBadge status={r.status} />
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {r.address} · Meter {r.meter_no}
                            </p>
                            {r.phone_no && (
                                <a
                                    href={`tel:${r.phone_no}`}
                                    className="mt-1 inline-block text-sm font-medium text-primary underline underline-offset-4"
                                >
                                    {r.phone_no}
                                </a>
                            )}
                            <p className="mt-3 text-sm">
                                {r.issue_description}
                            </p>
                            <p className="mt-2 text-xs text-muted-foreground">
                                Requested {r.requested_date}
                                {r.resolved_date
                                    ? ` · Resolved ${r.resolved_date}`
                                    : ''}
                            </p>
                            {r.status === 'assigned' && (
                                <button
                                    onClick={() => resolve(r)}
                                    className="mt-3 h-11 w-full rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                                >
                                    Mark resolved
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <div className="hidden overflow-x-auto rounded-xl border bg-card shadow-xs md:block">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="p-3 font-medium">Household</th>
                                <th className="p-3 font-medium">Contact</th>
                                <th className="p-3 font-medium">Meter</th>
                                <th className="p-3 font-medium">Issue</th>
                                <th className="p-3 font-medium">Status</th>
                                <th className="p-3 font-medium">Requested</th>
                                <th className="p-3 font-medium">Resolved</th>
                                <th className="p-3 font-medium"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.data.length === 0 && (
                                <tr>
                                    <td className="p-3" colSpan={8}>
                                        No requests are assigned to you.
                                    </td>
                                </tr>
                            )}
                            {requests.data.map((r) => (
                                <tr
                                    key={r.id}
                                    className="border-b last:border-0"
                                >
                                    <td className="p-3">{r.household}</td>
                                    <td className="p-3">
                                        {r.address}
                                        <br />
                                        <span className="text-xs text-muted-foreground">
                                            {r.phone_no ?? '-'}
                                        </span>
                                    </td>
                                    <td className="p-3">{r.meter_no}</td>
                                    <td className="p-3">
                                        {r.issue_description}
                                    </td>
                                    <td className="p-3">
                                        <StatusBadge status={r.status} />
                                    </td>
                                    <td className="p-3">{r.requested_date}</td>
                                    <td className="p-3">
                                        {r.resolved_date ?? '-'}
                                    </td>
                                    <td className="p-3 text-right">
                                        {r.status === 'assigned' && (
                                            <button
                                                onClick={() => resolve(r)}
                                                className="rounded-md bg-primary px-3 py-1 text-primary-foreground hover:bg-primary/90"
                                            >
                                                Mark resolved
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination page={requests} />
            </div>
        </>
    );
}
