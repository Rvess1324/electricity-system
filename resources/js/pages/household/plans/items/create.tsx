import PlanItemForm from '@/components/plan-item-form';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

type Props = {
    plan: { id: number; plan_name: string };
    appliances: { id: number; appliance_name: string }[];
};

export default function Create({ plan, appliances }: Props) {
    return (
        <AppLayout>
            <Head title="Add Plan Item" />
            <div className="p-6">
                <h1 className="mb-4 text-2xl font-bold">Add appliance to "{plan.plan_name}"</h1>
                <PlanItemForm plan={plan} appliances={appliances} />
            </div>
        </AppLayout>
    );
}