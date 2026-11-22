import { useConfirm } from '@/hooks/use-confirm';
import EmailCell from '@/components/email-cell';
import ListToolbar from '@/components/list-toolbar';
import Pagination, { type Paginated } from '@/components/pagination';
import { Head, Link, router } from '@inertiajs/react';

type Household = {
    id: number;
    name: string;
    email: string;
    user_id: number;
    email_verified: boolean;
    address: string;
    phone_no: string | null;
    meters_count: number;
    open_requests: number;
};

export default function Index({
    households,
}: {
    households: Paginated<Household>;
}) {
    const { ask, dialog } = useConfirm();

    function remove(h: Household) {
        ask({
            title: 'Delete household account',
            description: `Delete the account of ${h.name}? Their meters, usage, appliances, plans and requests will be deleted too.`,
            confirmLabel: 'Delete',
            destructive: true,
            onConfirm: () => {
                router.delete(`/admin/households/${h.id}`);
            },
        });
    }

    return (
        <>
            <Head title="Households" />
            {dialog}
            <div className="p-4 md:p-8">
                <h1 className="mb-4 text-2xl font-semibold tracking-tight">
                    Households
                </h1>

                <ListToolbar placeholder="Search name, email, address..." />
                <div className="overflow-x-auto rounded-xl border bg-card shadow-xs">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="p-3 font-medium">Name</th>
                                <th className="p-3 font-medium">Email</th>
                                <th className="p-3 font-medium">Address</th>
                                <th className="p-3 font-medium">Phone</th>
                                <th className="p-3 font-medium">Meters</th>
                                <th className="p-3 font-medium">
                                    Open requests
                                </th>
                                <th className="p-3 font-medium"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {households.data.length === 0 && (
                                <tr>
                                    <td className="p-3" colSpan={7}>
                                        No households found.
                                    </td>
                                </tr>
                            )}
                            {households.data.map((h) => (
                                <tr
                                    key={h.id}
                                    className="border-b last:border-0"
                                >
                                    <td className="p-3 font-medium">
                                        {h.name}
                                    </td>
                                    <td className="p-3">
                                        <EmailCell
                                            email={h.email}
                                            verified={h.email_verified}
                                            userId={h.user_id}
                                        />
                                    </td>
                                    <td className="p-3">{h.address}</td>
                                    <td className="p-3">{h.phone_no ?? '-'}</td>
                                    <td className="p-3">{h.meters_count}</td>
                                    <td className="p-3">{h.open_requests}</td>
                                    <td className="space-x-3 p-3 text-right">
                                        <Link
                                            href={`/admin/households/${h.id}/edit`}
                                            className="underline"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => remove(h)}
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
                <Pagination page={households} />
            </div>
        </>
    );
}
