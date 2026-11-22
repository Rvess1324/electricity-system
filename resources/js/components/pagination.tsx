import { Link } from '@inertiajs/react';

export type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

const button = 'rounded-md border bg-card px-3 py-1.5 text-sm';

export default function Pagination({ page }: { page: Paginated<unknown> }) {
    if (page.total === 0) {
        return null;
    }

    return (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="text-muted-foreground">
                Showing {page.from}–{page.to} of {page.total}
            </p>

            {page.last_page > 1 && (
                <div className="flex items-center gap-2">
                    {page.prev_page_url ? (
                        <Link
                            href={page.prev_page_url}
                            preserveScroll
                            className={`${button} hover:bg-accent`}
                        >
                            Previous
                        </Link>
                    ) : (
                        <span className={`${button} opacity-50`}>Previous</span>
                    )}
                    <span className="px-1 text-muted-foreground">
                        Page {page.current_page} of {page.last_page}
                    </span>
                    {page.next_page_url ? (
                        <Link
                            href={page.next_page_url}
                            preserveScroll
                            className={`${button} hover:bg-accent`}
                        >
                            Next
                        </Link>
                    ) : (
                        <span className={`${button} opacity-50`}>Next</span>
                    )}
                </div>
            )}
        </div>
    );
}
