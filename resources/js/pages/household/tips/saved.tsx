import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';

type Tip = {
    id: number;
    title: string;
    description: string;
    category: string | null;
    saved_at: string | null;
};

export default function Saved({ tips }: { tips: Tip[] }) {
    function unsave(t: Tip) {
        if (confirm(`Remove "${t.title}" from your saved tips?`)) {
            router.delete(`/household/tips/${t.id}/save`, { preserveScroll: true });
        }
    }

    return (
        <AppLayout>
            <Head title="Saved Tips" />
            <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">My Saved Tips</h1>
                    <Link href="/household/tips" className="underline">Browse all tips</Link>
                </div>

                {tips.length === 0 && (
                    <p>You have not saved any tips yet. <Link href="/household/tips" className="underline">Browse tips</Link>.</p>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                    {tips.map((t) => (
                        <div key={t.id} className="rounded-lg border p-4">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                <h2 className="text-lg font-semibold">{t.title}</h2>
                                {t.category && (
                                    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-800">{t.category}</span>
                                )}
                            </div>
                            <p className="mb-2 text-sm">{t.description}</p>
                            <p className="mb-3 text-xs text-gray-500">Saved on {t.saved_at}</p>
                            <button onClick={() => unsave(t)} className="text-sm text-red-600 underline">Remove</button>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}