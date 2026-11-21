import { Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props;

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-sidebar p-6 md:p-10">
            <div className="w-full max-w-md">
                <Link
                    href={home()}
                    className="mb-6 flex items-center justify-center gap-2 font-semibold text-sidebar-foreground"
                >
                    <span className="flex size-9 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                        <AppLogoIcon className="size-5 fill-current" />
                    </span>
                    {name}
                </Link>

                <div className="rounded-2xl border bg-card p-6 text-card-foreground shadow-lg md:p-8">
                    <div className="mb-6 space-y-1 text-center">
                        <h1 className="text-xl font-semibold tracking-tight">
                            {title}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {description}
                        </p>
                    </div>
                    <div className="flex flex-col gap-8">{children}</div>
                </div>
            </div>
        </div>
    );
}
