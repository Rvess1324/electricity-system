import HouseholdForm from '@/components/household-form';
import { Head } from '@inertiajs/react';

type Household = {
    id: number;
    name: string;
    email: string;
    address: string;
    phone_no: string | null;
};

export default function Edit({ household }: { household: Household }) {
    return (
        <>
            <Head title="Edit Household" />
            <div className="p-4 md:p-8">
                <h1 className="mb-4 text-2xl font-semibold tracking-tight">
                    Edit Household
                </h1>
                <HouseholdForm household={household} />
            </div>
        </>
    );
}
