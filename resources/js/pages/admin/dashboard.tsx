import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';

type Props = {
    stats: {
        users: number;
        households: number;
        electricians: number;
        tips: number;
        pending: number;
        assigned: number;
        resolved: number;
    };
    pendingRequests: {
        id: number;
        household: string;
        meter_no: string;
        issue_description: string;
        requested_date: string;
    }[];
};

export default function AdminDashboard({ stats, pendingRequests }: Props) {
    const card = 'rounded-lg border p-4';

    return (
        <AppLayout>
            <Head title="Admin Dashboard" />
            <div className="space-y-6 p-6">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>

                <div className="grid gap-4 md:grid-cols-4">
                    <div className={card}>Users: <b>{stats.users}</b></div>
                    <div className={card}>Households: <b>{stats.households}</b></div>
                    <div className={card}>Electricians: <b>{stats.electricians}</b></div>
                    <Link href="/admin/tips" className={`${card} hover:bg-gray-50 dark:hover:bg-gray-900`}>
                        Energy tips: <b>{stats.tips}</b> (manage)
                    </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className={card}>Pending requests: <b>{stats.pending}</b></div>
                    <div className={card}>Assigned requests: <b>{stats.assigned}</b></div>
                    <div className={card}>Resolved requests: <b>{stats.resolved}</b></div>
                </div>

                <div>
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Waiting for an electrician</h2>
                        <Link href="/admin/requests" className="underline">All requests</Link>
                    </div>
                    <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <th className="p-3">Household</th>
                                    <th className="p-3">Meter</th>
                                    <th className="p-3">Issue</th>
                                    <th className="p-3">Requested</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingRequests.length === 0 && (
                                    <tr><td className="p-3" colSpan={4}>No pending requests.</td></tr>
                                )}
                                {pendingRequests.map((r) => (
                                    <tr key={r.id} className="border-b last:border-0">
                                        <td className="p-3">{r.household}</td>
                                        <td className="p-3">{r.meter_no}</td>
                                        <td className="p-3">{r.issue_description}</td>
                                        <td className="p-3">{r.requested_date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}