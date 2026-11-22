import { router } from '@inertiajs/react';

export default function EmailCell({
    email,
    verified,
    userId,
}: {
    email: string;
    verified: boolean;
    userId: number;
}) {
    return (
        <div>
            <span>{email}</span>
            {!verified && (
                <div className="mt-1 flex items-center gap-2 text-xs">
                    <span className="rounded-full bg-warning-soft px-2 py-0.5 font-medium text-warning">
                        Unverified
                    </span>
                    <button
                        onClick={() =>
                            router.post(
                                `/admin/users/${userId}/verify-email`,
                                {},
                                { preserveScroll: true },
                            )
                        }
                        className="underline underline-offset-4"
                    >
                        Mark verified
                    </button>
                </div>
            )}
        </div>
    );
}
