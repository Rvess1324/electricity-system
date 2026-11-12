import { Link, useForm } from '@inertiajs/react';
import { type FormEvent } from 'react';

type Appliance = {
    id: number;
    appliance_name: string;
    wattage: number;
    quantity: number;
    hours_per_day: number | string;
    category: string | null;
};

export default function ApplianceForm({ appliance }: { appliance?: Appliance }) {
    const { data, setData, post, put, processing, errors } = useForm({
        appliance_name: appliance?.appliance_name ?? '',
        wattage: appliance?.wattage?.toString() ?? '',
        quantity: appliance?.quantity?.toString() ?? '1',
        hours_per_day: appliance?.hours_per_day?.toString() ?? '',
        category: appliance?.category ?? '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        if (appliance) {
            put(`/household/appliances/${appliance.id}`);
        } else {
            post('/household/appliances');
        }
    }

    const input = 'w-full rounded-md border px-3 py-2';

    return (
        <form onSubmit={submit} className="max-w-md space-y-4">
            <div>
                <label className="mb-1 block text-sm font-medium">Appliance name</label>
                <input className={input} value={data.appliance_name}
                    onChange={(e) => setData('appliance_name', e.target.value)} />
                {errors.appliance_name && <p className="text-sm text-red-600">{errors.appliance_name}</p>}
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium">Wattage of one unit (W)</label>
                <input type="number" className={input} value={data.wattage}
                    onChange={(e) => setData('wattage', e.target.value)} />
                {errors.wattage && <p className="text-sm text-red-600">{errors.wattage}</p>}
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium">How many do you have?</label>
                <input type="number" min="1" className={input} value={data.quantity}
                    onChange={(e) => setData('quantity', e.target.value)} />
                {errors.quantity && <p className="text-sm text-red-600">{errors.quantity}</p>}
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium">Hours used per day (each unit)</label>
                <input type="number" step="0.25" className={input} value={data.hours_per_day}
                    onChange={(e) => setData('hours_per_day', e.target.value)} />
                {errors.hours_per_day && <p className="text-sm text-red-600">{errors.hours_per_day}</p>}
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium">Category (optional)</label>
                <input className={input} value={data.category}
                    onChange={(e) => setData('category', e.target.value)} />
                {errors.category && <p className="text-sm text-red-600">{errors.category}</p>}
            </div>

            <div className="flex gap-3">
                <button type="submit" disabled={processing}
                    className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50">
                    {appliance ? 'Save changes' : 'Add appliance'}
                </button>
                <Link href="/household/appliances" className="rounded-md border px-4 py-2">Cancel</Link>
            </div>
        </form>
    );
}