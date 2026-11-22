import ApplianceForm from '@/components/appliance-form';
import { Head } from '@inertiajs/react';

type Appliance = {
    id: number;
    appliance_name: string;
    quantity: number;
    wattage: number;
    hours_per_day: number | string;
    category: string | null;
};

export default function Edit({ appliance }: { appliance: Appliance }) {
    return (
        <>
            <Head title="Edit Appliance" />
            <div className="p-4 md:p-8">
                <h1 className="mb-4 text-2xl font-semibold tracking-tight">
                    Edit Appliance
                </h1>
                <ApplianceForm appliance={appliance} />
            </div>
        </>
    );
}
