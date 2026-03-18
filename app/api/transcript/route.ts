import { NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');

    if (!videoId) {
        return NextResponse.json(
            { error: 'Missing videoId parameter' },
            { status: 400 }
        );
    }

    try {
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
        return NextResponse.json({ transcript });
    } catch (error: any) {
        console.error('Error fetching transcript:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch transcript. Please ensure the video has closed captions/subtitles enabled.' },
            { status: 500 }
        );
    }
}
