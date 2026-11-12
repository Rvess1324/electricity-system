import PlanForm from '@/components/plan-form';
import AppLayout from '@/layouts/app-layout';
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
        <AppLayout>
            <Head title="Edit Energy Plan" />
            <div className="p-6">
                <h1 className="mb-4 text-2xl font-bold">Edit Energy Plan</h1>
                <PlanForm plan={plan} />
            </div>
        </AppLayout>
    );
}