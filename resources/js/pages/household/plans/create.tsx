import PlanForm from '@/components/plan-form';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function Create() {
    return (
        <AppLayout>
            <Head title="New Energy Plan" />
            <div className="p-6">
                <h1 className="mb-4 text-2xl font-bold">New Energy Plan</h1>
                <PlanForm />
            </div>
        </AppLayout>
    );
}