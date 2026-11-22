import { useState } from 'react';
import type { ReactNode } from 'react';
import ConfirmDialog from '@/components/confirm-dialog';

type Options = {
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
    onConfirm: () => void;
};

/**
 * Replacement for the browser's confirm(): call ask({...}) and render {dialog}.
 */
export function useConfirm(): {
    ask: (options: Options) => void;
    dialog: ReactNode;
} {
    const [options, setOptions] = useState<Options | null>(null);

    const dialog = (
        <ConfirmDialog
            open={options !== null}
            onOpenChange={(open) => {
                if (!open) {
                    setOptions(null);
                }
            }}
            title={options?.title ?? ''}
            description={options?.description ?? ''}
            confirmLabel={options?.confirmLabel}
            cancelLabel={options?.cancelLabel}
            destructive={options?.destructive}
            onConfirm={() => {
                const run = options?.onConfirm;

                setOptions(null);
                run?.();
            }}
        />
    );

    return { ask: setOptions, dialog };
}
