import { Head, Link, router } from '@inertiajs/react';

type Appliance = {
    id: number;
    appliance_name: string;
    wattage: number;
    quantity: number;
    hours_per_day: number | string;
    category: string | null;
};

export default function Index({ appliances }: { appliances: Appliance[] }) {
    // kWh per month = watts x quantity x hours/day x 30 days / 1000
    const monthlyKwh = (a: Appliance) =>
        (a.wattage * a.quantity * Number(a.hours_per_day) * 30) / 1000;
    const total = appliances.reduce((sum, a) => sum + monthlyKwh(a), 0);

    function remove(a: Appliance) {
        if (confirm(`Delete ${a.appliance_name}?`)) {
            router.delete(`/household/appliances/${a.id}`);
        }
    }

    return (
        <>
            <Head title="Appliances" />
            <div className="p-4 md:p-8">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        My Appliances
                    </h1>
                    <Link
                        href="/household/appliances/create"
                        className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                    >
                        Add appliance
                    </Link>
                </div>

                <div className="overflow-x-auto rounded-xl border bg-card shadow-xs">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="p-3 font-medium">Name</th>
                                <th className="p-3 font-medium">Category</th>
                                <th className="p-3 font-medium">
                                    Watts (each)
                                </th>
                                <th className="p-3 font-medium">Qty</th>
                                <th className="p-3 font-medium">Hours/day</th>
                                <th className="p-3 font-medium">
                                    Est. kWh/month
                                </th>
                                <th className="p-3 font-medium"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {appliances.length === 0 && (
                                <tr>
                                    <td className="p-3" colSpan={7}>
                                        No appliances yet. Add your first one.
                                    </td>
                                </tr>
                            )}
                            {appliances.map((a) => (
                                <tr
                                    key={a.id}
                                    className="border-b last:border-0"
                                >
                                    <td className="p-3">{a.appliance_name}</td>
                                    <td className="p-3">{a.category ?? '-'}</td>
                                    <td className="p-3">{a.wattage}</td>
                                    <td className="p-3">{a.quantity}</td>
                                    <td className="p-3">{a.hours_per_day}</td>
                                    <td className="p-3">
                                        {monthlyKwh(a).toFixed(1)}
                                    </td>
                                    <td className="space-x-3 p-3 text-right">
                                        <Link
                                            href={`/household/appliances/${a.id}/edit`}
                                            className="underline"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => remove(a)}
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

                <p className="mt-4 text-sm">
                    Total estimated: <b>{total.toFixed(1)} kWh/month</b>
                </p>
            </div>
        </>
    );
}
