import ElectricianForm from '@/components/electrician-form';
import { Head } from '@inertiajs/react';

type Electrician = {
    id: number;
    name: string;
    email: string;
    license_no: string;
    specialization: string | null;
};

export default function Edit({ electrician }: { electrician: Electrician }) {
    return (
        <>
            <Head title="Edit Electrician" />
            <div className="p-4 md:p-8">
                <h1 className="mb-4 text-2xl font-semibold tracking-tight">
                    Edit Electrician
                </h1>
                <ElectricianForm electrician={electrician} />
            </div>
        </>
    );
}
