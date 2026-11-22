import { Head, Link, usePage } from '@inertiajs/react';
import { Gauge, HardHat, Lightbulb } from 'lucide-react';
import { dashboard, login, register } from '@/routes';

const features = [
    {
        icon: Gauge,
        title: 'Track your usage',
        text: 'Record meter readings and see your daily kWh and estimated cost.',
    },
    {
        icon: Lightbulb,
        title: 'Save on your bill',
        text: 'Plan your monthly budget and follow practical energy-saving tips.',
    },
    {
        icon: HardHat,
        title: 'Get electrical help',
        text: 'Send a service request and follow it until an electrician resolves it.',
    },
];

export default function Welcome() {
    const { auth, currentTeam } = usePage().props;
    const dashboardUrl = currentTeam ? dashboard(currentTeam.slug) : '/';
    const button = 'rounded-md px-5 py-2 text-sm font-medium';

    return (
        <>
            <Head title="Electricity System" />
            <div className="min-h-screen bg-background text-foreground">
                <header className="mx-auto flex max-w-5xl items-center justify-between p-4 md:p-6">
                    <span className="text-lg font-semibold">
                        Electricity System
                    </span>
                    <nav className="flex items-center gap-2">
                        {auth.user ? (
                            <Link
                                href={dashboardUrl}
                                className={`${button} bg-primary text-primary-foreground hover:bg-primary/90`}
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className={`${button} hover:bg-muted`}
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={register()}
                                    className={`${button} bg-primary text-primary-foreground hover:bg-primary/90`}
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </nav>
                </header>

                <main className="mx-auto max-w-5xl px-4 py-12 md:px-6 md:py-20">
                    <h1 className="max-w-2xl text-3xl font-bold tracking-tight md:text-5xl">
                        Know your electricity. Spend less. Get help fast.
                    </h1>
                    <p className="mt-4 max-w-xl text-muted-foreground">
                        Manage your meters, appliances and monthly plan in one
                        place, and request an electrician when something goes
                        wrong.
                    </p>
                    {!auth.user && (
                        <Link
                            href={register()}
                            className={`${button} mt-6 inline-block bg-primary text-primary-foreground hover:bg-primary/90`}
                        >
                            Get started
                        </Link>
                    )}

                    <div className="mt-12 grid gap-4 md:grid-cols-3">
                        {features.map(({ icon: Icon, title, text }) => (
                            <div
                                key={title}
                                className="rounded-xl border bg-card p-5"
                            >
                                <Icon className="mb-3 size-6" />
                                <h2 className="font-semibold">{title}</h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {text}
                                </p>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </>
    );
}
