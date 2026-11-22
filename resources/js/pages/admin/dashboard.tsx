import { Head, Link } from '@inertiajs/react';
import PageHeader from '@/components/page-header';
import StatCard from '@/components/stat-card';

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
    return (
        <>
            <Head title="Admin Dashboard" />
            <div className="space-y-8 p-4 md:p-8">
                <PageHeader
                    title="Admin Dashboard"
                    description="Overview of households, electricians and service requests."
                />

                <section>
                    <h2 className="mb-3 text-sm font-medium text-muted-foreground">
                        Service requests
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <StatCard
                            label="Pending"
                            value={stats.pending}
                            hint="Waiting for an electrician"
                        />
                        <StatCard
                            label="Assigned"
                            value={stats.assigned}
                            hint="In the hands of an electrician"
                        />
                        <StatCard label="Resolved" value={stats.resolved} />
                    </div>
                </section>

                <section>
                    <h2 className="mb-3 text-sm font-medium text-muted-foreground">
                        System
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard label="Users" value={stats.users} />
                        <Link
                            href="/admin/households"
                            className="block transition-opacity hover:opacity-80"
                        >
                            <StatCard
                                label="Households"
                                value={stats.households}
                                hint="Manage households"
                            />
                        </Link>
                        <Link
                            href="/admin/electricians"
                            className="block transition-opacity hover:opacity-80"
                        >
                            <StatCard
                                label="Electricians"
                                value={stats.electricians}
                                hint="Manage electricians"
                            />
                        </Link>
                        <Link
                            href="/admin/tips"
                            className="block transition-opacity hover:opacity-80"
                        >
                            <StatCard
                                label="Energy tips"
                                value={stats.tips}
                                hint="Manage tips"
                            />
                        </Link>
                    </div>
                </section>

                <section>
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-lg font-semibold">
                            Waiting for an electrician
                        </h2>
                        <Link
                            href="/admin/requests"
                            className="text-sm font-medium text-primary underline underline-offset-4"
                        >
                            All requests
                        </Link>
                    </div>
                    <div className="overflow-x-auto rounded-xl border bg-card">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="p-3 font-medium">
                                        Household
                                    </th>
                                    <th className="p-3 font-medium">Meter</th>
                                    <th className="p-3 font-medium">Issue</th>
                                    <th className="p-3 font-medium">
                                        Requested
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingRequests.length === 0 && (
                                    <tr>
                                        <td
                                            className="p-6 text-center text-muted-foreground"
                                            colSpan={4}
                                        >
                                            No pending requests.
                                        </td>
                                    </tr>
                                )}
                                {pendingRequests.map((r) => (
                                    <tr
                                        key={r.id}
                                        className="border-b last:border-0"
                                    >
                                        <td className="p-3">{r.household}</td>
                                        <td className="p-3">{r.meter_no}</td>
                                        <td className="p-3">
                                            {r.issue_description}
                                        </td>
                                        <td className="p-3">
                                            {r.requested_date}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </>
    );
}
