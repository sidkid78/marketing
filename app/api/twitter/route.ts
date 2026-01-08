import { NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';

// Test Twitter credentials by verifying the authenticated user
export async function GET() {
    try {
        // Use Bearer Token for verification (simpler app-level auth)
        const bearerToken = process.env.TWITTER_BEARER_TOKEN;

        if (!bearerToken) {
            return NextResponse.json({
                success: false,
                error: 'TWITTER_BEARER_TOKEN not found in environment',
            }, { status: 500 });
        }

        const client = new TwitterApi(bearerToken);

        // Test by looking up a known account
        const user = await client.v2.userByUsername('Twitter');

        return NextResponse.json({
            success: true,
            message: 'Twitter credentials are valid!',
            test: {
                lookedUp: user.data.username,
                name: user.data.name,
            },
            envCheck: {
                hasBearerToken: !!process.env.TWITTER_BEARER_TOKEN,
                hasApiKey: !!process.env.TWITTER_API_KEY,
                hasApiSecret: !!process.env.TWITTER_API_SECRET,
                hasAccessToken: !!process.env.TWITTER_ACCESS_TOKEN,
                hasAccessTokenSecret: !!process.env.TWITTER_ACCESS_TOKEN_SECRET,
            }
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Twitter auth error:', error);

        return NextResponse.json({
            success: false,
            error: 'Twitter authentication failed',
            details: errorMessage,
        }, { status: 401 });
    }
}


// Post a tweet
export async function POST(request: Request) {
    try {
        const { text, mediaUrl } = await request.json();

        if (!text) {
            return NextResponse.json({ error: 'Tweet text is required' }, { status: 400 });
        }

        const client = new TwitterApi({
            appKey: process.env.TWITTER_API_KEY!,
            appSecret: process.env.TWITTER_API_SECRET!,
            accessToken: process.env.TWITTER_ACCESS_TOKEN!,
            accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
        });

        // Post the tweet
        const tweet = await client.v2.tweet(text);

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
