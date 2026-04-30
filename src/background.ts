import { fetchCurrentChannel, fetchDislikedVideos, isAuthError } from './api.js';
import type { BackgroundResponse, ContentMessage } from './types.js';

function getAuthToken(interactive: boolean): Promise<string | null> {
    return new Promise((resolve) => {
        chrome.identity.getAuthToken({ interactive }, (token) => {
            if (chrome.runtime.lastError || !token) {
                resolve(null);
                return;
            }
            resolve(token);
        });
    });
}

function removeCachedToken(token: string): Promise<void> {
    return new Promise((resolve) => {
        chrome.identity.removeCachedAuthToken({ token }, () => resolve());
    });
}

async function revokeToken(token: string): Promise<void> {
    try {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(token)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
    } catch {
        /* network errors are non-fatal here */
    }
    await removeCachedToken(token);
}

async function withFreshToken<T>(
    interactive: boolean,
    op: (token: string) => Promise<T>,
): Promise<T> {
    const token = await getAuthToken(interactive);
    if (!token) throw new Error('NOT_AUTHORIZED');
    try {
        return await op(token);
    } catch (err) {
        if (isAuthError(err)) {
            await removeCachedToken(token);
            const fresh = await getAuthToken(interactive);
            if (!fresh) throw new Error('NOT_AUTHORIZED');
            return op(fresh);
        }
        throw err;
    }
}

async function handle(message: ContentMessage): Promise<BackgroundResponse> {
    try {
        switch (message.type) {
            case 'checkAuth': {
                const token = await getAuthToken(false);
                return { ok: true, data: { authorized: !!token } };
            }
            case 'signIn': {
                const token = await getAuthToken(true);
                return { ok: true, data: { authorized: !!token } };
            }
            case 'signOut': {
                const token = await getAuthToken(false);
                if (token) await revokeToken(token);
                return { ok: true, data: { authorized: false } };
            }
            case 'getCurrentChannel': {
                const channel = await withFreshToken(false, fetchCurrentChannel);
                return { ok: true, data: channel };
            }
            case 'getDislikedVideos': {
                const page = await withFreshToken(false, (t) =>
                    fetchDislikedVideos(t, message.pageToken),
                );
                return { ok: true, data: page };
            }
        }
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        const needsAuth = errorMessage === 'NOT_AUTHORIZED';
        return { ok: false, error: errorMessage, needsAuth };
    }
}

chrome.runtime.onMessage.addListener((message: ContentMessage, _sender, sendResponse) => {
    handle(message).then(sendResponse);
    return true;
});

chrome.webNavigation?.onHistoryStateUpdated?.addListener(
    (details) => {
        if (details.url.includes('/feed/library')) {
            chrome.tabs.sendMessage(details.tabId, { type: 'libraryPageOpened' }).catch(() => {
                /* receiver may not be ready yet */
            });
        }
    },
    { url: [{ pathSuffix: 'feed/library' }] },
);
