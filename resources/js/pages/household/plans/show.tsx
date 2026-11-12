import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';

type Plan = {
    id: number;
    plan_name: string;
    monthly_kwh_target: number | string;
    monthly_budget: number | string;
    start_date: string;
    end_date: string;
};

type Item = {
    id: number;
    appliance_name: string;
    wattage: number;
    quantity: number;
    usual_hours_per_day: number | string;
    planned_hours_per_day: number | string;
    priority: string;
    planned_kwh: number;
};

type Summary = {
    planned_kwh: number;
    usual_kwh: number;
    saving_kwh: number;
    planned_cost: number;
    kwh_ok: boolean;
    budget_ok: boolean;
    actual_total: number | null;
    actual_monthly: number | null;
    actual_ok: boolean | null;
};

function Badge({ ok, yes, no }: { ok: boolean; yes: string; no: string }) {
    return (
        <span className={`rounded px-2 py-0.5 text-xs font-medium ${ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {ok ? yes : no}
        </span>
    );
}

export default function Show({ plan, items, summary, rate }: { plan: Plan; items: Item[]; summary: Summary; rate: number }) {
    function remove(i: Item) {
        if (confirm(`Remove ${i.appliance_name} from this plan?`)) {
            router.delete(`/household/plans/${plan.id}/items/${i.id}`);
        }
    }

    const card = 'rounded-lg border p-4';

    return (
        <AppLayout>
            <Head title={plan.plan_name} />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{plan.plan_name}</h1>
                        <p className="text-sm text-gray-500">{plan.start_date} to {plan.end_date} · rate {rate} per kWh</p>
                    </div>
                    <div className="space-x-3">
                        <Link href={`/household/plans/${plan.id}/edit`} className="underline">Edit plan</Link>
                        <Link href="/household/plans" className="underline">All plans</Link>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className={card}>
                        <p className="text-sm text-gray-500">Planned kWh / month</p>
                        <p className="text-2xl font-bold">{summary.planned_kwh.toFixed(1)}</p>
                        <p className="mb-2 text-sm">Target: {Number(plan.monthly_kwh_target).toFixed(1)}</p>
                        <Badge ok={summary.kwh_ok} yes="Within target" no="Over target" />
                    </div>

                    <div className={card}>
                        <p className="text-sm text-gray-500">Planned cost / month</p>
                        <p className="text-2xl font-bold">{summary.planned_cost.toFixed(2)}</p>
                        <p className="mb-2 text-sm">Budget: {Number(plan.monthly_budget).toFixed(2)}</p>
                        <Badge ok={summary.budget_ok} yes="Within budget" no="Over budget" />
                    </div>

                    <div className={card}>
                        <p className="text-sm text-gray-500">Actual usage (meters)</p>
                        {summary.actual_monthly === null ? (
                            <p className="text-sm">No usage records found in this plan's period, so there is no actual data to compare.</p>
                        ) : (
                            <>
                                <p className="text-2xl font-bold">{summary.actual_monthly.toFixed(1)} kWh / 30 days</p>
                                <p className="mb-2 text-sm">Recorded so far in the period: {summary.actual_total?.toFixed(1)} kWh</p>
                                <Badge ok={!!summary.actual_ok} yes="Actual is within target" no="Actual is over target" />
                            </>
                        )}
                    </div>
                </div>

                <p className="text-sm">
                    Your appliances at their usual hours would use <b>{summary.usual_kwh.toFixed(1)} kWh</b>; this plan uses{' '}
                    <b>{summary.planned_kwh.toFixed(1)} kWh</b>
                    {summary.saving_kwh >= 0
                        ? <>, saving <b>{summary.saving_kwh.toFixed(1)} kWh</b>.</>
                        : <>, which is <b>{Math.abs(summary.saving_kwh).toFixed(1)} kWh more</b>.</>}
                </p>

                <div>
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Plan items</h2>
                        <Link href={`/household/plans/${plan.id}/items/create`} className="rounded-md bg-black px-4 py-2 text-white">
                            Add appliance
                        </Link>
                    </div>

                    <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <th className="p-3">Appliance</th>
                                    <th className="p-3">Watts</th>
                                    <th className="p-3">Qty</th>
                                    <th className="p-3">Usual hrs/day</th>
                                    <th className="p-3">Planned hrs/day</th>
                                    <th className="p-3">Priority</th>
                                    <th className="p-3">Planned kWh/month</th>
                                    <th className="p-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length === 0 && (
                                    <tr><td className="p-3" colSpan={8}>No appliances in this plan yet.</td></tr>
                                )}
                                {items.map((i) => (
                                    <tr key={i.id} className="border-b last:border-0">
                                        <td className="p-3">{i.appliance_name}</td>
                                        <td className="p-3">{i.wattage}</td>
                                        <td className="p-3">{i.quantity}</td>
                                        <td className="p-3">{i.usual_hours_per_day}</td>
                                        <td className="p-3">{i.planned_hours_per_day}</td>
                                        <td className="p-3 capitalize">{i.priority}</td>
                                        <td className="p-3">{i.planned_kwh.toFixed(1)}</td>
                                        <td className="space-x-3 p-3 text-right">
                                            <Link href={`/household/plans/${plan.id}/items/${i.id}/edit`} className="underline">Edit</Link>
                                            <button onClick={() => remove(i)} className="text-red-600 underline">Remove</button>
                                        </td>
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