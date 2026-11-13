import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { type FormEvent } from 'react';

export default function Create({ meters }: { meters: { id: number; meter_no: string }[] }) {
    const { data, setData, post, processing, errors } = useForm({
        meter_id: '',
        issue_description: '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post('/household/requests', { onSuccess: () => router.flushAll() });
    }

    const input = 'w-full rounded-md border px-3 py-2';

    return (
        <AppLayout>
            <Head title="New Service Request" />
            <div className="p-6">
                <h1 className="mb-4 text-2xl font-bold">New Service Request</h1>

                {meters.length === 0 ? (
                    <p>
                        You need a meter first. <Link href="/household/meters/create" className="underline">Add a meter</Link>.
                    </p>
                ) : (
                    <form onSubmit={submit} className="max-w-md space-y-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium">Meter</label>
                            <select className={input} value={data.meter_id}
                                onChange={(e) => setData('meter_id', e.target.value)}>
                                <option value="">Choose a meter...</option>
                                {meters.map((m) => (
                                    <option key={m.id} value={m.id}>{m.meter_no}</option>
                                ))}
                            </select>
                            {errors.meter_id && <p className="text-sm text-red-600">{errors.meter_id}</p>}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">Describe the problem</label>
                            <textarea rows={5} className={input} value={data.issue_description}
                                onChange={(e) => setData('issue_description', e.target.value)} />
                            {errors.issue_description && <p className="text-sm text-red-600">{errors.issue_description}</p>}
                        </div>

                        <div className="flex gap-3">
                            <button type="submit" disabled={processing}
                                className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50">
                                Send request
                            </button>
                            <Link href="/household/requests" className="rounded-md border px-4 py-2">Cancel</Link>
                        </div>
                    </form>
                )}
            </div>
        </AppLayout>
    );
}