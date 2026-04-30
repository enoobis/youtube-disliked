import { parseIsoDuration } from './duration.js';
import type { UserChannel, VideosPage, YouTubeVideo } from './types.js';

const VIDEOS_URL = 'https://www.googleapis.com/youtube/v3/videos';
const CHANNELS_URL = 'https://www.googleapis.com/youtube/v3/channels';

class HttpError extends Error {
    constructor(public status: number, message: string) {
        super(message);
    }
}

async function api<T>(url: string, query: Record<string, string>, token: string): Promise<T> {
    const u = new URL(url);
    u.search = new URLSearchParams(query).toString();

    const res = await fetch(u.toString(), {
        method: 'GET',
        cache: 'no-store',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!res.ok) {
        let detail = '';
        try {
            const body = await res.json();
            detail = body?.error?.message ?? '';
        } catch {
            /* ignore */
        }
        throw new HttpError(res.status, detail || res.statusText);
    }
    return res.json() as Promise<T>;
}

export function isAuthError(err: unknown): boolean {
    return err instanceof HttpError && (err.status === 401 || err.status === 403);
}

interface ChannelsApiResponse {
    items?: Array<{
        id: string;
        snippet?: {
            title?: string;
            description?: string;
            thumbnails?: { medium?: { url?: string }; default?: { url?: string } };
        };
    }>;
}

export async function fetchCurrentChannel(token: string): Promise<UserChannel | null> {
    const res = await api<ChannelsApiResponse>(
        CHANNELS_URL,
        { part: 'id,snippet', mine: 'true' },
        token,
    );
    const item = res.items?.[0];
    if (!item) return null;
    return {
        id: item.id,
        title: item.snippet?.title ?? '',
        description: item.snippet?.description ?? '',
        url: `https://www.youtube.com/channel/${item.id}`,
        thumbnail:
            item.snippet?.thumbnails?.medium?.url ??
            item.snippet?.thumbnails?.default?.url ??
            null,
    };
}

interface VideosApiResponse {
    items?: Array<{
        id: string;
        snippet: {
            title: string;
            description: string;
            publishedAt: string;
            channelId: string;
            channelTitle: string;
            thumbnails?: { medium?: { url?: string }; default?: { url?: string } };
        };
        contentDetails: { duration?: string };
        statistics: { viewCount?: string };
    }>;
    pageInfo?: { totalResults?: number; resultsPerPage?: number };
    nextPageToken?: string;
    prevPageToken?: string;
}

export async function fetchDislikedVideos(
    token: string,
    pageToken?: string,
): Promise<VideosPage> {
    const query: Record<string, string> = {
        part: 'id,snippet,contentDetails,statistics',
        myRating: 'dislike',
        maxResults: '20',
    };
    if (pageToken) query.pageToken = pageToken;

    const res = await api<VideosApiResponse>(VIDEOS_URL, query, token);

    const videos: YouTubeVideo[] = (res.items ?? []).map((v) => ({
        id: v.id,
        title: v.snippet.title,
        description: v.snippet.description,
        url: `https://www.youtube.com/watch?v=${v.id}`,
        thumbnail:
            v.snippet.thumbnails?.medium?.url ?? v.snippet.thumbnails?.default?.url ?? null,
        duration: parseIsoDuration(v.contentDetails.duration ?? ''),
        viewCount: v.statistics.viewCount ?? '0',
        publishedAt: v.snippet.publishedAt,
        channelId: v.snippet.channelId,
        channelTitle: v.snippet.channelTitle,
        channelUrl: `https://www.youtube.com/channel/${v.snippet.channelId}`,
    }));

    return {
        videos,
        totalCount: res.pageInfo?.totalResults ?? videos.length,
        perPageCount: res.pageInfo?.resultsPerPage ?? videos.length,
        nextPageToken: res.nextPageToken,
        prevPageToken: res.prevPageToken,
    };
}
