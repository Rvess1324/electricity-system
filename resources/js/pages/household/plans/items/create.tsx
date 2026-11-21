import PlanItemForm from '@/components/plan-item-form';
import { Head } from '@inertiajs/react';

type Props = {
    plan: { id: number; plan_name: string };
    appliances: { id: number; appliance_name: string }[];
};

export default function Create({ plan, appliances }: Props) {
    return (
        <>
            <Head title="Add Plan Item" />
            <div className="p-4 md:p-8">
                <h1 className="mb-4 text-2xl font-semibold tracking-tight">
                    Add appliance to "{plan.plan_name}"
                </h1>
                <PlanItemForm plan={plan} appliances={appliances} />
            </div>
        </>
    );
}
