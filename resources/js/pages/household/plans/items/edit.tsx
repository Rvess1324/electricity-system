import PlanItemForm from '@/components/plan-item-form';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

type Props = {
    plan: { id: number; plan_name: string };
    item: { id: number; appliance_id: number; planned_hours_per_day: number | string; priority: string };
    appliances: { id: number; appliance_name: string }[];
};

export default function Edit({ plan, item, appliances }: Props) {
    return (
        <AppLayout>
            <Head title="Edit Plan Item" />
            <div className="p-6">
                <h1 className="mb-4 text-2xl font-bold">Edit item in "{plan.plan_name}"</h1>
                <PlanItemForm plan={plan} appliances={appliances} item={item} />
            </div>
        </AppLayout>
    );
}