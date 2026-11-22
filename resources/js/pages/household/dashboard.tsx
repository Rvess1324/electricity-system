import { peso } from '@/lib/currency';
import { Head, Link } from '@inertiajs/react';
import PageHeader from '@/components/page-header';
import StatCard from '@/components/stat-card';

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
    const card = 'rounded-xl border bg-card p-4 shadow-xs';

    return (
        <>
            <Head title="Household Dashboard" />
            <div className="space-y-6 p-4 md:p-8">
                <PageHeader
                    title="Household Dashboard"
                    description="Your usage, plan and service requests."
                />

                <div className="grid gap-4 md:grid-cols-3">
                    <StatCard
                        label="Last 30 days (meters)"
                        value={`${stats.last30_kwh.toFixed(1)} kWh`}
                        hint={`Estimated cost: ${peso(stats.last30_cost)}`}
                    />
                    <StatCard
                        label="Latest reading"
                        value={
                            latest
                                ? `${Number(latest.kwh_used).toFixed(1)} kWh`
                                : '—'
                        }
                        hint={
                            latest
                                ? `${latest.usage_date.slice(0, 10)} · ${latest.meter_no}`
                                : 'No usage records yet.'
                        }
                    />
                    <StatCard
                        label="Appliances (estimated)"
                        value={`${stats.appliance_kwh.toFixed(1)} kWh`}
                        hint={`Per month, from ${stats.appliances} appliance(s)`}
                    />
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

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Link
                        href="/household/meters"
                        className="block transition-opacity hover:opacity-80"
                    >
                        <StatCard
                            label="Meters"
                            value={stats.meters}
                            hint="Manage meters and usage"
                        />
                    </Link>
                    <Link
                        href="/household/appliances"
                        className="block transition-opacity hover:opacity-80"
                    >
                        <StatCard
                            label="Appliances"
                            value={stats.appliances}
                            hint="Manage appliances"
                        />
                    </Link>
                    <Link
                        href="/household/plans"
                        className="block transition-opacity hover:opacity-80"
                    >
                        <StatCard
                            label="Energy plans"
                            value={stats.plans}
                            hint="Manage plans"
                        />
                    </Link>
                    <Link
                        href="/household/saved-tips"
                        className="block transition-opacity hover:opacity-80"
                    >
                        <StatCard label="Saved tips" value={stats.saved_tips} />
                    </Link>
                    <Link
                        href="/household/requests"
                        className="block transition-opacity hover:opacity-80"
                    >
                        <StatCard
                            label="Open service requests"
                            value={stats.pending_requests}
                            hint="Pending or assigned"
                        />
                    </Link>
                </div>
            </div>
        </>
    );
}
