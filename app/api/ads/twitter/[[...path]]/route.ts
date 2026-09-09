/**
 * Twitter/X Ads API Route Handler
 * 
 * Server-side proxy for Twitter Ads API calls.
 * Keeps API credentials secure on the server.
 * 
 * Environment variables required:
 * - TWITTER_API_KEY
 * - TWITTER_API_SECRET
 * - TWITTER_ACCESS_TOKEN
 * - TWITTER_ACCESS_TOKEN_SECRET
 * - TWITTER_ADS_ACCOUNT_ID (optional default)
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Twitter API base URLs
const TWITTER_ADS_API = 'https://ads-api.twitter.com/12';  // v12
const TWITTER_API = 'https://api.twitter.com/2';

// Environment variables
const API_KEY = process.env.TWITTER_API_KEY || '';
const API_SECRET = process.env.TWITTER_API_SECRET || '';
const ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN || '';
const ACCESS_TOKEN_SECRET = process.env.TWITTER_ACCESS_TOKEN_SECRET || '';

// ============================================================================
// OAuth 1.0a Signature Generation
// ============================================================================

function generateOAuthSignature(
    method: string,
    url: string,
    params: Record<string, string>,
    consumerSecret: string,
    tokenSecret: string
): string {
    // Sort and encode parameters
    const sortedParams = Object.keys(params)
        .sort()
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');

    // Create signature base string
    const signatureBase = [
        method.toUpperCase(),
        encodeURIComponent(url.split('?')[0]),
        encodeURIComponent(sortedParams),
    ].join('&');

    // Create signing key
    const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;

    // Generate HMAC-SHA1 signature
    const hmac = crypto.createHmac('sha1', signingKey);
    hmac.update(signatureBase);
    return hmac.digest('base64');
}

function generateOAuthHeader(
    method: string,
    url: string,
    additionalParams: Record<string, string> = {}
): string {
    const oauthParams: Record<string, string> = {
        oauth_consumer_key: API_KEY,
        oauth_nonce: crypto.randomBytes(16).toString('hex'),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
        oauth_token: ACCESS_TOKEN,
        oauth_version: '1.0',
    };

    // Combine with additional params for signature
    const allParams = { ...oauthParams, ...additionalParams };

    // Generate signature
    oauthParams.oauth_signature = generateOAuthSignature(
        method,
        url,
        allParams,
        API_SECRET,
        ACCESS_TOKEN_SECRET
    );

    // Build OAuth header
    const headerParams = Object.keys(oauthParams)
        .sort()
        .map(key => `${encodeURIComponent(key)}="${encodeURIComponent(oauthParams[key])}"`)
        .join(', ');

    return `OAuth ${headerParams}`;
}

// ============================================================================
// API Request Helper
// ============================================================================

async function twitterRequest(
    endpoint: string,
    options: {
        method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
        body?: Record<string, unknown>;
        isAdsApi?: boolean;
    } = {}
): Promise<{ data?: unknown; error?: { code: string; message: string } }> {
    const { method = 'GET', body, isAdsApi = true } = options;
    const baseUrl = isAdsApi ? TWITTER_ADS_API : TWITTER_API;
    const url = `${baseUrl}${endpoint}`;

    try {
        const headers: Record<string, string> = {
            Authorization: generateOAuthHeader(method, url),
            'Content-Type': 'application/json',
        };

        const fetchOptions: RequestInit = {
            method,
            headers,
        };

        if (body && method !== 'GET') {
            fetchOptions.body = JSON.stringify(body);
        }

        const response = await fetch(url, fetchOptions);
        const data = await response.json();

        if (!response.ok) {
            return {
                error: {
                    code: data.errors?.[0]?.code || 'TWITTER_API_ERROR',
                    message: data.errors?.[0]?.message || data.detail || 'Twitter API request failed',
                },
            };
        }

        return { data };
    } catch (error) {
        return {
            error: {
                code: 'REQUEST_FAILED',
                message: error instanceof Error ? error.message : 'Request failed',
            },
        };
    }
}

// ============================================================================
// Route Handler
// ============================================================================

export async function GET(request: NextRequest) {
    const { searchParams, pathname } = new URL(request.url);

    // Extract the path after /api/ads/twitter
    const pathParts = pathname.replace('/api/ads/twitter', '').split('/').filter(Boolean);

    // Check credentials
    if (!API_KEY || !API_SECRET || !ACCESS_TOKEN || !ACCESS_TOKEN_SECRET) {
        return NextResponse.json({
            success: false,
            error: {
                code: 'MISSING_CREDENTIALS',
                message: 'Twitter API credentials not configured. Set environment variables.',
            },
        }, { status: 500 });
    }

    try {
        // Route: GET /accounts
        if (pathParts.length === 0 || pathParts[0] === 'accounts') {
            if (pathParts.length === 1) {
                // List all ad accounts
                const result = await twitterRequest('/accounts');
                return NextResponse.json({
                    success: !result.error,
                    data: (result.data as any)?.data,
                    error: result.error,
                });
            }

            const accountId = pathParts[1];

            // Route: GET /accounts/:id/campaigns
            if (pathParts[2] === 'campaigns') {
                if (pathParts[3]) {
                    // Single campaign
                    const campaignId = pathParts[3];

                    if (pathParts[4] === 'stats' && pathParts[5] === 'realtime') {
                        // Realtime stats
                        const result = await twitterRequest(
                            `/stats/accounts/${accountId}?entity=CAMPAIGN&entity_ids=${campaignId}&granularity=TOTAL&metric_groups=ENGAGEMENT,BILLING`
                        );
                        return NextResponse.json({
                            success: !result.error,
                            data: result.data,
                            error: result.error,
                        });
                    }

                    const result = await twitterRequest(`/accounts/${accountId}/campaigns/${campaignId}`);
                    return NextResponse.json({
                        success: !result.error,
                        data: (result.data as any)?.data,
                        error: result.error,
                    });
                }

                // List campaigns
                const status = searchParams.get('status');
                const cursor = searchParams.get('cursor');
                const count = searchParams.get('count') || '50';

                let endpoint = `/accounts/${accountId}/campaigns?count=${count}`;
                if (status) endpoint += `&with_deleted=false&entity_status=${status}`;
                if (cursor) endpoint += `&cursor=${cursor}`;

                const result = await twitterRequest(endpoint);
                return NextResponse.json({
                    success: !result.error,
                    data: {
                        items: (result.data as any)?.data || [],
                        nextCursor: (result.data as any)?.next_cursor,
                    },
                    error: result.error,
                });
            }

            // Route: GET /accounts/:id/funding-instruments
            if (pathParts[2] === 'funding-instruments') {
                const result = await twitterRequest(`/accounts/${accountId}/funding_instruments`);
                return NextResponse.json({
                    success: !result.error,
                    data: (result.data as any)?.data,
                    error: result.error,
                });
            }

            // Route: GET /accounts/:id/line-items
            if (pathParts[2] === 'line-items') {
                const campaignId = searchParams.get('campaign_id');
                let endpoint = `/accounts/${accountId}/line_items`;
                if (campaignId) endpoint += `?campaign_ids=${campaignId}`;

                const result = await twitterRequest(endpoint);
                return NextResponse.json({
                    success: !result.error,
                    data: (result.data as any)?.data,
                    error: result.error,
                });
            }

            // Route: GET /accounts/:id/promoted-tweets
            if (pathParts[2] === 'promoted-tweets') {
                const lineItemId = searchParams.get('line_item_id');
                let endpoint = `/accounts/${accountId}/promoted_tweets`;
                if (lineItemId) endpoint += `?line_item_ids=${lineItemId}`;

                const result = await twitterRequest(endpoint);
                return NextResponse.json({
                    success: !result.error,
                    data: (result.data as any)?.data,
                    error: result.error,
                });
            }
        }

        // Route: GET /targeting/interests?q=...
        if (pathParts[0] === 'targeting' && pathParts[1] === 'interests') {
            const query = searchParams.get('q') || '';
            const result = await twitterRequest(`/targeting_criteria/interests?q=${encodeURIComponent(query)}`);
            return NextResponse.json({
                success: !result.error,
                data: (result.data as any)?.data,
                error: result.error,
            });
        }

        // Route: GET /targeting/locations?q=...
        if (pathParts[0] === 'targeting' && pathParts[1] === 'locations') {
            const query = searchParams.get('q') || '';
            const result = await twitterRequest(`/targeting_criteria/locations?q=${encodeURIComponent(query)}`);
            return NextResponse.json({
                success: !result.error,
                data: (result.data as any)?.data,
                error: result.error,
            });
        }

        return NextResponse.json({
            success: false,
            error: { code: 'NOT_FOUND', message: 'Endpoint not found' },
        }, { status: 404 });

    } catch (error) {
        return NextResponse.json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: error instanceof Error ? error.message : 'Internal server error',
            },
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const { pathname } = new URL(request.url);
    const pathParts = pathname.replace('/api/ads/twitter', '').split('/').filter(Boolean);

    // Check credentials
    if (!API_KEY || !API_SECRET || !ACCESS_TOKEN || !ACCESS_TOKEN_SECRET) {
        return NextResponse.json({
            success: false,
            error: {
                code: 'MISSING_CREDENTIALS',
                message: 'Twitter API credentials not configured.',
            },
        }, { status: 500 });
    }

    try {
        const body = await request.json();

        // Route: POST /accounts/:id/campaigns
        if (pathParts[0] === 'accounts' && pathParts[2] === 'campaigns') {
            const accountId = pathParts[1];

            // Full campaign creation
            if (pathParts[3] === 'full') {
                // This creates campaign + line item + promoted tweet in sequence
                // Step 1: Create campaign
                const campaignResult = await twitterRequest(`/accounts/${accountId}/campaigns`, {
                    method: 'POST',
                    body: {
                        name: body.name,
                        funding_instrument_id: body.funding_instrument_id,
                        daily_budget_amount_local_micro: body.budget?.type === 'daily'
                            ? Math.round(body.budget.amount * 1_000_000)
                            : undefined,
                        total_budget_amount_local_micro: body.budget?.type === 'lifetime'
                            ? Math.round(body.budget.amount * 1_000_000)
                            : undefined,
                        start_time: body.schedule?.start,
                        end_time: body.schedule?.end,
                        entity_status: 'PAUSED', // Start paused for safety
                    },
                });

                if (campaignResult.error) {
                    return NextResponse.json({
                        success: false,
                        error: campaignResult.error,
                    }, { status: 400 });
                }

                const campaign = (campaignResult.data as any)?.data;

                // Step 2: Create line item
                const lineItemResult = await twitterRequest(`/accounts/${accountId}/line_items`, {
                    method: 'POST',
                    body: {
                        campaign_id: campaign.id,
                        name: `${body.name} - Ad Group`,
                        objective: body.objective,
                        placements: ['ALL_ON_TWITTER'],
                        bid_type: 'AUTO',
                        entity_status: 'ACTIVE',
                    },
                });

                if (lineItemResult.error) {
                    return NextResponse.json({
                        success: false,
                        error: lineItemResult.error,
                        data: { campaign }, // Return campaign even if line item fails
                    }, { status: 400 });
                }

                const lineItem = (lineItemResult.data as any)?.data;

                // Step 3: Apply targeting
                if (body.targeting) {
                    await applyTargeting(accountId, lineItem.id, body.targeting);
                }

                // Step 4: Create tweet and promote (if creative provided)
                let promotedTweet = null;
                if (body.creative?.tweetText) {
                    // Create tweet via Twitter API v2
                    const tweetResult = await twitterRequest('/tweets', {
                        method: 'POST',
                        body: { text: body.creative.tweetText },
                        isAdsApi: false,
                    });

                    if (!tweetResult.error) {
                        const tweet = (tweetResult.data as any)?.data;

                        // Promote the tweet
                        const promoteResult = await twitterRequest(`/accounts/${accountId}/promoted_tweets`, {
                            method: 'POST',
                            body: {
                                line_item_id: lineItem.id,
                                tweet_ids: [tweet.id],
                            },
                        });

                        if (!promoteResult.error) {
                            promotedTweet = (promoteResult.data as any)?.data?.[0];
                        }
                    }
                }

                return NextResponse.json({
                    success: true,
                    data: {
                        campaign: normalizeCampaign(campaign),
                        lineItem,
                        promotedTweet,
                    },
                });
            }

            // Simple campaign creation
            const result = await twitterRequest(`/accounts/${accountId}/campaigns`, {
                method: 'POST',
                body,
            });

            return NextResponse.json({
                success: !result.error,
                data: result.data ? normalizeCampaign((result.data as any)?.data) : undefined,
                error: result.error,
            });
        }

        // Route: POST /accounts/:id/line-items
        if (pathParts[0] === 'accounts' && pathParts[2] === 'line-items') {
            const accountId = pathParts[1];
            const result = await twitterRequest(`/accounts/${accountId}/line_items`, {
                method: 'POST',
                body,
            });
            return NextResponse.json({
                success: !result.error,
                data: (result.data as any)?.data,
                error: result.error,
            });
        }

        // Route: POST /accounts/:id/promoted-tweets
        if (pathParts[0] === 'accounts' && pathParts[2] === 'promoted-tweets') {
            const accountId = pathParts[1];
            const result = await twitterRequest(`/accounts/${accountId}/promoted_tweets`, {
                method: 'POST',
                body,
            });
            return NextResponse.json({
                success: !result.error,
                data: (result.data as any)?.data,
                error: result.error,
            });
        }

        // Route: POST /accounts/:id/analytics
        if (pathParts[0] === 'accounts' && pathParts[2] === 'analytics') {
            const accountId = pathParts[1];
            const { campaign_ids, start_time, end_time, granularity, metric_groups } = body;

            const params = new URLSearchParams({
                entity: 'CAMPAIGN',
                entity_ids: campaign_ids.join(','),
                start_time,
                end_time,
                granularity: granularity || 'TOTAL',
                metric_groups: (metric_groups || ['ENGAGEMENT', 'BILLING']).join(','),
            });

            const result = await twitterRequest(`/stats/accounts/${accountId}?${params}`);
            return NextResponse.json({
                success: !result.error,
                data: normalizeMetrics((result.data as any)?.data, campaign_ids),
                error: result.error,
            });
        }

        // Route: POST /accounts/:id/audience-estimate
        if (pathParts[0] === 'accounts' && pathParts[2] === 'audience-estimate') {
            const accountId = pathParts[1];
            const result = await twitterRequest(`/accounts/${accountId}/reach_estimate`, {
                method: 'POST',
                body: { targeting_criteria: body },
            });
            return NextResponse.json({
                success: !result.error,
                data: {
                    audienceSize: {
                        min: (result.data as any)?.data?.count?.min || 0,
                        max: (result.data as any)?.data?.count?.max || 0,
                    },
                },
                error: result.error,
            });
        }

        return NextResponse.json({
            success: false,
            error: { code: 'NOT_FOUND', message: 'Endpoint not found' },
        }, { status: 404 });

    } catch (error) {
        return NextResponse.json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: error instanceof Error ? error.message : 'Internal server error',
            },
        }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    const { pathname } = new URL(request.url);
    const pathParts = pathname.replace('/api/ads/twitter', '').split('/').filter(Boolean);

    if (!API_KEY || !API_SECRET || !ACCESS_TOKEN || !ACCESS_TOKEN_SECRET) {
        return NextResponse.json({
            success: false,
            error: { code: 'MISSING_CREDENTIALS', message: 'Twitter API credentials not configured.' },
        }, { status: 500 });
    }

    try {
        const body = await request.json();

        // Route: PUT /accounts/:id/campaigns/:campaignId
        if (pathParts[0] === 'accounts' && pathParts[2] === 'campaigns' && pathParts[3]) {
            const accountId = pathParts[1];
            const campaignId = pathParts[3];

            const result = await twitterRequest(`/accounts/${accountId}/campaigns/${campaignId}`, {
                method: 'PUT',
                body,
            });

            return NextResponse.json({
                success: !result.error,
                data: result.data ? normalizeCampaign((result.data as any)?.data) : undefined,
                error: result.error,
            });
        }

        // Route: PUT /accounts/:id/line-items/:lineItemId/targeting
        if (pathParts[0] === 'accounts' && pathParts[2] === 'line-items' && pathParts[4] === 'targeting') {
            const accountId = pathParts[1];
            const lineItemId = pathParts[3];

            await applyTargeting(accountId, lineItemId, body);

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({
            success: false,
            error: { code: 'NOT_FOUND', message: 'Endpoint not found' },
        }, { status: 404 });

    } catch (error) {
        return NextResponse.json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: error instanceof Error ? error.message : 'Internal server error',
            },
        }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const { pathname } = new URL(request.url);
    const pathParts = pathname.replace('/api/ads/twitter', '').split('/').filter(Boolean);

    if (!API_KEY || !API_SECRET || !ACCESS_TOKEN || !ACCESS_TOKEN_SECRET) {
        return NextResponse.json({
            success: false,
            error: { code: 'MISSING_CREDENTIALS', message: 'Twitter API credentials not configured.' },
        }, { status: 500 });
    }

    try {
        // Route: DELETE /accounts/:id/campaigns/:campaignId
        if (pathParts[0] === 'accounts' && pathParts[2] === 'campaigns' && pathParts[3]) {
            const accountId = pathParts[1];
            const campaignId = pathParts[3];

            const result = await twitterRequest(`/accounts/${accountId}/campaigns/${campaignId}`, {
                method: 'DELETE',
            });

            return NextResponse.json({
                success: !result.error,
                data: { deleted: !result.error },
                error: result.error,
            });
        }

        return NextResponse.json({
            success: false,
            error: { code: 'NOT_FOUND', message: 'Endpoint not found' },
        }, { status: 404 });

    } catch (error) {
        return NextResponse.json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: error instanceof Error ? error.message : 'Internal server error',
            },
        }, { status: 500 });
    }
}

// ============================================================================
// Helper Functions
// ============================================================================

async function applyTargeting(
    accountId: string,
    lineItemId: string,
    targeting: Record<string, unknown>
): Promise<void> {
    const targetingTypes: { key: string; type: string }[] = [
        { key: 'locations', type: 'LOCATION' },
        { key: 'interests', type: 'INTEREST' },
        { key: 'keywords', type: 'BROAD_KEYWORD' },
        { key: 'followerLookalikes', type: 'FOLLOWER_LOOK_ALIKE' },
        { key: 'platforms', type: 'PLATFORM' },
        { key: 'languages', type: 'LANGUAGE' },
    ];

    for (const { key, type } of targetingTypes) {
        const values = targeting[key] as string[] | undefined;
        if (values?.length) {
            await twitterRequest(`/accounts/${accountId}/targeting_criteria`, {
                method: 'POST',
                body: {
                    line_item_id: lineItemId,
                    targeting_type: type,
                    targeting_value: values.join(','),
                },
            });
        }
    }

    // Age targeting
    if (targeting.age) {
        const age = targeting.age as { min: number; max?: number };
        await twitterRequest(`/accounts/${accountId}/targeting_criteria`, {
            method: 'POST',
            body: {
                line_item_id: lineItemId,
                targeting_type: 'AGE',
                targeting_value: `AGE_${age.min}_AND_UP`,
            },
        });
    }

    // Gender targeting
    if (targeting.gender && targeting.gender !== 'ANY') {
        await twitterRequest(`/accounts/${accountId}/targeting_criteria`, {
            method: 'POST',
            body: {
                line_item_id: lineItemId,
                targeting_type: 'GENDER',
                targeting_value: targeting.gender,
            },
        });
    }
}

function normalizeCampaign(twitterCampaign: Record<string, unknown>): Record<string, unknown> {
    return {
        id: twitterCampaign.id,
        externalId: twitterCampaign.id,
        platform: 'twitter',
        name: twitterCampaign.name,
        status: String(twitterCampaign.entity_status).toLowerCase(),
        budget: {
            amount: ((twitterCampaign.daily_budget_amount_local_micro as number) ||
                (twitterCampaign.total_budget_amount_local_micro as number) || 0) / 1_000_000,
            currency: twitterCampaign.currency,
            type: twitterCampaign.daily_budget_amount_local_micro ? 'daily' : 'lifetime',
        },
        schedule: {
            start: twitterCampaign.start_time,
            end: twitterCampaign.end_time,
        },
        createdAt: twitterCampaign.created_at,
        updatedAt: twitterCampaign.updated_at,
        platformData: twitterCampaign,
    };
}

function normalizeMetrics(
    twitterMetrics: Record<string, unknown>[] | undefined,
    campaignIds: string[]
): Record<string, unknown>[] {
    if (!twitterMetrics) return [];

    return twitterMetrics.map((metric, index) => ({
        campaignId: campaignIds[index],
        platform: 'twitter',
        impressions: (metric as any).impressions?.[0] || 0,
        clicks: (metric as any).clicks?.[0] || 0,
        spend: ((metric as any).billed_charge_local_micro?.[0] || 0) / 1_000_000,
        engagements: (metric as any).engagements?.[0] || 0,
        retweets: (metric as any).retweets?.[0] || 0,
        likes: (metric as any).likes?.[0] || 0,
        follows: (metric as any).follows?.[0] || 0,
        videoViews: (metric as any).video_views_25?.[0] || 0,
    }));
}