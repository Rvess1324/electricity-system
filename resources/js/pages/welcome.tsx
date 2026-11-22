import { Head, Link, usePage } from '@inertiajs/react';
import {
    ClipboardList,
    Gauge,
    Lightbulb,
    Plug,
    ShieldCheck,
    UserCog,
    Wrench,
} from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { dashboard, login, register } from '@/routes';

const features = [
    {
        icon: Gauge,
        title: 'Meters and daily usage',
        text: 'Record kWh readings per meter and see the estimated cost, calculated by the system at the current rate.',
    },
    {
        icon: Plug,
        title: 'Appliance tracking',
        text: 'List your appliances with wattage, quantity and daily hours to see your estimated monthly consumption.',
    },
    {
        icon: ClipboardList,
        title: 'Monthly energy plans',
        text: 'Set a kWh target and a budget, choose planned hours per appliance, and compare the plan with your actual usage.',
    },
    {
        icon: Lightbulb,
        title: 'Energy-saving tips',
        text: 'Read tips published by the administrators, matched to your appliance categories, and save the ones you want to keep.',
    },
    {
        icon: Wrench,
        title: 'Service requests',
        text: 'Report an electrical problem against one of your meters and follow it from pending to assigned to resolved.',
    },
    {
        icon: ShieldCheck,
        title: 'Private by role',
        text: 'Households see only their own records. Electricians see only the requests assigned to them.',
    },
];

const steps = [
    {
        n: '1',
        title: 'Create your account',
        text: 'Register as a household owner and add your meters and appliances.',
    },
    {
        n: '2',
        title: 'Record and plan',
        text: 'Log your usage and build a monthly plan against your target and budget.',
    },
    {
        n: '3',
        title: 'Request help when needed',
        text: 'Send a service request. An administrator assigns an electrician.',
    },
    {
        n: '4',
        title: 'Track the result',
        text: 'See the status of your request and who is handling it.',
    },
];

const roles = [
    {
        icon: Plug,
        title: 'Household owners',
        points: [
            'Track meters, appliances and usage',
            'Plan a monthly kWh target and budget',
            'Submit and follow service requests',
        ],
    },
    {
        icon: Wrench,
        title: 'Electricians',
        points: [
            'See the requests assigned to you',
            'View the household address, contact and meter',
            'Mark finished jobs as resolved',
        ],
    },
    {
        icon: UserCog,
        title: 'Administrators',
        points: [
            'Monitor requests and their status',
            'Assign or reassign electricians',
            'Publish energy-saving tips',
        ],
    },
];

const faqs = [
    {
        q: 'How is the cost calculated?',
        a: 'The system multiplies the kWh you record by the electricity rate configured by the administrator. It is an estimate, not an official bill.',
    },
    {
        q: 'Who can see my information?',
        a: 'Only your household account. An electrician can see your name, address, contact number and meter only for requests assigned to them.',
    },
    {
        q: 'Can the platform switch my electricity on or off?',
        a: 'No. It records information and manages service requests. Electrical work is done by qualified electricians.',
    },
    {
        q: 'How do electrician and admin accounts get created?',
        a: 'They are set up by the system administrator. Anyone can register as a household owner.',
    },
];

export default function Welcome() {
    const { auth, currentTeam, name } = usePage().props;
    const dashboardUrl = currentTeam ? dashboard(currentTeam.slug) : '/';

    return (
        <>
            <Head title="Welcome" />
            <div className="min-h-screen bg-background text-foreground">
                <header className="sticky top-0 z-20 border-b border-sidebar-border bg-sidebar text-sidebar-foreground">
                    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
                        <Link
                            href="/"
                            className="flex items-center gap-2 font-semibold"
                        >
                            <span className="flex size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                                <AppLogoIcon className="size-5 fill-current" />
                            </span>
                            {name}
                        </Link>
                        <nav className="hidden items-center gap-6 text-sm md:flex">
                            <a
                                href="#features"
                                className="opacity-80 hover:opacity-100"
                            >
                                Features
                            </a>
                            <a
                                href="#how"
                                className="opacity-80 hover:opacity-100"
                            >
                                How it works
                            </a>
                            <a
                                href="#roles"
                                className="opacity-80 hover:opacity-100"
                            >
                                Roles
                            </a>
                            <a
                                href="#faq"
                                className="opacity-80 hover:opacity-100"
                            >
                                FAQ
                            </a>
                        </nav>
                        <div className="flex items-center gap-2 text-sm">
                            {auth.user ? (
                                <Link
                                    href={dashboardUrl}
                                    className="rounded-md bg-sidebar-primary px-4 py-2 font-medium text-sidebar-primary-foreground"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="rounded-md px-3 py-2 hover:bg-sidebar-accent"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="rounded-md bg-sidebar-primary px-4 py-2 font-medium text-sidebar-primary-foreground"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                <section className="bg-sidebar text-sidebar-foreground">
                    <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
                        <div>
                            <p className="mb-3 text-sm font-medium tracking-wide text-sidebar-primary uppercase">
                                Electricity management
                            </p>
                            <h1 className="text-4xl leading-tight font-semibold tracking-tight md:text-5xl">
                                Know your usage.{' '}
                                <span className="text-sidebar-primary">
                                    Get electrical help faster.
                                </span>
                            </h1>
                            <p className="mt-5 max-w-lg text-base opacity-80">
                                One platform where households track their
                                electricity use and request service,
                                administrators coordinate the work, and
                                electricians see what is assigned to them.
                            </p>
                            <div className="mt-8 flex flex-wrap gap-3">
                                {auth.user ? (
                                    <Link
                                        href={dashboardUrl}
                                        className="rounded-md bg-sidebar-primary px-6 py-3 font-medium text-sidebar-primary-foreground"
                                    >
                                        Go to dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={register()}
                                            className="rounded-md bg-sidebar-primary px-6 py-3 font-medium text-sidebar-primary-foreground"
                                        >
                                            Create an account
                                        </Link>
                                        <Link
                                            href={login()}
                                            className="rounded-md border border-sidebar-border px-6 py-3 font-medium hover:bg-sidebar-accent"
                                        >
                                            Log in
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                        <div
                            aria-hidden
                            className="rounded-2xl border border-sidebar-border bg-sidebar-accent/40 p-6"
                        >
                            <div className="mb-4 flex items-center justify-between text-sm">
                                <span className="font-medium">Daily usage</span>
                                <span className="opacity-60">Illustration</span>
                            </div>
                            <div className="flex h-40 items-end gap-2">
                                {[
                                    45, 60, 40, 55, 70, 50, 65, 48, 58, 42, 62,
                                    52,
                                ].map((h, i) => (
                                    <div
                                        key={i}
                                        style={{ height: `${h}%` }}
                                        className={`flex-1 rounded-t ${i === 4 ? 'bg-sidebar-primary' : 'bg-sidebar-foreground/25'}`}
                                    />
                                ))}
                            </div>
                            <div className="mt-5 grid grid-cols-3 gap-3 text-xs">
                                {['Meters', 'Plans', 'Requests'].map((t) => (
                                    <div
                                        key={t}
                                        className="rounded-lg bg-sidebar/60 px-3 py-2 text-center opacity-90"
                                    >
                                        {t}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section id="features" className="mx-auto max-w-6xl px-4 py-16">
                    <h2 className="text-3xl font-semibold tracking-tight">
                        What the platform does
                    </h2>
                    <p className="mt-2 max-w-2xl text-muted-foreground">
                        Everything here is available in the application today.
                    </p>
                    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((f) => (
                            <div
                                key={f.title}
                                className="rounded-xl border bg-card p-5 shadow-xs"
                            >
                                <span className="mb-3 flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                                    <f.icon className="size-5" />
                                </span>
                                <h3 className="font-semibold">{f.title}</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {f.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="how" className="border-y bg-muted/40">
                    <div className="mx-auto max-w-6xl px-4 py-16">
                        <h2 className="text-3xl font-semibold tracking-tight">
                            How it works
                        </h2>
                        <div className="mt-8 grid gap-4 md:grid-cols-4">
                            {steps.map((s) => (
                                <div
                                    key={s.n}
                                    className="rounded-xl border bg-card p-5"
                                >
                                    <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                                        {s.n}
                                    </span>
                                    <h3 className="mt-3 font-semibold">
                                        {s.title}
                                    </h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {s.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="roles" className="mx-auto max-w-6xl px-4 py-16">
                    <h2 className="text-3xl font-semibold tracking-tight">
                        Built for three roles
                    </h2>
                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                        {roles.map((r) => (
                            <div
                                key={r.title}
                                className="rounded-xl border bg-card p-6"
                            >
                                <r.icon className="size-6 text-primary" />
                                <h3 className="mt-3 text-lg font-semibold">
                                    {r.title}
                                </h3>
                                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                                    {r.points.map((p) => (
                                        <li key={p} className="flex gap-2">
                                            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-sidebar-primary" />
                                            {p}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="faq" className="border-t bg-muted/40">
                    <div className="mx-auto max-w-3xl px-4 py-16">
                        <h2 className="text-3xl font-semibold tracking-tight">
                            Frequently asked questions
                        </h2>
                        <div className="mt-6 space-y-3">
                            {faqs.map((f) => (
                                <details
                                    key={f.q}
                                    className="group rounded-xl border bg-card p-4"
                                >
                                    <summary className="cursor-pointer font-medium">
                                        {f.q}
                                    </summary>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {f.a}
                                    </p>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                {!auth.user && (
                    <section className="bg-sidebar text-sidebar-foreground">
                        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-12 text-center">
                            <h2 className="text-2xl font-semibold">
                                Ready to get started?
                            </h2>
                            <div className="flex gap-3">
                                <Link
                                    href={register()}
                                    className="rounded-md bg-sidebar-primary px-6 py-3 font-medium text-sidebar-primary-foreground"
                                >
                                    Register
                                </Link>
                                <Link
                                    href={login()}
                                    className="rounded-md border border-sidebar-border px-6 py-3 font-medium hover:bg-sidebar-accent"
                                >
                                    Log in
                                </Link>
                            </div>
                        </div>
                    </section>
                )}

                <footer className="border-t bg-sidebar text-sm text-sidebar-foreground/70">
                    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-6">
                        <span>
                            © {new Date().getFullYear()} {name}
                        </span>
                        <span>
                            Household usage tracking and electrician service
                            requests.
                        </span>
                    </div>
                </footer>
            </div>
        </>
    );
}
