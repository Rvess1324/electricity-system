import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';

type Tip = {
    id: number;
    title: string;
    description: string;
    category: string | null;
};

export default function Index({ tips }: { tips: Tip[] }) {
    function remove(t: Tip) {
        if (confirm(`Delete the tip "${t.title}"? Households that saved it will lose it.`)) {
            router.delete(`/admin/tips/${t.id}`);
        }
    }

    return (
        <AppLayout>
            <Head title="Energy Tips" />
            <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Energy Tips</h1>
                    <Link href="/admin/tips/create" className="rounded-md bg-black px-4 py-2 text-white">
                        Add tip
                    </Link>
                </div>

                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="p-3">Title</th>
                                <th className="p-3">Category</th>
                                <th className="p-3">Description</th>
                                <th className="p-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {tips.length === 0 && (
                                <tr><td className="p-3" colSpan={4}>No tips yet. Add the first one.</td></tr>
                            )}
                            {tips.map((t) => (
                                <tr key={t.id} className="border-b last:border-0">
                                    <td className="p-3 font-medium">{t.title}</td>
                                    <td className="p-3">{t.category ?? '-'}</td>
                                    <td className="p-3">{t.description.length > 80 ? t.description.slice(0, 80) + '...' : t.description}</td>
                                    <td className="space-x-3 p-3 text-right">
                                        <Link href={`/admin/tips/${t.id}/edit`} className="underline">Edit</Link>
                                        <button onClick={() => remove(t)} className="text-red-600 underline">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}