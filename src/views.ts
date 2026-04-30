import { formatRelativeDate, formatViewCount } from './format.js';
import type { UserChannel, YouTubeVideo } from './types.js';

const t = (key: string) => chrome.i18n.getMessage(key) || key;

export function el<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    props: Partial<HTMLElementTagNameMap[K]> & { className?: string } = {},
    ...children: (Node | string | null | undefined | false)[]
): HTMLElementTagNameMap[K] {
    const node = document.createElement(tag);
    Object.assign(node, props);
    for (const c of children) {
        if (c == null || c === false) continue;
        node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    }
    return node;
}

export function renderVideoItem(v: YouTubeVideo): HTMLAnchorElement {
    const a = el('a', { className: 'ytd-video', href: v.url, target: '_blank', rel: 'noopener noreferrer' });

    const thumb = el('div', { className: 'ytd-video__thumb' });
    if (v.thumbnail) {
        thumb.appendChild(el('img', { src: v.thumbnail, alt: '', loading: 'lazy' }));
    }
    if (v.duration) {
        thumb.appendChild(el('span', { className: 'ytd-video__duration', textContent: v.duration }));
    }

    const meta = el('div', { className: 'ytd-video__meta' });
    meta.appendChild(el('div', { className: 'ytd-video__title', textContent: v.title, title: v.title }));
    meta.appendChild(
        el('div', {
            className: 'ytd-video__channel',
            textContent: v.channelTitle,
            title: v.channelTitle,
        }),
    );
    const viewsLabel = t('viewCount@viewsWord') || 'views';
    meta.appendChild(
        el('div', {
            className: 'ytd-video__stats',
            textContent: `${formatViewCount(v.viewCount)} ${viewsLabel} · ${formatRelativeDate(v.publishedAt)}`,
        }),
    );

    a.appendChild(thumb);
    a.appendChild(meta);
    return a;
}

export function renderHeader(
    channel: UserChannel | null,
    onSignOut: () => void,
): HTMLElement {
    const header = el('header', { className: 'ytd-header' });

    if (channel?.thumbnail) {
        header.appendChild(el('img', { className: 'ytd-header__avatar', src: channel.thumbnail, alt: '' }));
    } else {
        header.appendChild(el('div', { className: 'ytd-header__avatar' }));
    }

    const title = el('div', { className: 'ytd-header__title' });
    title.appendChild(el('div', { textContent: t('infoPanel@header') || 'Disliked videos' }));
    if (channel?.title) {
        title.appendChild(el('div', { className: 'ytd-header__sub', textContent: channel.title }));
    }
    header.appendChild(title);

    const btn = el('button', {
        className: 'ytd-header__btn',
        textContent: t('logoutButton') || 'Logout',
        type: 'button',
    });
    btn.addEventListener('click', onSignOut);
    header.appendChild(btn);

    return header;
}

export function renderSpinner(): HTMLElement {
    return el('div', { className: 'ytd-loading' }, el('div', { className: 'ytd-spinner' }));
}

export function renderMessage(message: string, button?: { label: string; onClick: () => void }): HTMLElement {
    const wrap = el('div', { className: 'ytd-empty' });
    wrap.appendChild(el('div', { textContent: message }));
    if (button) {
        const b = el('button', { className: 'ytd-button', textContent: button.label, type: 'button' });
        b.addEventListener('click', button.onClick);
        wrap.appendChild(b);
    }
    return wrap;
}
