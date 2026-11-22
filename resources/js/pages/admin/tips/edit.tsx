import TipForm from '@/components/tip-form';
import { Head } from '@inertiajs/react';

type Tip = {
    id: number;
    title: string;
    description: string;
    category: string | null;
};

export default function Edit({
    tip,
    categories,
}: {
    tip: Tip;
    categories: string[];
}) {
    return (
        <>
            <Head title="Edit Tip" />
            <div className="p-4 md:p-8">
                <h1 className="mb-4 text-2xl font-semibold tracking-tight">
                    Edit Energy Tip
                </h1>
                <TipForm tip={tip} categories={categories} />
            </div>
        </>
    );
}
