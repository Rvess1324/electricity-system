import PlanForm from '@/components/plan-form';
import { Head } from '@inertiajs/react';

export default function Create() {
    return (
        <>
            <Head title="New Energy Plan" />
            <div className="p-4 md:p-8">
                <h1 className="mb-4 text-2xl font-semibold tracking-tight">
                    New Energy Plan
                </h1>
                <PlanForm />
            </div>
        </>
    );
}
