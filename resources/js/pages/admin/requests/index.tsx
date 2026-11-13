import StatusBadge from '@/components/status-badge';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

type Req = {
    id: number;
    household: string;
    address: string;
    meter_no: string;
    issue_description: string;
    status: string;
    requested_date: string;
    resolved_date: string | null;
    electrician_id: number | null;
    electrician: string | null;
};

type Electrician = { id: number; name: string; specialization: string | null };

function AssignCell({ r, electricians }: { r: Req; electricians: Electrician[] }) {
    const [value, setValue] = useState(r.electrician_id?.toString() ?? '');

    if (r.status === 'resolved') {
        return <span>{r.electrician ?? '-'}</span>;
    }

    function assign() {
        router.patch(`/admin/requests/${r.id}/assign`, { electrician_id: value }, {
            preserveScroll: true,
            onSuccess: () => router.flushAll(),
        });
    }

    return (
        <div className="flex items-center gap-2">
            <select className="rounded-md border px-2 py-1" value={value} onChange={(e) => setValue(e.target.value)}>
                <option value="">Choose...</option>
                {electricians.map((e) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                ))}
            </select>
            <button onClick={assign} disabled={!value || value === r.electrician_id?.toString()}
                className="rounded-md bg-black px-3 py-1 text-white disabled:opacity-40">
                {r.status === 'pending' ? 'Assign' : 'Reassign'}
            </button>
        </div>
    );
}

export default function Index({ requests, electricians }: { requests: Req[]; electricians: Electrician[] }) {
    return (
        <AppLayout>
            <Head title="Service Requests" />
            <div className="p-6">
                <h1 className="mb-4 text-2xl font-bold">All Service Requests</h1>

                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="p-3">Household</th>
                                <th className="p-3">Meter</th>
                                <th className="p-3">Issue</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Requested</th>
                                <th className="p-3">Resolved</th>
                                <th className="p-3">Electrician</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.length === 0 && (
                                <tr><td className="p-3" colSpan={7}>No service requests yet.</td></tr>
                            )}
                            {requests.map((r) => (
                                <tr key={r.id} className="border-b last:border-0">
                                    <td className="p-3">{r.household}<br /><span className="text-xs text-gray-500">{r.address}</span></td>
                                    <td className="p-3">{r.meter_no}</td>
                                    <td className="p-3">{r.issue_description}</td>
                                    <td className="p-3"><StatusBadge status={r.status} /></td>
                                    <td className="p-3">{r.requested_date}</td>
                                    <td className="p-3">{r.resolved_date ?? '-'}</td>
                                    <td className="p-3"><AssignCell r={r} electricians={electricians} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}