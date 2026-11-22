export const qualificationLabels: Record<string, string> = {
    prc: 'PRC license',
    tesda: 'TESDA certificate (NC II)',
    other: 'Other',
};

export const documentTypeLabels: Record<string, string> = {
    id: 'Valid ID',
    qualification: 'License or TESDA certificate',
    certificate: 'Other certificate',
    other: 'Other',
};

export function formatSize(bytes: number): string {
    return bytes >= 1024 * 1024
        ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
        : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
