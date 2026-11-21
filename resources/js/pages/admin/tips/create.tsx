import TipForm from '@/components/tip-form';
import { Head } from '@inertiajs/react';

export default function Create({ categories }: { categories: string[] }) {
    return (
        <>
            <Head title="Add Tip" />
            <div className="p-6">
                <h1 className="mb-4 text-2xl font-bold">Add Energy Tip</h1>
                <TipForm categories={categories} />
            </div>
        </>
    );
}
