import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';

type Props = {
    stats: { assigned: number; resolved: number };
    upcoming: {
        id: number;
        household: string;
        address: string;
        meter_no: string;
        issue_description: string;
        requested_date: string;
    }[];
    hasProfile: boolean;
};

export default function ElectricianDashboard({ stats, upcoming, hasProfile }: Props) {
    const card = 'rounded-lg border p-4';

    return (
        <AppLayout>
            <Head title="Electrician Dashboard" />
            <div className="space-y-6 p-6">
                <h1 className="text-2xl font-bold">Electrician Dashboard</h1>

                {!hasProfile && (
                    <p className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-900">
                        No electrician profile is linked to this account yet, so no requests can be assigned to you.
                    </p>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                    <div className={card}>Assigned requests: <b>{stats.assigned}</b></div>
                    <div className={card}>Resolved requests: <b>{stats.resolved}</b></div>
                </div>

                <div>
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Jobs to do</h2>
                        <Link href="/electrician/requests" className="underline">All my requests</Link>
                    </div>
                    <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <th className="p-3">Household</th>
                                    <th className="p-3">Address</th>
                                    <th className="p-3">Meter</th>
                                    <th className="p-3">Issue</th>
                                    <th className="p-3">Requested</th>
                                </tr>
                            </thead>
                            <tbody>
                                {upcoming.length === 0 && (
                                    <tr><td className="p-3" colSpan={5}>Nothing assigned right now.</td></tr>
                                )}
                                {upcoming.map((r) => (
                                    <tr key={r.id} className="border-b last:border-0">
                                        <td className="p-3">{r.household}</td>
                                        <td className="p-3">{r.address}</td>
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