import { useConfirm } from '@/hooks/use-confirm';
import Pagination, { type Paginated } from '@/components/pagination';
import { peso } from '@/lib/currency';
import { Head, Link, router } from '@inertiajs/react';

type Record = {
    id: number;
    usage_date: string;
    kwh_used: number | string;
    estimated_cost: number | string;
};
type Props = {
    meter: { id: number; meter_no: string };
    records: Paginated<Record>;
    rate: number;
    totals: { kwh: number; cost: number };
};

export default function Index({ meter, records, rate, totals }: Props) {
    const { ask, dialog } = useConfirm();

    function remove(r: Record) {
        ask({
            title: 'Delete usage record',
            description: `Delete the record for ${r.usage_date.slice(0, 10)}?`,
            confirmLabel: 'Delete',
            destructive: true,
            onConfirm: () => {
                router.delete(`/household/meters/${meter.id}/usage/${r.id}`);
            },
        });
    }

    return (
        <>
            <Head title="Usage Records" />
            {dialog}
            <div className="p-4 md:p-8">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Usage: {meter.meter_no}
                        </h1>
                        <Link
                            href="/household/meters"
                            className="text-sm underline"
                        >
                            Back to meters
                        </Link>
                    </div>
                    <Link
                        href={`/household/meters/${meter.id}/usage/create`}
                        className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                    >
                        Add record
                    </Link>
                </div>
                <div className="overflow-x-auto rounded-xl border bg-card shadow-xs">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="p-3 font-medium">Date</th>
                                <th className="p-3 font-medium">kWh</th>
                                <th className="p-3 font-medium">Est. cost</th>
                                <th className="p-3 font-medium"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.data.length === 0 && (
                                <tr>
                                    <td className="p-3" colSpan={4}>
                                        No records yet.
                                    </td>
                                </tr>
                            )}
                            {records.data.map((r) => (
                                <tr
                                    key={r.id}
                                    className="border-b last:border-0"
                                >
                                    <td className="p-3">
                                        {r.usage_date.slice(0, 10)}
                                    </td>
                                    <td className="p-3">
                                        {Number(r.kwh_used).toFixed(2)}
                                    </td>
                                    <td className="p-3">
                                        {peso(r.estimated_cost)}
                                    </td>
                                    <td className="space-x-3 p-3 text-right">
                                        <Link
                                            href={`/household/meters/${meter.id}/usage/${r.id}/edit`}
                                            className="underline"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => remove(r)}
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
                <Pagination page={records} />
                <p className="mt-4 text-sm">
                    Total: <b>{totals.kwh.toFixed(2)} kWh</b> costing{' '}
                    <b>{peso(totals.cost)}</b> (rate {peso(rate)}/kWh)
                </p>
            </div>
        </>
    );
}
