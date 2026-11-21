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
    function resolve(r: Req) {
        if (confirm(`Mark the request for meter ${r.meter_no} as resolved?`)) {
            router.patch(
                `/electrician/requests/${r.id}/resolve`,
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => router.flushAll(),
                },
            );
        }
    }

    return (
        <>
            <Head title="My Assigned Requests" />
            <div className="p-4 md:p-8">
                <h1 className="mb-4 text-2xl font-semibold tracking-tight">
                    My Assigned Requests
                </h1>

                <ListToolbar
                    options={['assigned', 'resolved']}
                    placeholder="Search household, meter or issue..."
                />
                <div className="overflow-x-auto rounded-xl border bg-card shadow-xs">
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
