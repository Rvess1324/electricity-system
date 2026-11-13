const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    assigned: 'bg-blue-100 text-blue-800',
    resolved: 'bg-green-100 text-green-800',
};

export default function StatusBadge({ status }: { status: string }) {
    return (
        <span className={`rounded px-2 py-0.5 text-xs font-medium capitalize ${colors[status] ?? 'bg-gray-100 text-gray-800'}`}>
            {status}
        </span>
    );
}