import StatusBadge from '@/components/status-badge';
import AppLayout from '@/layouts/app-layout';
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

export default function Index({ requests }: { requests: Req[] }) {
    function resolve(r: Req) {
        if (confirm(`Mark the request for meter ${r.meter_no} as resolved?`)) {
            router.patch(`/electrician/requests/${r.id}/resolve`, {}, {
                preserveScroll: true,
                onSuccess: () => router.flushAll(),
            });
        }
    }

    return (
        <AppLayout>
            <Head title="My Assigned Requests" />
            <div className="p-6">
                <h1 className="mb-4 text-2xl font-bold">My Assigned Requests</h1>

                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="p-3">Household</th>
                                <th className="p-3">Contact</th>
                                <th className="p-3">Meter</th>
                                <th className="p-3">Issue</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Requested</th>
                                <th className="p-3">Resolved</th>
                                <th className="p-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.length === 0 && (
                                <tr><td className="p-3" colSpan={8}>No requests are assigned to you.</td></tr>
                            )}
                            {requests.map((r) => (
                                <tr key={r.id} className="border-b last:border-0">
                                    <td className="p-3">{r.household}</td>
                                    <td className="p-3">{r.address}<br /><span className="text-xs text-gray-500">{r.phone_no ?? '-'}</span></td>
                                    <td className="p-3">{r.meter_no}</td>
                                    <td className="p-3">{r.issue_description}</td>
                                    <td className="p-3"><StatusBadge status={r.status} /></td>
                                    <td className="p-3">{r.requested_date}</td>
                                    <td className="p-3">{r.resolved_date ?? '-'}</td>
                                    <td className="p-3 text-right">
                                        {r.status === 'assigned' && (
                                            <button onClick={() => resolve(r)} className="rounded-md bg-black px-3 py-1 text-white">
                                                Mark resolved
                                            </button>
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