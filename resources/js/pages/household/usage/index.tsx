import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';

type Record = { id: number; usage_date: string; kwh_used: number | string; estimated_cost: number | string };
type Props = {
    meter: { id: number; meter_no: string };
    records: Record[];
    rate: number;
    totals: { kwh: number; cost: number };
};

export default function Index({ meter, records, rate, totals }: Props) {
    function remove(r: Record) {
        if (confirm(`Delete the record for ${r.usage_date.slice(0, 10)}?`)) {
            router.delete(`/household/meters/${meter.id}/usage/${r.id}`);
        }
    }

    return (
        <AppLayout>
            <Head title="Usage Records" />
            <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Usage: {meter.meter_no}</h1>
                        <Link href="/household/meters" className="text-sm underline">Back to meters</Link>
                    </div>
                    <Link href={`/household/meters/${meter.id}/usage/create`} className="rounded-md bg-black px-4 py-2 text-white">
                        Add record
                    </Link>
                </div>
                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="p-3">Date</th>
                                <th className="p-3">kWh</th>
                                <th className="p-3">Est. cost</th>
                                <th className="p-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.length === 0 && <tr><td className="p-3" colSpan={4}>No records yet.</td></tr>}
                            {records.map((r) => (
                                <tr key={r.id} className="border-b last:border-0">
                                    <td className="p-3">{r.usage_date.slice(0, 10)}</td>
                                    <td className="p-3">{Number(r.kwh_used).toFixed(2)}</td>
                                    <td className="p-3">{Number(r.estimated_cost).toFixed(2)}</td>
                                    <td className="space-x-3 p-3 text-right">
                                        <Link href={`/household/meters/${meter.id}/usage/${r.id}/edit`} className="underline">Edit</Link>
                                        <button onClick={() => remove(r)} className="text-red-600 underline">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="mt-4 text-sm">
                    Total: <b>{totals.kwh.toFixed(2)} kWh</b> costing <b>{totals.cost.toFixed(2)}</b> (rate {rate}/kWh)
                </p>
            </div>
        </AppLayout>
    );
}