import ElectricianForm from '@/components/electrician-form';
import { Head } from '@inertiajs/react';

export default function Create() {
    return (
        <>
            <Head title="Add Electrician" />
            <div className="p-4 md:p-8">
                <h1 className="mb-4 text-2xl font-semibold tracking-tight">
                    Add Electrician
                </h1>
                <ElectricianForm />
            </div>
        </>
    );
}
