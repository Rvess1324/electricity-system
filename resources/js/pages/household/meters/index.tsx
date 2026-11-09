import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';

type Meter = {
    id: number;
    meter_no: string;
    meter_type: string;
    installation_date: string;
    usage_records_count: number;
};

export default function Index({ meters }: { meters: Meter[] }) {
    function remove(m: Meter) {
        if (confirm(`Delete meter ${m.meter_no} and all its usage records?`)) {
            router.delete(`/household/meters/${m.id}`);
        }
    }

    return (
        <AppLayout>
            <Head title="Meters" />
            <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">My Meters</h1>
                    <Link href="/household/meters/create" className="rounded-md bg-black px-4 py-2 text-white">Add meter</Link>
                </div>
                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="p-3">Meter no.</th>
                                <th className="p-3">Type</th>
                                <th className="p-3">Installed</th>
                                <th className="p-3">Records</th>
                                <th className="p-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {meters.length === 0 && <tr><td className="p-3" colSpan={5}>No meters yet.</td></tr>}
                            {meters.map((m) => (
                                <tr key={m.id} className="border-b last:border-0">
                                    <td className="p-3">{m.meter_no}</td>
                                    <td className="p-3">{m.meter_type}</td>
                                    <td className="p-3">{m.installation_date?.slice(0, 10)}</td>
                                    <td className="p-3">{m.usage_records_count}</td>
                                    <td className="space-x-3 p-3 text-right">
                                        <Link href={`/household/meters/${m.id}/usage`} className="underline">Usage</Link>
                                        <Link href={`/household/meters/${m.id}/edit`} className="underline">Edit</Link>
                                        <button onClick={() => remove(m)} className="text-red-600 underline">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}