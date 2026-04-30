import type { BackgroundResponse, ContentMessage, UserChannel, VideosPage } from './types.js';
import {
    el,
    renderHeader,
    renderMessage,
    renderSpinner,
    renderVideoItem,
} from './views.js';

const t = (key: string) => chrome.i18n.getMessage(key) || key;

function send<T>(message: ContentMessage): Promise<BackgroundResponse<T>> {
    return chrome.runtime.sendMessage(message) as Promise<BackgroundResponse<T>>;
}

const root = document.getElementById('root')!;

interface State {
    channel: UserChannel | null;
    videos: VideosPage['videos'];
    nextPageToken?: string;
    loading: boolean;
    loadingMore: boolean;
}

const state: State = {
    channel: null,
    videos: [],
    nextPageToken: undefined,
    loading: false,
    loadingMore: false,
};

function clearRoot() {
    root.replaceChildren();
}

function render() {
    clearRoot();
    root.appendChild(renderHeader(state.channel, signOut));

    if (state.loading) {
        root.appendChild(renderSpinner());
        return;
    }

    const list = el('div', { className: 'ytd-list' });
    if (state.videos.length === 0) {
        list.appendChild(
            renderMessage(t('noVideosErrorMessage') || 'No disliked videos found.', {
                label: t('noVideosErrorButton') || 'Refresh',
                onClick: () => loadFirstPage(),
            }),
        );
    } else {
        for (const v of state.videos) list.appendChild(renderVideoItem(v));

        if (state.nextPageToken) {
            const moreWrap = el('div', { className: 'ytd-load-more' });
            const more = el('button', {
                className: 'ytd-button ytd-button--ghost',
                textContent: state.loadingMore
                    ? '...'
                    : t('loadMoreVideosButton') || 'Load more',
                type: 'button',
                disabled: state.loadingMore,
            });
            more.addEventListener('click', loadMore);
            moreWrap.appendChild(more);
            list.appendChild(moreWrap);
        }
    }
    root.appendChild(list);
}

function renderPreAuth() {
    clearRoot();
    root.appendChild(
        renderMessage(t('askForAuthorizationMessage') || 'Sign in with Google to load your disliked videos.', {
            label: t('askForAuthorizationButton') || 'Sign in',
            onClick: signIn,
        }),
    );
}

function renderError(message: string, retry: () => void) {
    clearRoot();
    if (state.channel) {
        root.appendChild(renderHeader(state.channel, signOut));
    }
    root.appendChild(
        renderMessage(message, {
            label: t('failedToLoadVideosButton') || 'Reload',
            onClick: retry,
        }),
    );
}

async function signIn() {
    clearRoot();
    root.appendChild(renderSpinner());
    const res = await send<{ authorized: boolean }>({ type: 'signIn' });
    if (res.ok && res.data.authorized) {
        await bootstrap();
    } else {
        renderPreAuth();
    }
}

async function signOut() {
    state.channel = null;
    state.videos = [];
    state.nextPageToken = undefined;
    await send({ type: 'signOut' });
    renderPreAuth();
}

async function loadFirstPage() {
    state.loading = true;
    state.videos = [];
    state.nextPageToken = undefined;
    render();

    const res = await send<VideosPage>({ type: 'getDislikedVideos' });
    state.loading = false;
    if (!res.ok) {
        if (res.needsAuth) {
            renderPreAuth();
            return;
        }
        renderError(t('failedToLoadVideosMessage') || 'Failed to load videos.', loadFirstPage);
        return;
    }
    state.videos = res.data.videos;
    state.nextPageToken = res.data.nextPageToken;
    render();
}

async function loadMore() {
    if (!state.nextPageToken || state.loadingMore) return;
    state.loadingMore = true;
    render();
    const res = await send<VideosPage>({
        type: 'getDislikedVideos',
        pageToken: state.nextPageToken,
    });
    state.loadingMore = false;
    if (!res.ok) {
        renderError(t('failedToLoadVideosMessage') || 'Failed to load videos.', loadMore);
        return;
    }
    state.videos = [...state.videos, ...res.data.videos];
    state.nextPageToken = res.data.nextPageToken;
    render();
}

async function bootstrap() {
    const auth = await send<{ authorized: boolean }>({ type: 'checkAuth' });
    if (!auth.ok || !auth.data.authorized) {
        renderPreAuth();
        return;
    }
    const channelRes = await send<UserChannel | null>({ type: 'getCurrentChannel' });
    if (channelRes.ok) state.channel = channelRes.data ?? null;
    await loadFirstPage();
}

bootstrap().catch((err) => {
    console.error('[YouTube Disliked] popup bootstrap failed', err);
    renderError(t('reloadRequiredError') || 'Something went wrong.', () => bootstrap());
});
