import UsageForm from '@/components/usage-form';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function Create({ meter, rate }: { meter: { id: number; meter_no: string }; rate: number }) {
    return (
        <AppLayout>
            <Head title="Add Usage Record" />
            <div className="p-6">
                <h1 className="mb-4 text-2xl font-bold">Add Usage: {meter.meter_no}</h1>
                <UsageForm meter={meter} rate={rate} />
            </div>
        </AppLayout>
    );
}