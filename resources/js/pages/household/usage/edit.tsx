import UsageForm from '@/components/usage-form';
import { Head } from '@inertiajs/react';

type Props = {
    meter: { id: number; meter_no: string };
    record: { id: number; usage_date: string; kwh_used: number | string };
    rate: number;
};

export default function Edit({ meter, record, rate }: Props) {
    return (
        <>
            <Head title="Edit Usage Record" />
            <div className="p-4 md:p-8">
                <h1 className="mb-4 text-2xl font-semibold tracking-tight">
                    Edit Usage: {meter.meter_no}
                </h1>
                <UsageForm meter={meter} rate={rate} record={record} />
            </div>
        </>
    );
}
