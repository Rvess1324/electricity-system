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
            <div className="p-6">
                <h1 className="mb-4 text-2xl font-bold">Edit Meter</h1>
                <MeterForm meter={meter} />
            </div>
        </>
    );
}
