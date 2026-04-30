const ISO_DURATION_RE = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/;

export function parseIsoDuration(input: string | null | undefined): string {
    if (!input) return '';
    const match = ISO_DURATION_RE.exec(input);
    if (!match) return '';

    const days = +(match[1] ?? 0);
    const hours = +(match[2] ?? 0);
    const minutes = +(match[3] ?? 0);
    const seconds = +(match[4] ?? 0);

    const pad = (n: number) => n.toString().padStart(2, '0');

    if (days > 0) {
        return `${days}:${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    if (hours > 0) {
        return `${hours}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${minutes}:${pad(seconds)}`;
}
