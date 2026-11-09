import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';

type Appliance = {
    id: number;
    appliance_name: string;
    wattage: number;
    hours_per_day: number | string;
    category: string | null;
};

export default function Index({ appliances }: { appliances: Appliance[] }) {
    // kWh per month = watts x hours/day x 30 days / 1000
    const monthlyKwh = (a: Appliance) => (a.wattage * Number(a.hours_per_day) * 30) / 1000;
    const total = appliances.reduce((sum, a) => sum + monthlyKwh(a), 0);

    function remove(a: Appliance) {
        if (confirm(`Delete ${a.appliance_name}?`)) {
            router.delete(`/household/appliances/${a.id}`);
        }
    }

    return (
        <AppLayout>
            <Head title="Appliances" />
            <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">My Appliances</h1>
                    <Link href="/household/appliances/create" className="rounded-md bg-black px-4 py-2 text-white">
                        Add appliance
                    </Link>
                </div>

                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="p-3">Name</th>
                                <th className="p-3">Category</th>
                                <th className="p-3">Watts</th>
                                <th className="p-3">Hours/day</th>
                                <th className="p-3">Est. kWh/month</th>
                                <th className="p-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {appliances.length === 0 && (
                                <tr><td className="p-3" colSpan={6}>No appliances yet. Add your first one.</td></tr>
                            )}
                            {appliances.map((a) => (
                                <tr key={a.id} className="border-b last:border-0">
                                    <td className="p-3">{a.appliance_name}</td>
                                    <td className="p-3">{a.category ?? '-'}</td>
                                    <td className="p-3">{a.wattage}</td>
                                    <td className="p-3">{a.hours_per_day}</td>
                                    <td className="p-3">{monthlyKwh(a).toFixed(1)}</td>
                                    <td className="space-x-3 p-3 text-right">
                                        <Link href={`/household/appliances/${a.id}/edit`} className="underline">Edit</Link>
                                        <button onClick={() => remove(a)} className="text-red-600 underline">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <p className="mt-4 text-sm">Total estimated: <b>{total.toFixed(1)} kWh/month</b></p>
            </div>
        </AppLayout>
    );
}