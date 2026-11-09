import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

type Props = { stats: { meters: number; appliances: number; plans: number } };

export default function HouseholdDashboard({ stats }: Props) {
    return (
        <AppLayout>
            <Head title="Household Dashboard" />
            <div className="p-6">
                <h1 className="mb-4 text-2xl font-bold">Household Dashboard</h1>
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border p-4">Meters: <b>{stats.meters}</b></div>
                    <div className="rounded-lg border p-4">Appliances: <b>{stats.appliances}</b></div>
                    <div className="rounded-lg border p-4">Energy plans: <b>{stats.plans}</b></div>
                </div>
            </div>
        </AppLayout>
    );
}