import { Link, useForm } from '@inertiajs/react';
import { type FormEvent } from 'react';

type Plan = {
    id: number;
    plan_name: string;
    monthly_kwh_target: number | string;
    monthly_budget: number | string;
    start_date: string;
    end_date: string;
};

export default function PlanForm({ plan }: { plan?: Plan }) {
    const { data, setData, post, put, processing, errors } = useForm({
        plan_name: plan?.plan_name ?? '',
        monthly_kwh_target: plan?.monthly_kwh_target?.toString() ?? '',
        monthly_budget: plan?.monthly_budget?.toString() ?? '',
        start_date: plan?.start_date ?? '',
        end_date: plan?.end_date ?? '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        if (plan) {
            put(`/household/plans/${plan.id}`);
        } else {
            post('/household/plans');
        }
    }

    const input = 'w-full rounded-md border px-3 py-2';

    return (
        <form onSubmit={submit} className="max-w-md space-y-4">
            <div>
                <label className="mb-1 block text-sm font-medium">Plan name</label>
                <input className={input} value={data.plan_name}
                    onChange={(e) => setData('plan_name', e.target.value)} />
                {errors.plan_name && <p className="text-sm text-red-600">{errors.plan_name}</p>}
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium">Monthly kWh target</label>
                <input type="number" step="0.1" className={input} value={data.monthly_kwh_target}
                    onChange={(e) => setData('monthly_kwh_target', e.target.value)} />
                {errors.monthly_kwh_target && <p className="text-sm text-red-600">{errors.monthly_kwh_target}</p>}
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium">Monthly budget</label>
                <input type="number" step="0.01" className={input} value={data.monthly_budget}
                    onChange={(e) => setData('monthly_budget', e.target.value)} />
                {errors.monthly_budget && <p className="text-sm text-red-600">{errors.monthly_budget}</p>}
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium">Start date</label>
                <input type="date" className={input} value={data.start_date}
                    onChange={(e) => setData('start_date', e.target.value)} />
                {errors.start_date && <p className="text-sm text-red-600">{errors.start_date}</p>}
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium">End date</label>
                <input type="date" className={input} value={data.end_date}
                    onChange={(e) => setData('end_date', e.target.value)} />
                {errors.end_date && <p className="text-sm text-red-600">{errors.end_date}</p>}
            </div>

            <div className="flex gap-3">
                <button type="submit" disabled={processing}
                    className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50">
                    {plan ? 'Save changes' : 'Create plan'}
                </button>
                <Link href={plan ? `/household/plans/${plan.id}` : '/household/plans'}
                    className="rounded-md border px-4 py-2">Cancel</Link>
            </div>
        </form>
    );
}