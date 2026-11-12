import { Link, useForm } from '@inertiajs/react';
import { type FormEvent } from 'react';

type Tip = {
    id: number;
    title: string;
    description: string;
    category: string | null;
};

export default function TipForm({ tip, categories }: { tip?: Tip; categories: string[] }) {
    const { data, setData, post, put, processing, errors } = useForm({
        title: tip?.title ?? '',
        description: tip?.description ?? '',
        category: tip?.category ?? '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        if (tip) {
            put(`/admin/tips/${tip.id}`);
        } else {
            post('/admin/tips');
        }
    }

    const input = 'w-full rounded-md border px-3 py-2';

    return (
        <form onSubmit={submit} className="max-w-md space-y-4">
            <div>
                <label className="mb-1 block text-sm font-medium">Title</label>
                <input className={input} value={data.title}
                    onChange={(e) => setData('title', e.target.value)} />
                {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium">Description</label>
                <textarea rows={5} className={input} value={data.description}
                    onChange={(e) => setData('description', e.target.value)} />
                {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium">Category</label>
                <select className={input} value={data.category}
                    onChange={(e) => setData('category', e.target.value)}>
                    <option value="">Choose a category...</option>
                    {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
                {errors.category && <p className="text-sm text-red-600">{errors.category}</p>}
            </div>

            <div className="flex gap-3">
                <button type="submit" disabled={processing}
                    className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50">
                    {tip ? 'Save changes' : 'Add tip'}
                </button>
                <Link href="/admin/tips" className="rounded-md border px-4 py-2">Cancel</Link>
            </div>
        </form>
    );
}