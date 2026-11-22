import { cn } from '@/lib/utils';

const styles: Record<string, string> = {
    pending: 'bg-warning-soft text-warning',
    assigned: 'bg-info-soft text-info',
    accepted: 'bg-info-soft text-info',
    in_progress: 'bg-info-soft text-info',
    resolved: 'bg-success-soft text-success',
    completed: 'bg-success-soft text-success',
    approved: 'bg-success-soft text-success',
    rejected: 'bg-destructive/10 text-destructive',
    suspended: 'bg-destructive/10 text-destructive',
    cancelled: 'bg-muted text-muted-foreground',
};

export default function StatusBadge({ status }: { status: string }) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
                styles[status] ?? 'bg-muted text-muted-foreground',
            )}
        >
            {status.replace('_', ' ')}
        </span>
    );
}
