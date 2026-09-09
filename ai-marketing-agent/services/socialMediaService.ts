
export interface SocialProfile {
    username: string;
    handle: string;
    avatarUrl: string;
    connected: boolean;
}

// In a real production environment, these methods would communicate with your backend server.
// The backend would handle OAuth 2.0 flows, secure token storage, and server-to-server API calls
// to platforms like Twitter/X, Facebook, etc., to avoid exposing API secrets in the client.

/**
 * Generated media lives in a blob: URL (video) or a data: URL (image), neither
 * of which the server can fetch. Read the bytes in the browser and hand the
 * route base64 instead.
 */
async function toBase64Media(mediaUrl: string): Promise<{ data: string; mimeType: string }> {
    const blob = await (await fetch(mediaUrl)).blob();

    const dataUrl: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });

    return {
        data: dataUrl.split(',')[1],
        mimeType: blob.type || 'application/octet-stream',
    };
}

export const SocialMediaService = {
    /**
     * For Twitter/X this asks the server whether the configured credentials
     * actually authenticate. Other platforms fall back to the localStorage flag,
     * which only records that the user clicked Connect.
     */
    checkConnection: async (platform: string): Promise<boolean> => {
        if (platform === 'twitter_x' || platform === 'twitter') {
            try {
                const response = await fetch('/api/twitter');
                const data = await response.json();
                return response.ok && data.success === true;
            } catch {
                return false;
            }
        }

        return localStorage.getItem(`social_connected_${platform}`) === 'true';
    },

    connect: async (platform: string): Promise<SocialProfile> => {
        // Twitter/X credentials live in server env vars, so there is no OAuth
        // flow to run here - just verify them and report the result honestly.
        if (platform === 'twitter_x' || platform === 'twitter') {
            const response = await fetch('/api/twitter');
            const data = await response.json().catch(() => null);

            if (!response.ok || !data?.success) {
                throw new Error(data?.details || data?.error || 'Twitter credentials are not valid');
            }

            return {
                username: 'Twitter/X (app credentials)',
                handle: '@connected',
                avatarUrl: `https://ui-avatars.com/api/?name=X&background=random`,
                connected: true,
            };
        }

        return new Promise((resolve) => {
            console.warn(`[SocialService] ${platform} has no OAuth backend - marking connected locally only.`);
            setTimeout(() => {
                localStorage.setItem(`social_connected_${platform}`, 'true');
                resolve({
                    username: `${platform} User`,
                    handle: `@marketing_pro`,
                    avatarUrl: `https://ui-avatars.com/api/?name=${platform}&background=random`,
                    connected: true
                });
            }, 1500);
        });
    },

    /**
     * Publish a post.
     *
     * Twitter/X posts for real through /api/twitter, which holds the OAuth
     * credentials server-side. The other platforms have no backend yet, so they
     * still resolve without sending anything - they return `simulated: true` so
     * callers can tell a real publish from a dry run.
     */
    post: async (
        platform: string,
        content: string,
        mediaUrl?: string,
        mediaType?: 'image' | 'video'
    ): Promise<{ success: boolean; id: string; simulated: boolean; url?: string }> => {
        if (platform === 'twitter_x' || platform === 'twitter') {
            const media = mediaUrl ? await toBase64Media(mediaUrl) : undefined;

            const response = await fetch('/api/twitter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: content, media }),
            });

            const data = await response.json().catch(() => null);

            if (!response.ok || !data?.success) {
                throw new Error(data?.details || data?.error || `Post failed (HTTP ${response.status})`);
            }

            return {
                success: true,
                id: data.tweet.id,
                simulated: false,
                url: `https://x.com/i/web/status/${data.tweet.id}`,
            };
        }

        console.warn(`[SocialService] ${platform} has no backend integration - simulating publish.`);
        await new Promise((resolve) => setTimeout(resolve, 800));
        return {
            success: true,
            id: Math.random().toString(36).substring(2, 11),
            simulated: true,
        };
    }
};
