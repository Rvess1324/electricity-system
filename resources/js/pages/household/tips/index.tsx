import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';

type Tip = {
    id: number;
    title: string;
    description: string;
    category: string | null;
    saved: boolean;
    suggested: boolean;
};

type Props = { tips: Tip[]; categories: string[]; selected: string };

export default function Index({ tips, categories, selected }: Props) {
    function filter(category: string) {
        router.get('/household/tips', category ? { category } : {}, { preserveState: true });
    }

    function save(t: Tip) {
        router.post(`/household/tips/${t.id}/save`, {}, { preserveScroll: true });
    }

    function unsave(t: Tip) {
        router.delete(`/household/tips/${t.id}/save`, { preserveScroll: true });
    }

    return (
        <AppLayout>
            <Head title="Energy Tips" />
            <div className="p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-2xl font-bold">Energy-Saving Tips</h1>
                    <div className="flex items-center gap-3">
                        <select className="rounded-md border px-3 py-2" value={selected}
                            onChange={(e) => filter(e.target.value)}>
                            <option value="">All categories</option>
                            {categories.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                        <Link href="/household/saved-tips" className="underline">My saved tips</Link>
                    </div>
                </div>

                {tips.length === 0 && <p>No tips found.</p>}

                <div className="grid gap-4 md:grid-cols-2">
                    {tips.map((t) => (
                        <div key={t.id} className="rounded-lg border p-4">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                <h2 className="text-lg font-semibold">{t.title}</h2>
                                {t.category && (
                                    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-800">{t.category}</span>
                                )}
                                {t.suggested && (
                                    <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-800">
                                        Suggested for your appliances
                                    </span>
                                )}
                            </div>
                            <p className="mb-3 text-sm">{t.description}</p>
                            {t.saved ? (
                                <button onClick={() => unsave(t)} className="rounded-md border px-3 py-1 text-sm">
                                    Saved (click to remove)
                                </button>
                            ) : (
                                <button onClick={() => save(t)} className="rounded-md bg-black px-3 py-1 text-sm text-white">
                                    Save tip
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}