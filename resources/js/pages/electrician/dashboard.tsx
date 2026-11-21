import { Head, Link } from '@inertiajs/react';
import PageHeader from '@/components/page-header';
import StatCard from '@/components/stat-card';

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

export default function ElectricianDashboard({
    stats,
    upcoming,
    hasProfile,
}: Props) {
    return (
        <>
            <Head title="Electrician Dashboard" />
            <div className="space-y-8 p-4 md:p-8">
                <PageHeader
                    title="Electrician Dashboard"
                    description="Your assigned jobs at a glance."
                />

                {!hasProfile && (
                    <p className="rounded-xl border border-warning/40 bg-warning-soft p-4 text-sm text-warning">
                        No electrician profile is linked to this account yet, so
                        no requests can be assigned to you.
                    </p>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                    <StatCard
                        label="Assigned to you"
                        value={stats.assigned}
                        hint="Jobs waiting to be done"
                    />
                    <StatCard label="Resolved" value={stats.resolved} />
                </div>

                <section>
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Jobs to do</h2>
                        <Link
                            href="/electrician/requests"
                            className="text-sm font-medium text-primary underline underline-offset-4"
                        >
                            All my requests
                        </Link>
                    </div>

                    {upcoming.length === 0 ? (
                        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                            Nothing assigned right now.
                        </p>
                    ) : (
                        <ul className="grid gap-3 md:grid-cols-2">
                            {upcoming.map((r) => (
                                <li
                                    key={r.id}
                                    className="rounded-xl border bg-card p-4 shadow-xs"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="font-semibold">
                                            {r.household}
                                        </p>
                                        <span className="shrink-0 text-xs text-muted-foreground">
                                            {r.requested_date}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {r.address} · Meter {r.meter_no}
                                    </p>
                                    <p className="mt-3 text-sm">
                                        {r.issue_description}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </>
    );
}
