export interface YouTubeVideo {
    id: string;
    title: string;
    description: string;
    url: string;
    thumbnail: string | null;
    duration: string;
    viewCount: string;
    publishedAt: string;
    channelId: string;
    channelTitle: string;
    channelUrl: string;
}

export interface UserChannel {
    id: string;
    title: string;
    description: string;
    url: string;
    thumbnail: string | null;
}

export interface VideosPage {
    videos: YouTubeVideo[];
    totalCount: number;
    perPageCount: number;
    nextPageToken?: string;
    prevPageToken?: string;
}

export type ContentMessage =
    | { type: 'checkAuth' }
    | { type: 'signIn' }
    | { type: 'signOut' }
    | { type: 'getCurrentChannel' }
    | { type: 'getDislikedVideos'; pageToken?: string };

export type BackgroundResponse<T = unknown> =
    | { ok: true; data: T }
    | { ok: false; error: string; needsAuth?: boolean };
