export function formatViewCount(raw: string | number): string {
    const n = typeof raw === 'string' ? parseInt(raw, 10) : raw;
    if (!Number.isFinite(n) || n < 1000) return `${n ?? 0}`;
    if (n < 1_000_000) return `${(n / 1_000).toFixed(0)}K`;
    if (n < 1_000_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    return `${(n / 1_000_000_000).toFixed(1)}B`;
}

export function formatRelativeDate(iso: string, locale = navigator.language): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    const diffSec = (Date.now() - date.getTime()) / 1000;

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    const units: [Intl.RelativeTimeFormatUnit, number][] = [
        ['year', 60 * 60 * 24 * 365],
        ['month', 60 * 60 * 24 * 30],
        ['week', 60 * 60 * 24 * 7],
        ['day', 60 * 60 * 24],
        ['hour', 60 * 60],
        ['minute', 60],
    ];

    for (const [unit, secs] of units) {
        if (diffSec >= secs) {
            return rtf.format(-Math.floor(diffSec / secs), unit);
        }
    }
    return rtf.format(0, 'second');
}
