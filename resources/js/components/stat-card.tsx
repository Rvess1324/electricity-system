import type { ReactNode } from 'react';

export default function StatCard({
    label,
    value,
    hint,
}: {
    label: string;
    value: ReactNode;
    hint?: ReactNode;
}) {
    return (
        <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-xs">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
            {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
    );
}
