import UsageForm from '@/components/usage-form';
import { Head } from '@inertiajs/react';

export default function Create({
    meter,
    rate,
}: {
    meter: { id: number; meter_no: string };
    rate: number;
}) {
    return (
        <>
            <Head title="Add Usage Record" />
            <div className="p-4 md:p-8">
                <h1 className="mb-4 text-2xl font-semibold tracking-tight">
                    Add Usage: {meter.meter_no}
                </h1>
                <UsageForm meter={meter} rate={rate} />
            </div>
        </>
    );
}
