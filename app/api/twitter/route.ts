import { NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';

/**
 * Report whether posting credentials are configured.
 *
 * This deliberately does NOT probe a read endpoint. Twitter's free tier allows
 * POST /2/tweets but 403s on lookups like userByUsername, so a read probe
 * reports "not connected" for an account that can post perfectly well. The
 * live probe still runs, but only as extra detail - it never decides `success`.
 */
export async function GET() {
    const required = [
        'TWITTER_API_KEY',
        'TWITTER_API_SECRET',
        'TWITTER_ACCESS_TOKEN',
        'TWITTER_ACCESS_TOKEN_SECRET',
    ];
    const missing = required.filter((name) => !process.env[name]);

    if (missing.length > 0) {
        return NextResponse.json({
            success: false,
            error: `Missing Twitter credentials: ${missing.join(', ')}`,
        }, { status: 500 });
    }

    // Optional, informational only: a read probe that free-tier apps will fail.
    let probe: { ok: boolean; detail: string } = { ok: false, detail: 'not attempted' };
    if (process.env.TWITTER_BEARER_TOKEN) {
        try {
            const user = await new TwitterApi(process.env.TWITTER_BEARER_TOKEN).v2.userByUsername('Twitter');
            probe = { ok: true, detail: `read access confirmed (${user.data.username})` };
        } catch (error: unknown) {
            probe = {
                ok: false,
                detail: error instanceof Error
                    ? `read access unavailable (${error.message}) - expected on the free tier, posting is unaffected`
                    : 'read access unavailable',
            };
        }
    }

    return NextResponse.json({
        success: true,
        message: 'Twitter posting credentials are configured',
        probe,
        envCheck: {
            hasBearerToken: !!process.env.TWITTER_BEARER_TOKEN,
            hasApiKey: !!process.env.TWITTER_API_KEY,
            hasApiSecret: !!process.env.TWITTER_API_SECRET,
            hasAccessToken: !!process.env.TWITTER_ACCESS_TOKEN,
            hasAccessTokenSecret: !!process.env.TWITTER_ACCESS_TOKEN_SECRET,
        },
    });
}


// Post a tweet
export async function POST(request: Request) {
    try {
        // `media` is base64 bytes plus its mime type. The client sends bytes rather
        // than a URL because generated media lives in a blob:/data: URL that only
        // exists in the browser and cannot be fetched from the server.
        const { text, media } = await request.json();

        if (!text) {
            return NextResponse.json({ error: 'Tweet text is required' }, { status: 400 });
        }

        const missing = [
            'TWITTER_API_KEY',
            'TWITTER_API_SECRET',
            'TWITTER_ACCESS_TOKEN',
            'TWITTER_ACCESS_TOKEN_SECRET',
        ].filter((name) => !process.env[name]);

        if (missing.length > 0) {
            return NextResponse.json({
                success: false,
                error: `Missing Twitter credentials: ${missing.join(', ')}`,
            }, { status: 500 });
        }

        const client = new TwitterApi({
            appKey: process.env.TWITTER_API_KEY!,
            appSecret: process.env.TWITTER_API_SECRET!,
            accessToken: process.env.TWITTER_ACCESS_TOKEN!,
            accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
        });

        // The SDK types media_ids as a 1-4 element tuple, so keep a single id
        // rather than a plain array.
        let mediaId: string | undefined;
        if (media?.data && media?.mimeType) {
            mediaId = await client.v2.uploadMedia(
                Buffer.from(media.data, 'base64'),
                { media_type: media.mimeType }
            );
        }

        // Post the tweet
        const tweet = mediaId
            ? await client.v2.tweet({ text, media: { media_ids: [mediaId] } })
            : await client.v2.tweet(text);

        return NextResponse.json({
            success: true,
            tweet: {
                id: tweet.data.id,
                text: tweet.data.text,
            },
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Tweet post error:', error);

        return NextResponse.json({
            success: false,
            error: 'Failed to post tweet',
            details: errorMessage,
        }, { status: 500 });
    }
}
