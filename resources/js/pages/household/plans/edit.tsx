import PlanForm from '@/components/plan-form';
import { Head } from '@inertiajs/react';

type Plan = {
    id: number;
    plan_name: string;
    monthly_kwh_target: number | string;
    monthly_budget: number | string;
    start_date: string;
    end_date: string;
};

export default function Edit({ plan }: { plan: Plan }) {
    return (
        <>
            <Head title="Edit Energy Plan" />
            <div className="p-4 md:p-8">
                <h1 className="mb-4 text-2xl font-semibold tracking-tight">
                    Edit Energy Plan
                </h1>
                <PlanForm plan={plan} />
            </div>
        </>
    );
}
