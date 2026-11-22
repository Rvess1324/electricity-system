import { Link, useForm } from '@inertiajs/react';
import { type FormEvent } from 'react';

type Electrician = {
    id: number;
    name: string;
    email: string;
    license_no: string;
    specialization: string | null;
};

export default function ElectricianForm({
    electrician,
}: {
    electrician?: Electrician;
}) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: electrician?.name ?? '',
        email: electrician?.email ?? '',
        license_no: electrician?.license_no ?? '',
        specialization: electrician?.specialization ?? '',
        password: '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        if (electrician) {
            put(`/admin/electricians/${electrician.id}`);
        } else {
            post('/admin/electricians');
        }
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
                    License no.
                </label>
                <input
                    className={input}
                    value={data.license_no}
                    onChange={(e) => setData('license_no', e.target.value)}
                />
                {errors.license_no && (
                    <p className={error}>{errors.license_no}</p>
                )}
            </div>
            <div>
                <label className="mb-1 block text-sm font-medium">
                    Specialization
                </label>
                <input
                    className={input}
                    value={data.specialization}
                    onChange={(e) => setData('specialization', e.target.value)}
                />
                {errors.specialization && (
                    <p className={error}>{errors.specialization}</p>
                )}
            </div>
            <div>
                <label className="mb-1 block text-sm font-medium">
                    {electrician
                        ? 'New password (leave blank to keep)'
                        : 'Password'}
                </label>
                <input
                    type="password"
                    autoComplete="new-password"
                    className={input}
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                />
                {errors.password && <p className={error}>{errors.password}</p>}
            </div>
            <div className="flex gap-3">
                <button
                    type="submit"
                    disabled={processing}
                    className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                    {electrician ? 'Save changes' : 'Create account'}
                </button>
                <Link
                    href="/admin/electricians"
                    className="rounded-md border px-4 py-2"
                >
                    Cancel
                </Link>
            </div>
        </form>
    );
}
