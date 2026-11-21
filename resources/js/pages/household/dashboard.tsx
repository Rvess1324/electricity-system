import { peso } from '@/lib/currency';
import { Head, Link } from '@inertiajs/react';

type Props = {
    stats: {
        meters: number;
        appliances: number;
        plans: number;
        saved_tips: number;
        pending_requests: number;
        appliance_kwh: number;
        last30_kwh: number;
        last30_cost: number;
    };
    latest: {
        usage_date: string;
        kwh_used: number | string;
        meter_no: string;
    } | null;
    activePlan: {
        id: number;
        plan_name: string;
        monthly_kwh_target: number | string;
        monthly_budget: number | string;
        summary: {
            planned_kwh: number;
            planned_cost: number;
            kwh_ok: boolean;
            budget_ok: boolean;
            actual_monthly: number | null;
            actual_ok: boolean | null;
        };
    } | null;
};

function Badge({ ok, yes, no }: { ok: boolean; yes: string; no: string }) {
    return (
        <span
            className={`rounded px-2 py-0.5 text-xs font-medium ${ok ? 'bg-success-soft text-success' : 'bg-destructive/10 text-destructive-foreground'}`}
        >
            {ok ? yes : no}
        </span>
    );
}

export default function HouseholdDashboard({
    stats,
    latest,
    activePlan,
}: Props) {
    const card = 'rounded-lg border p-4';
    const link = 'rounded-lg border p-4 hover:bg-accent';

    return (
        <>
            <Head title="Household Dashboard" />
            <div className="space-y-6 p-6">
                <h1 className="text-2xl font-bold">Household Dashboard</h1>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className={card}>
                        <p className="text-sm text-muted-foreground">
                            Last 30 days (meters)
                        </p>
                        <p className="text-2xl font-bold">
                            {stats.last30_kwh.toFixed(1)} kWh
                        </p>
                        <p className="text-sm">
                            Estimated cost: {peso(stats.last30_cost)}
                        </p>
                    </div>

                    <div className={card}>
                        <p className="text-sm text-muted-foreground">
                            Latest reading
                        </p>
                        {latest ? (
                            <>
                                <p className="text-2xl font-bold">
                                    {Number(latest.kwh_used).toFixed(1)} kWh
                                </p>
                                <p className="text-sm">
                                    {latest.usage_date} · {latest.meter_no}
                                </p>
                            </>
                        ) : (
                            <p className="text-sm">No usage records yet.</p>
                        )}
                    </div>

                    <div className={card}>
                        <p className="text-sm text-muted-foreground">
                            Appliances (estimated)
                        </p>
                        <p className="text-2xl font-bold">
                            {stats.appliance_kwh.toFixed(1)} kWh / month
                        </p>
                        <p className="text-sm">
                            From {stats.appliances} appliance(s)
                        </p>
                    </div>
                </div>

                <div className={card}>
                    <p className="mb-2 text-sm text-muted-foreground">
                        Current energy plan
                    </p>
                    {activePlan ? (
                        <div className="space-y-2">
                            <Link
                                href={`/household/plans/${activePlan.id}`}
                                className="text-lg font-semibold underline"
                            >
                                {activePlan.plan_name}
                            </Link>
                            <div className="flex flex-wrap items-center gap-3 text-sm">
                                <span>
                                    Planned{' '}
                                    {activePlan.summary.planned_kwh.toFixed(1)}{' '}
                                    of{' '}
                                    {Number(
                                        activePlan.monthly_kwh_target,
                                    ).toFixed(1)}{' '}
                                    kWh
                                </span>
                                <Badge
                                    ok={activePlan.summary.kwh_ok}
                                    yes="Within target"
                                    no="Over target"
                                />
                                <span>
                                    Cost {peso(activePlan.summary.planned_cost)}{' '}
                                    of {peso(activePlan.monthly_budget)}
                                </span>
                                <Badge
                                    ok={activePlan.summary.budget_ok}
                                    yes="Within budget"
                                    no="Over budget"
                                />
                            </div>
                            {activePlan.summary.actual_monthly !== null && (
                                <div className="flex items-center gap-3 text-sm">
                                    <span>
                                        Actual pace:{' '}
                                        {activePlan.summary.actual_monthly.toFixed(
                                            1,
                                        )}{' '}
                                        kWh / 30 days
                                    </span>
                                    <Badge
                                        ok={!!activePlan.summary.actual_ok}
                                        yes="On track"
                                        no="Above target"
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm">
                            No plan covers today.{' '}
                            <Link
                                href="/household/plans/create"
                                className="underline"
                            >
                                Create one
                            </Link>
                            .
                        </p>
                    )}
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Link href="/household/meters" className={link}>
                        Meters: <b>{stats.meters}</b> (manage)
                    </Link>
                    <Link href="/household/appliances" className={link}>
                        Appliances: <b>{stats.appliances}</b> (manage)
                    </Link>
                    <Link href="/household/plans" className={link}>
                        Energy plans: <b>{stats.plans}</b> (manage)
                    </Link>
                    <Link href="/household/saved-tips" className={link}>
                        Saved tips: <b>{stats.saved_tips}</b>
                    </Link>
                    <Link href="/household/requests" className={link}>
                        Open service requests: <b>{stats.pending_requests}</b>
                    </Link>
                </div>
            </div>
        </>
    );
}
