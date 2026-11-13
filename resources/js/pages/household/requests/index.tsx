import StatusBadge from '@/components/status-badge';
import AppLayout from '@/layouts/app-layout';
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

export default function Index({ requests }: { requests: Req[] }) {
    function cancel(r: Req) {
        if (confirm(`Cancel the request for meter ${r.meter_no}?`)) {
            router.delete(`/household/requests/${r.id}`, {
                preserveScroll: true,
                onSuccess: () => router.flushAll(),
            });
        }
    }

    return (
        <AppLayout>
            <Head title="Service Requests" />
            <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">My Service Requests</h1>
                    <Link href="/household/requests/create" className="rounded-md bg-black px-4 py-2 text-white">
                        New request
                    </Link>
                </div>

                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="p-3">Meter</th>
                                <th className="p-3">Issue</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Electrician</th>
                                <th className="p-3">Requested</th>
                                <th className="p-3">Resolved</th>
                                <th className="p-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.length === 0 && (
                                <tr><td className="p-3" colSpan={7}>No service requests yet.</td></tr>
                            )}
                            {requests.map((r) => (
                                <tr key={r.id} className="border-b last:border-0">
                                    <td className="p-3">{r.meter_no}</td>
                                    <td className="p-3">{r.issue_description}</td>
                                    <td className="p-3"><StatusBadge status={r.status} /></td>
                                    <td className="p-3">{r.electrician ?? '-'}</td>
                                    <td className="p-3">{r.requested_date}</td>
                                    <td className="p-3">{r.resolved_date ?? '-'}</td>
                                    <td className="p-3 text-right">
                                        {r.status === 'pending' && (
                                            <button onClick={() => cancel(r)} className="text-red-600 underline">Cancel</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}