import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

type Props = { stats: { assigned: number; resolved: number } };

export default function ElectricianDashboard({ stats }: Props) {
    return (
        <AppLayout>
            <Head title="Electrician Dashboard" />
            <div className="p-6">
                <h1 className="mb-4 text-2xl font-bold">Electrician Dashboard</h1>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border p-4">Assigned requests: <b>{stats.assigned}</b></div>
                    <div className="rounded-lg border p-4">Resolved requests: <b>{stats.resolved}</b></div>
                </div>
            </div>
        </AppLayout>
    );
}