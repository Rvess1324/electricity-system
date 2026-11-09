import ApplianceForm from '@/components/appliance-form';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function Create() {
    return (
        <AppLayout>
            <Head title="Add Appliance" />
            <div className="p-6">
                <h1 className="mb-4 text-2xl font-bold">Add Appliance</h1>
                <ApplianceForm />
            </div>
        </AppLayout>
    );
}