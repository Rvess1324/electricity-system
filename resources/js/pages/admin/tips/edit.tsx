import TipForm from '@/components/tip-form';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

type Tip = {
    id: number;
    title: string;
    description: string;
    category: string | null;
};

export default function Edit({ tip, categories }: { tip: Tip; categories: string[] }) {
    return (
        <AppLayout>
            <Head title="Edit Tip" />
            <div className="p-6">
                <h1 className="mb-4 text-2xl font-bold">Edit Energy Tip</h1>
                <TipForm tip={tip} categories={categories} />
            </div>
        </AppLayout>
    );
}