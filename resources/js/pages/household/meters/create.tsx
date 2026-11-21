import MeterForm from '@/components/meter-form';
import { Head } from '@inertiajs/react';

export default function Create() {
    return (
        <>
            <Head title="Add Meter" />
            <div className="p-6">
                <h1 className="mb-4 text-2xl font-bold">Add Meter</h1>
                <MeterForm />
            </div>
        </>
    );
}
