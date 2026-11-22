import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Props = {
    options?: string[];
    filterName?: string;
    allLabel?: string;
    placeholder?: string;
};

export default function ListToolbar({
    options = [],
    filterName = 'status',
    allLabel = 'All statuses',
    placeholder = 'Search...',
}: Props) {
    const page = usePage<{ filters?: Record<string, string | undefined> }>();
    const path = page.url.split('?')[0];
    const filters = page.props.filters ?? {};
    const value = filters[filterName] ?? '';
    const [q, setQ] = useState(filters.q ?? '');

    function visit(next: Record<string, string>) {
        const params = Object.fromEntries(
            Object.entries(next).filter(([, v]) => v !== ''),
        );

        router.get(path, params, { preserveState: true, replace: true });
    }

    function submit(e: FormEvent) {
        e.preventDefault();
        visit({ q, [filterName]: value });
    }

    return (
        <form
            onSubmit={submit}
            className="mb-4 flex flex-wrap items-center gap-2"
        >
            <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={placeholder}
                className="w-full sm:w-64"
            />
            {options.length > 0 && (
                <select
                    value={value}
                    onChange={(e) => visit({ q, [filterName]: e.target.value })}
                    className="h-9 rounded-md border bg-background px-3 text-sm"
                >
                    <option value="">{allLabel}</option>
                    {options.map((o) => (
                        <option key={o} value={o}>
                            {o}
                        </option>
                    ))}
                </select>
            )}
            <Button type="submit">Search</Button>
            {(q !== '' || value !== '') && (
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                        setQ('');
                        visit({});
                    }}
                >
                    Clear
                </Button>
            )}
        </form>
    );
}
