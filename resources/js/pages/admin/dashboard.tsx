import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

type Props = { stats: { users: number; tips: number; requests: number } };

export default function AdminDashboard({ stats }: Props) {
    return (
        <AppLayout>
            <Head title="Admin Dashboard" />
            <div className="p-6">
                <h1 className="mb-4 text-2xl font-bold">Admin Dashboard</h1>
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border p-4">Users: <b>{stats.users}</b></div>
                    <div className="rounded-lg border p-4">Energy tips: <b>{stats.tips}</b></div>
                    <div className="rounded-lg border p-4">Service requests: <b>{stats.requests}</b></div>
                </div>
            </div>
        </AppLayout>
    );
}