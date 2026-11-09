import ApplianceForm from '@/components/appliance-form';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

type Appliance = {
    id: number;
    appliance_name: string;
    wattage: number;
    hours_per_day: number | string;
    category: string | null;
};

export default function Edit({ appliance }: { appliance: Appliance }) {
    return (
        <AppLayout>
            <Head title="Edit Appliance" />
            <div className="p-6">
                <h1 className="mb-4 text-2xl font-bold">Edit Appliance</h1>
                <ApplianceForm appliance={appliance} />
            </div>
        </AppLayout>
    );
}