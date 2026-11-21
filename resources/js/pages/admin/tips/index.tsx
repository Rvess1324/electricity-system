import { Head, Link, router } from '@inertiajs/react';

type Tip = {
    id: number;
    title: string;
    description: string;
    category: string | null;
};

export default function Index({ tips }: { tips: Tip[] }) {
    function remove(t: Tip) {
        if (
            confirm(
                `Delete the tip "${t.title}"? Households that saved it will lose it.`,
            )
        ) {
            router.delete(`/admin/tips/${t.id}`);
        }
    }

    return (
        <>
            <Head title="Energy Tips" />
            <div className="p-4 md:p-8">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Energy Tips
                    </h1>
                    <Link
                        href="/admin/tips/create"
                        className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                    >
                        Add tip
                    </Link>
                </div>

                <div className="overflow-x-auto rounded-xl border bg-card shadow-xs">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="p-3 font-medium">Title</th>
                                <th className="p-3 font-medium">Category</th>
                                <th className="p-3 font-medium">Description</th>
                                <th className="p-3 font-medium"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {tips.length === 0 && (
                                <tr>
                                    <td className="p-3" colSpan={4}>
                                        No tips yet. Add the first one.
                                    </td>
                                </tr>
                            )}
                            {tips.map((t) => (
                                <tr
                                    key={t.id}
                                    className="border-b last:border-0"
                                >
                                    <td className="p-3 font-medium">
                                        {t.title}
                                    </td>
                                    <td className="p-3">{t.category ?? '-'}</td>
                                    <td className="p-3">
                                        {t.description.length > 80
                                            ? t.description.slice(0, 80) + '...'
                                            : t.description}
                                    </td>
                                    <td className="space-x-3 p-3 text-right">
                                        <Link
                                            href={`/admin/tips/${t.id}/edit`}
                                            className="underline"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => remove(t)}
                                            className="text-red-600 underline"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
