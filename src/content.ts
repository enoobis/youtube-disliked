import type { BackgroundResponse, ContentMessage, UserChannel, VideosPage } from './types.js';
import {
    el,
    renderHeader,
    renderMessage,
    renderSpinner,
    renderVideoItem,
} from './views.js';

const t = (key: string) => chrome.i18n.getMessage(key) || key;
const SIDEBAR_BTN_ID = 'ytd-disliked-sidebar-btn';
const OVERLAY_ID = 'ytd-disliked-overlay';
const LIBRARY_SECTION_ID = 'ytd-disliked-library-section';

function send<T>(message: ContentMessage): Promise<BackgroundResponse<T>> {
    return chrome.runtime.sendMessage(message) as Promise<BackgroundResponse<T>>;
}

const DISLIKE_ICON_SVG = `
<svg viewBox="0 0 24 24" fill="currentColor" class="ytd-sidebar-entry__icon" aria-hidden="true">
    <path d="M18 9.5h-5.07l.86-4.14C13.95 4.54 13.32 3.8 12.5 3.8c-.5 0-.96.27-1.21.71L7 12v9h10c.83 0 1.54-.5 1.84-1.25l3-7c.04-.13.07-.27.07-.42v-2c0-.55-.45-1.83-1-1.83zM5 21H3V12h2v9z"/>
</svg>`;

let mountedSidebarObserver: MutationObserver | null = null;
let mountedLibraryObserver: MutationObserver | null = null;

function tryMountSidebarButton(): boolean {
    if (document.getElementById(SIDEBAR_BTN_ID)) return true;

    const candidates = [
        '#sections ytd-guide-section-renderer:first-of-type #items',
        'ytd-mini-guide-renderer #items',
    ];
    let host: HTMLElement | null = null;
    for (const sel of candidates) {
        const found = document.querySelector<HTMLElement>(sel);
        if (found) {
            host = found;
            break;
        }
    }
    if (!host) return false;

    const btn = el('button', {
        id: SIDEBAR_BTN_ID,
        className: 'ytd-sidebar-entry',
        type: 'button',
        title: t('dislikedButtonText') || 'Disliked videos',
    });
    btn.innerHTML = DISLIKE_ICON_SVG;
    btn.appendChild(el('span', { textContent: t('dislikedButtonText') || 'Disliked videos' }));
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleOverlay();
    });
    host.appendChild(btn);
    return true;
}

function watchSidebar() {
    if (tryMountSidebarButton()) return;
    if (mountedSidebarObserver) return;
    mountedSidebarObserver = new MutationObserver(() => {
        if (tryMountSidebarButton()) {
            mountedSidebarObserver?.disconnect();
            mountedSidebarObserver = null;
        }
    });
    mountedSidebarObserver.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => {
        mountedSidebarObserver?.disconnect();
        mountedSidebarObserver = null;
    }, 30_000);
}

function toggleOverlay() {
    const existing = document.getElementById(OVERLAY_ID);
    if (existing) {
        existing.remove();
        return;
    }
    openOverlay();
}

async function openOverlay() {
    const overlay = el('div', { id: OVERLAY_ID, className: 'ytd-overlay' });
    const panel = el('div', { className: 'ytd-overlay__panel' });
    overlay.appendChild(panel);

    const close = el('button', {
        className: 'ytd-overlay__close',
        type: 'button',
        textContent: '\u00d7',
        ariaLabel: 'Close',
    });
    close.addEventListener('click', () => overlay.remove());
    panel.appendChild(close);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });
    document.body.appendChild(overlay);

    panel.appendChild(renderSpinner());

    const auth = await send<{ authorized: boolean }>({ type: 'checkAuth' });
    panel.replaceChildren(close);

    if (!auth.ok || !auth.data.authorized) {
        panel.appendChild(
            renderMessage(
                t('askForAuthorizationMessage') || 'Sign in to load disliked videos.',
                {
                    label: t('askForAuthorizationButton') || 'Sign in',
                    onClick: async () => {
                        panel.replaceChildren(close, renderSpinner());
                        const r = await send<{ authorized: boolean }>({ type: 'signIn' });
                        if (r.ok && r.data.authorized) {
                            overlay.remove();
                            openOverlay();
                        } else {
                            overlay.remove();
                        }
                    },
                },
            ),
        );
        return;
    }

    const channelRes = await send<UserChannel | null>({ type: 'getCurrentChannel' });
    const channel = channelRes.ok ? channelRes.data ?? null : null;
    panel.appendChild(
        renderHeader(channel, async () => {
            await send({ type: 'signOut' });
            overlay.remove();
        }),
    );

    const list = el('div', { className: 'ytd-list' });
    panel.appendChild(list);
    list.appendChild(renderSpinner());

    let nextPageToken: string | undefined;
    let loadingMore = false;
    let loadMoreBtn: HTMLButtonElement | null = null;

    const loadPage = async (token?: string) => {
        const res = await send<VideosPage>({ type: 'getDislikedVideos', pageToken: token });
        if (!res.ok) {
            list.replaceChildren(
                renderMessage(t('failedToLoadVideosMessage') || 'Failed to load videos.', {
                    label: t('failedToLoadVideosButton') || 'Reload',
                    onClick: () => {
                        list.replaceChildren(renderSpinner());
                        loadPage(token);
                    },
                }),
            );
            return;
        }
        if (token === undefined) list.replaceChildren();
        if (loadMoreBtn?.parentElement) loadMoreBtn.parentElement.remove();
        loadMoreBtn = null;

        if (res.data.videos.length === 0 && token === undefined) {
            list.appendChild(
                renderMessage(t('noVideosErrorMessage') || 'No disliked videos found.'),
            );
            return;
        }

        for (const v of res.data.videos) list.appendChild(renderVideoItem(v));

        nextPageToken = res.data.nextPageToken;
        if (nextPageToken) {
            const wrap = el('div', { className: 'ytd-load-more' });
            loadMoreBtn = el('button', {
                className: 'ytd-button ytd-button--ghost',
                type: 'button',
                textContent: t('loadMoreVideosButton') || 'Load more',
            });
            loadMoreBtn.addEventListener('click', async () => {
                if (loadingMore || !nextPageToken) return;
                loadingMore = true;
                loadMoreBtn!.textContent = '...';
                loadMoreBtn!.disabled = true;
                await loadPage(nextPageToken);
                loadingMore = false;
            });
            wrap.appendChild(loadMoreBtn);
            list.appendChild(wrap);
        }
    };

    await loadPage(undefined);
}

function tryMountLibrarySection(): boolean {
    if (!location.pathname.includes('/feed/library')) return false;
    if (document.getElementById(LIBRARY_SECTION_ID)) return true;

    const candidates = [
        'ytd-browse[page-subtype="library"] ytd-section-list-renderer #contents',
        'ytd-browse ytd-section-list-renderer #contents',
    ];
    let container: HTMLElement | null = null;
    for (const sel of candidates) {
        const found = document.querySelector<HTMLElement>(sel);
        if (found) {
            container = found;
            break;
        }
    }
    if (!container) return false;

    const section = el('section', { id: LIBRARY_SECTION_ID, className: 'ytd-library-section' });
    container.insertBefore(section, container.firstChild);
    populateLibrarySection(section);
    return true;
}

async function populateLibrarySection(section: HTMLElement) {
    const header = el('div', { className: 'ytd-library-section__header' });
    header.appendChild(el('span', { textContent: t('infoPanel@header') || 'Disliked videos' }));
    const count = el('span', { className: 'ytd-library-section__count' });
    header.appendChild(count);
    section.appendChild(header);

    const row = el('div', { className: 'ytd-library-section__row' });
    section.appendChild(row);
    row.appendChild(renderSpinner());

    const auth = await send<{ authorized: boolean }>({ type: 'checkAuth' });
    if (!auth.ok || !auth.data.authorized) {
        row.replaceChildren(
            renderMessage(t('askForAuthorizationMessage') || 'Sign in to see disliked videos.', {
                label: t('askForAuthorizationButton') || 'Sign in',
                onClick: async () => {
                    const r = await send<{ authorized: boolean }>({ type: 'signIn' });
                    if (r.ok && r.data.authorized) {
                        row.replaceChildren(renderSpinner());
                        await loadLibraryRow(row, count);
                    }
                },
            }),
        );
        return;
    }

    await loadLibraryRow(row, count);

    const more = el('div', { className: 'ytd-library-section__more' });
    const moreBtn = el('button', {
        className: 'ytd-button ytd-button--ghost',
        type: 'button',
        textContent: t('openMoreVideosButton') || 'See all',
    });
    moreBtn.addEventListener('click', () => toggleOverlay());
    more.appendChild(moreBtn);
    section.appendChild(more);
}

async function loadLibraryRow(row: HTMLElement, count: HTMLElement) {
    const res = await send<VideosPage>({ type: 'getDislikedVideos' });
    if (!res.ok) {
        row.replaceChildren(
            renderMessage(t('failedToLoadVideosMessage') || 'Failed to load videos.'),
        );
        return;
    }
    row.replaceChildren();
    if (res.data.videos.length === 0) {
        row.appendChild(renderMessage(t('noVideosErrorMessage') || 'No disliked videos found.'));
        return;
    }
    const visible = res.data.videos.slice(0, 8);
    for (const v of visible) row.appendChild(renderVideoItem(v));
    const word = t('infoPanel@videoCountTitlePart') || 'videos';
    count.textContent = `· ${res.data.totalCount} ${word}`;
}

function watchLibraryNav() {
    if (mountedLibraryObserver) return;
    let lastPath = location.pathname;
    mountedLibraryObserver = new MutationObserver(() => {
        if (location.pathname !== lastPath) {
            lastPath = location.pathname;
            tryMountLibrarySection();
        }
    });
    mountedLibraryObserver.observe(document.body, { childList: true, subtree: true });
}

function init() {
    watchSidebar();
    if (location.pathname.includes('/feed/library')) {
        const tryMount = () => {
            if (!tryMountLibrarySection()) setTimeout(tryMount, 1000);
        };
        tryMount();
    }
    watchLibraryNav();

    chrome.runtime.onMessage.addListener((msg: { type?: string }) => {
        if (msg?.type === 'libraryPageOpened') {
            setTimeout(() => tryMountLibrarySection(), 500);
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
    init();
}
