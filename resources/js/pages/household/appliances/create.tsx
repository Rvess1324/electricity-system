import ApplianceForm from '@/components/appliance-form';
import { Head } from '@inertiajs/react';

export default function Create() {
    return (
        <>
            <Head title="Add Appliance" />
            <div className="p-4 md:p-8">
                <h1 className="mb-4 text-2xl font-semibold tracking-tight">
                    Add Appliance
                </h1>
                <ApplianceForm />
            </div>
        </>
    );
}
