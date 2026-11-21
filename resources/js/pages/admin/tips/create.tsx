import TipForm from '@/components/tip-form';
import { Head } from '@inertiajs/react';

export default function Create({ categories }: { categories: string[] }) {
    return (
        <>
            <Head title="Add Tip" />
            <div className="p-4 md:p-8">
                <h1 className="mb-4 text-2xl font-semibold tracking-tight">
                    Add Energy Tip
                </h1>
                <TipForm categories={categories} />
            </div>
        </>
    );
}
