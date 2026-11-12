import { Link, useForm } from '@inertiajs/react';
import { type FormEvent } from 'react';

type Item = {
    id: number;
    appliance_id: number;
    planned_hours_per_day: number | string;
    priority: string;
};

type Props = {
    plan: { id: number; plan_name: string };
    appliances: { id: number; appliance_name: string }[];
    item?: Item;
};

export default function PlanItemForm({ plan, appliances, item }: Props) {
    const { data, setData, post, put, processing, errors } = useForm({
        // 'new' means: create a brand-new appliance together with this item
        appliance_id: item?.appliance_id?.toString() ?? (appliances.length === 0 ? 'new' : ''),
        planned_hours_per_day: item?.planned_hours_per_day?.toString() ?? '',
        priority: item?.priority ?? 'medium',
        new_appliance_name: '',
        new_wattage: '',
        new_quantity: '1',
        new_hours_per_day: '',
        new_category: '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        if (item) {
            put(`/household/plans/${plan.id}/items/${item.id}`);
        } else {
            post(`/household/plans/${plan.id}/items`);
        }
    }

    const input = 'w-full rounded-md border px-3 py-2';
    const isNew = data.appliance_id === 'new';

    return (
        <form onSubmit={submit} className="max-w-md space-y-4">
            <div>
                <label className="mb-1 block text-sm font-medium">Appliance</label>
                <select className={input} value={data.appliance_id}
                    onChange={(e) => setData('appliance_id', e.target.value)}>
                    <option value="">Choose an appliance...</option>
                    {!item && <option value="new">+ Create a new appliance</option>}
                    {appliances.map((a) => (
                        <option key={a.id} value={a.id}>{a.appliance_name}</option>
                    ))}
                </select>
                {errors.appliance_id && <p className="text-sm text-red-600">{errors.appliance_id}</p>}
            </div>

            {isNew && (
                <div className="space-y-4 rounded-lg border p-4">
                    <p className="text-sm text-gray-500">
                        This appliance will also be saved in your <Link href="/household/appliances" className="underline">Appliances</Link> list.
                    </p>

                    <div>
                        <label className="mb-1 block text-sm font-medium">New appliance name</label>
                        <input className={input} value={data.new_appliance_name}
                            onChange={(e) => setData('new_appliance_name', e.target.value)} />
                        {errors.new_appliance_name && <p className="text-sm text-red-600">{errors.new_appliance_name}</p>}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">Wattage (W)</label>
                        <input type="number" className={input} value={data.new_wattage}
                            onChange={(e) => setData('new_wattage', e.target.value)} />
                        {errors.new_wattage && <p className="text-sm text-red-600">{errors.new_wattage}</p>}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">How many do you have?</label>
                        <input type="number" min="1" className={input} value={data.new_quantity}
                            onChange={(e) => setData('new_quantity', e.target.value)} />
                        {errors.new_quantity && <p className="text-sm text-red-600">{errors.new_quantity}</p>}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">Usual hours used per day</label>
                        <input type="number" step="0.25" className={input} value={data.new_hours_per_day}
                            onChange={(e) => setData('new_hours_per_day', e.target.value)} />
                        {errors.new_hours_per_day && <p className="text-sm text-red-600">{errors.new_hours_per_day}</p>}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">Category (optional)</label>
                        <input className={input} value={data.new_category}
                            onChange={(e) => setData('new_category', e.target.value)} />
                        {errors.new_category && <p className="text-sm text-red-600">{errors.new_category}</p>}
                    </div>
                </div>
            )}

            <div>
                <label className="mb-1 block text-sm font-medium">Planned hours per day</label>
                <input type="number" step="0.25" className={input} value={data.planned_hours_per_day}
                    onChange={(e) => setData('planned_hours_per_day', e.target.value)} />
                {errors.planned_hours_per_day && <p className="text-sm text-red-600">{errors.planned_hours_per_day}</p>}
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium">Priority</label>
                <select className={input} value={data.priority}
                    onChange={(e) => setData('priority', e.target.value)}>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>
                {errors.priority && <p className="text-sm text-red-600">{errors.priority}</p>}
            </div>

            <div className="flex gap-3">
                <button type="submit" disabled={processing}
                    className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50">
                    {item ? 'Save changes' : 'Add to plan'}
                </button>
                <Link href={`/household/plans/${plan.id}`} className="rounded-md border px-4 py-2">Cancel</Link>
            </div>
        </form>
    );
}