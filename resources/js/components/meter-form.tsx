import { Link, useForm } from '@inertiajs/react';
import { type FormEvent } from 'react';

type Meter = { id: number; meter_no: string; meter_type: string; installation_date: string };

export default function MeterForm({ meter }: { meter?: Meter }) {
    const { data, setData, post, put, processing, errors } = useForm({
        meter_no: meter?.meter_no ?? '',
        meter_type: meter?.meter_type ?? 'Single-phase',
        installation_date: meter?.installation_date?.slice(0, 10) ?? '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        if (meter) put(`/household/meters/${meter.id}`);
        else post('/household/meters');
    }

    const input = 'w-full rounded-md border px-3 py-2';

    return (
        <form onSubmit={submit} className="max-w-md space-y-4">
            <div>
                <label className="mb-1 block text-sm font-medium">Meter number</label>
                <input className={input} value={data.meter_no} onChange={(e) => setData('meter_no', e.target.value)} />
                {errors.meter_no && <p className="text-sm text-red-600">{errors.meter_no}</p>}
            </div>
            <div>
                <label className="mb-1 block text-sm font-medium">Meter type</label>
                <select className={input} value={data.meter_type} onChange={(e) => setData('meter_type', e.target.value)}>
                    <option>Single-phase</option>
                    <option>Three-phase</option>
                    <option>Prepaid</option>
                </select>
                {errors.meter_type && <p className="text-sm text-red-600">{errors.meter_type}</p>}
            </div>
            <div>
                <label className="mb-1 block text-sm font-medium">Installation date</label>
                <input type="date" className={input} value={data.installation_date}
                    onChange={(e) => setData('installation_date', e.target.value)} />
                {errors.installation_date && <p className="text-sm text-red-600">{errors.installation_date}</p>}
            </div>
            <div className="flex gap-3">
                <button type="submit" disabled={processing} className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50">
                    {meter ? 'Save changes' : 'Add meter'}
                </button>
                <Link href="/household/meters" className="rounded-md border px-4 py-2">Cancel</Link>
            </div>
        </form>
    );
}