import MeterForm from '@/components/meter-form';
import { Head } from '@inertiajs/react';

type Meter = {
    id: number;
    meter_no: string;
    meter_type: string;
    installation_date: string;
};

export default function Edit({ meter }: { meter: Meter }) {
    return (
        <>
            <Head title="Edit Meter" />
            <div className="p-4 md:p-8">
                <h1 className="mb-4 text-2xl font-semibold tracking-tight">
                    Edit Meter
                </h1>
                <MeterForm meter={meter} />
            </div>
        </>
    );
}
