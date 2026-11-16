// Philippine peso formatter, e.g. peso(1234.5) -> "₱1,234.50"
export function peso(value: number | string | null | undefined): string {
    const n = Number(value ?? 0);
    return '₱' + (Number.isFinite(n) ? n : 0).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}
