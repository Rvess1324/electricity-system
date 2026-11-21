import { peso } from '@/lib/currency';
import { Head, Link, router } from '@inertiajs/react';

type Plan = {
    id: number;
    plan_name: string;
    monthly_kwh_target: number | string;
    monthly_budget: number | string;
    start_date: string;
    end_date: string;
    summary: {
        planned_kwh: number;
        planned_cost: number;
        kwh_ok: boolean;
        budget_ok: boolean;
    };
};

export default function Index({ plans }: { plans: Plan[] }) {
    function remove(p: Plan) {
        if (confirm(`Delete plan "${p.plan_name}" and all its items?`)) {
            router.delete(`/household/plans/${p.id}`);
        }
    }

    return (
        <>
            <Head title="Energy Plans" />
            <div className="p-4 md:p-8">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        My Energy Plans
                    </h1>
                    <Link
                        href="/household/plans/create"
                        className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                    >
                        New plan
                    </Link>
                </div>

                <div className="overflow-x-auto rounded-xl border bg-card shadow-xs">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="p-3 font-medium">Plan</th>
                                <th className="p-3 font-medium">Period</th>
                                <th className="p-3 font-medium">Target kWh</th>
                                <th className="p-3 font-medium">Planned kWh</th>
                                <th className="p-3 font-medium">Budget</th>
                                <th className="p-3 font-medium">
                                    Planned cost
                                </th>
                                <th className="p-3 font-medium"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {plans.length === 0 && (
                                <tr>
                                    <td className="p-3" colSpan={7}>
                                        No plans yet. Create your first one.
                                    </td>
                                </tr>
                            )}
                            {plans.map((p) => (
                                <tr
                                    key={p.id}
                                    className="border-b last:border-0"
                                >
                                    <td className="p-3">
                                        <Link
                                            href={`/household/plans/${p.id}`}
                                            className="underline"
                                        >
                                            {p.plan_name}
                                        </Link>
                                    </td>
                                    <td className="p-3">
                                        {p.start_date} to {p.end_date}
                                    </td>
                                    <td className="p-3">
                                        {Number(p.monthly_kwh_target).toFixed(
                                            1,
                                        )}
                                    </td>
                                    <td
                                        className={`p-3 ${p.summary.kwh_ok ? 'text-success' : 'text-red-600'}`}
                                    >
                                        {p.summary.planned_kwh.toFixed(1)}
                                    </td>
                                    <td className="p-3">
                                        {peso(p.monthly_budget)}
                                    </td>
                                    <td
                                        className={`p-3 ${p.summary.budget_ok ? 'text-success' : 'text-red-600'}`}
                                    >
                                        {peso(p.summary.planned_cost)}
                                    </td>
                                    <td className="space-x-3 p-3 text-right">
                                        <Link
                                            href={`/household/plans/${p.id}/edit`}
                                            className="underline"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => remove(p)}
                                            className="text-red-600 underline"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
