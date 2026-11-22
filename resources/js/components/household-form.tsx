import { Link, useForm } from '@inertiajs/react';
import { type FormEvent } from 'react';

type Household = {
    id: number;
    name: string;
    email: string;
    address: string;
    phone_no: string | null;
};

export default function HouseholdForm({ household }: { household: Household }) {
    const { data, setData, put, processing, errors } = useForm({
        name: household.name,
        email: household.email,
        address: household.address,
        phone_no: household.phone_no ?? '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        put(`/admin/households/${household.id}`);
    }

    const input = 'w-full rounded-md border bg-background px-3 py-2';
    const error = 'text-sm text-red-600';

    return (
        <form onSubmit={submit} className="max-w-md space-y-4">
            <div>
                <label className="mb-1 block text-sm font-medium">Name</label>
                <input
                    className={input}
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                />
                {errors.name && <p className={error}>{errors.name}</p>}
            </div>
            <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input
                    type="email"
                    className={input}
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                />
                {errors.email && <p className={error}>{errors.email}</p>}
            </div>
            <div>
                <label className="mb-1 block text-sm font-medium">
                    Address
                </label>
                <input
                    className={input}
                    value={data.address}
                    onChange={(e) => setData('address', e.target.value)}
                />
                {errors.address && <p className={error}>{errors.address}</p>}
            </div>
            <div>
                <label className="mb-1 block text-sm font-medium">Phone</label>
                <input
                    className={input}
                    value={data.phone_no}
                    onChange={(e) => setData('phone_no', e.target.value)}
                />
                {errors.phone_no && <p className={error}>{errors.phone_no}</p>}
            </div>
            <div className="flex gap-3">
                <button
                    type="submit"
                    disabled={processing}
                    className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                    Save changes
                </button>
                <Link
                    href="/admin/households"
                    className="rounded-md border px-4 py-2"
                >
                    Cancel
                </Link>
            </div>
        </form>
    );
}
