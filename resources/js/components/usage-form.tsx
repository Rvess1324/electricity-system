import { Link, useForm } from '@inertiajs/react';
import { type FormEvent } from 'react';

type Meter = { id: number; meter_no: string };
type Record = { id: number; usage_date: string; kwh_used: number | string };

export default function UsageForm({ meter, rate, record }: { meter: Meter; rate: number; record?: Record }) {
    const { data, setData, post, put, processing, errors } = useForm({
        usage_date: record?.usage_date?.slice(0, 10) ?? '',
        kwh_used: record?.kwh_used?.toString() ?? '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        if (record) put(`/household/meters/${meter.id}/usage/${record.id}`);
        else post(`/household/meters/${meter.id}/usage`);
    }

    const input = 'w-full rounded-md border px-3 py-2';
    const preview = (Number(data.kwh_used) || 0) * rate;

    return (
        <form onSubmit={submit} className="max-w-md space-y-4">
            <div>
                <label className="mb-1 block text-sm font-medium">Date</label>
                <input type="date" className={input} value={data.usage_date}
                    onChange={(e) => setData('usage_date', e.target.value)} />
                {errors.usage_date && <p className="text-sm text-red-600">{errors.usage_date}</p>}
            </div>
            <div>
                <label className="mb-1 block text-sm font-medium">kWh used</label>
                <input type="number" step="0.01" className={input} value={data.kwh_used}
                    onChange={(e) => setData('kwh_used', e.target.value)} />
                {errors.kwh_used && <p className="text-sm text-red-600">{errors.kwh_used}</p>}
            </div>
            <p className="text-sm">Estimated cost at {rate} per kWh: <b>{preview.toFixed(2)}</b></p>
            <div className="flex gap-3">
                <button type="submit" disabled={processing} className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50">
                    {record ? 'Save changes' : 'Add record'}
                </button>
                <Link href={`/household/meters/${meter.id}/usage`} className="rounded-md border px-4 py-2">Cancel</Link>
            </div>
        </form>
    );
}