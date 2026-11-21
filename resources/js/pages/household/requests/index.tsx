import ListToolbar from '@/components/list-toolbar';
import Pagination, { type Paginated } from '@/components/pagination';
import StatusBadge from '@/components/status-badge';
import { Head, Link, router } from '@inertiajs/react';

type Req = {
    id: number;
    meter_no: string;
    issue_description: string;
    status: string;
    requested_date: string;
    resolved_date: string | null;
    electrician: string | null;
};

export default function Index({ requests }: { requests: Paginated<Req> }) {
    function cancel(r: Req) {
        if (confirm(`Cancel the request for meter ${r.meter_no}?`)) {
            router.delete(`/household/requests/${r.id}`, {
                preserveScroll: true,
                onSuccess: () => router.flushAll(),
            });
        }
    }

    return (
        <>
            <Head title="Service Requests" />
            <div className="p-4 md:p-8">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        My Service Requests
                    </h1>
                    <Link
                        href="/household/requests/create"
                        className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                    >
                        New request
                    </Link>
                </div>

                <ListToolbar
                    options={['pending', 'assigned', 'resolved']}
                    placeholder="Search..."
                />
                <div className="overflow-x-auto rounded-xl border bg-card shadow-xs">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="p-3 font-medium">Meter</th>
                                <th className="p-3 font-medium">Issue</th>
                                <th className="p-3 font-medium">Status</th>
                                <th className="p-3 font-medium">Electrician</th>
                                <th className="p-3 font-medium">Requested</th>
                                <th className="p-3 font-medium">Resolved</th>
                                <th className="p-3 font-medium"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.data.length === 0 && (
                                <tr>
                                    <td className="p-3" colSpan={7}>
                                        No service requests yet.
                                    </td>
                                </tr>
                            )}
                            {requests.data.map((r) => (
                                <tr
                                    key={r.id}
                                    className="border-b last:border-0"
                                >
                                    <td className="p-3">{r.meter_no}</td>
                                    <td className="p-3">
                                        {r.issue_description}
                                    </td>
                                    <td className="p-3">
                                        <StatusBadge status={r.status} />
                                    </td>
                                    <td className="p-3">
                                        {r.electrician ?? '-'}
                                    </td>
                                    <td className="p-3">{r.requested_date}</td>
                                    <td className="p-3">
                                        {r.resolved_date ?? '-'}
                                    </td>
                                    <td className="p-3 text-right">
                                        {r.status === 'pending' && (
                                            <button
                                                onClick={() => cancel(r)}
                                                className="text-red-600 underline"
                                            >
                                                Cancel
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
