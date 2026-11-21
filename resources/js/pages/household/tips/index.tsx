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
        router.get('/household/tips', category ? { category } : {}, {
            preserveState: true,
        });
    }

    function save(t: Tip) {
        router.post(
            `/household/tips/${t.id}/save`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => router.flushAll(),
            },
        );
    }

    function unsave(t: Tip) {
        router.delete(`/household/tips/${t.id}/save`, {
            preserveScroll: true,
            onSuccess: () => router.flushAll(),
        });
    }

    return (
        <>
            <Head title="Energy Tips" />
            <div className="p-4 md:p-8">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Energy-Saving Tips
                    </h1>
                    <div className="flex items-center gap-3">
                        <select
                            className="rounded-md border px-3 py-2"
                            value={selected}
                            onChange={(e) => filter(e.target.value)}
                        >
                            <option value="">All categories</option>
                            {categories.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                        <Link
                            href="/household/saved-tips"
                            className="underline"
                        >
                            My saved tips
                        </Link>
                    </div>
                </div>

                {tips.length === 0 && <p>No tips found.</p>}

                <div className="grid gap-4 md:grid-cols-2">
                    {tips.map((t) => (
                        <div
                            key={t.id}
                            className="rounded-xl border bg-card p-4 shadow-xs"
                        >
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                <h2 className="text-lg font-semibold">
                                    {t.title}
                                </h2>
                                {t.category && (
                                    <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                        {t.category}
                                    </span>
                                )}
                                {t.suggested && (
                                    <span className="rounded bg-success-soft px-2 py-0.5 text-xs text-success">
                                        Suggested for your appliances
                                    </span>
                                )}
                            </div>
                            <p className="mb-3 text-sm">{t.description}</p>
                            {t.saved ? (
                                <button
                                    onClick={() => unsave(t)}
                                    className="rounded-md border px-3 py-1 text-sm"
                                >
                                    Saved (click to remove)
                                </button>
                            ) : (
                                <button
                                    onClick={() => save(t)}
                                    className="rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground hover:bg-primary/90"
                                >
                                    Save tip
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
