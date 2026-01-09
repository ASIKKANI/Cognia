import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { fetchRecentlyPlayed, fetchAudioFeatures, aggregateDailyFeatures, fetchCurrentlyPlaying, getAISonicSignature, getMoodArchetype } from '@/lib/spotify';
import { analyzeTrackMood } from '@/lib/gemini';

export async function GET() {
    console.log('Spotify API Route: Starting request...');
    const session: any = await getServerSession(authOptions);

    if (!session) {
        console.log('Spotify API Route: No session found');
        return NextResponse.json({ error: 'Unauthorized: No session' }, { status: 401 });
    }

    if (!session.accessToken) {
        console.log('Spotify API Route: No access token found in session');
        return NextResponse.json({ error: 'Unauthorized: No access token' }, { status: 401 });
    }

    try {
        console.log('Spotify API Route: Fetching data...');
        const recentlyPlayedRes = await fetchRecentlyPlayed(session.accessToken);
        const items = recentlyPlayedRes.items || [];

        // FILTER: Only standard tracks
        const filteredItems = items.filter((item: any) => item.track?.type === 'track');
        const trackIds = filteredItems.map((item: any) => item.track.id);

        console.log('Spotify API Route: Found ' + trackIds.length + ' tracks. Fetching features...');

        const audioFeaturesResponse = await fetchAudioFeatures(session.accessToken, trackIds);
        const currentlyPlaying = await fetchCurrentlyPlaying(session.accessToken);

        let nowPlayingFeatures = null;
        if (currentlyPlaying?.item?.id) {
            const res = await fetchAudioFeatures(session.accessToken, [currentlyPlaying.item.id]);
            nowPlayingFeatures = res.audio_features?.[0];
        }

        const aggregated = await aggregateDailyFeatures(filteredItems, audioFeaturesResponse.audio_features || []);

        const tracks = await Promise.all(filteredItems.slice(0, 20).map(async (item: any, index: number) => {
            const f = audioFeaturesResponse.audio_features?.[index];

            // OPTIMIZATION: Only analyze the first 5 tracks deeply with AI.
            // FALLBACK SYSTEM: If AI fails or returns null, use Audio Analysis (Valence/Energy).
            let mood = null;

            if (index < 5) {
                mood = await analyzeTrackMood(item.track.name, item.track.artists[0]?.name);
            }

            // SMART FALLBACK: If AI didn't run (index >= 5) or FAILED (returned null),
            // use the mathematical mood from audio features.
            if (!mood || mood === "Stoic") {
                mood = getAISonicSignature(f, item.track.name, item.track.artists[0]?.name).includes("Drift")
                    ? "Stoic"
                    : getMoodArchetype(f, item.track.name, item.track.artists[0]?.name);
            }

            return {
                id: item.track.id,
                name: item.track.name,
                artist: item.track.artists[0]?.name || 'Unknown Artist',
                albumArt: item.track.album?.images[0]?.url,
                playedAt: item.played_at,
                description: getAISonicSignature(f, item.track.name, item.track.artists[0]?.name),
                mood: mood,
                features: f ? {
                    tempo: Math.round(f.tempo),
                    energy: f.energy,
                    valence: f.valence,
                    danceability: f.danceability,
                    instrumentalness: f.instrumentalness
                } : null
            };
        }));

        // Calculate Aggregated Moods from the FINAL processed tracks
        const moodCounts: Record<string, number> = {};
        tracks.forEach(t => {
            const m = t.mood || "Stoic";
            moodCounts[m] = (moodCounts[m] || 0) + 1;
        });

        // Patch the aggregated object with our correct distribution
        if (aggregated) {
            aggregated.moodDistribution = moodCounts;
        }

        return NextResponse.json({
            aggregated,
            tracks,
            nowPlaying: currentlyPlaying ? {
                id: currentlyPlaying.item?.id,
                name: currentlyPlaying.item?.name,
                artist: currentlyPlaying.item?.artists[0]?.name,
                albumArt: currentlyPlaying.item?.album?.images[0]?.url,
                isPlaying: currentlyPlaying.is_playing,
                description: getAISonicSignature(nowPlayingFeatures, currentlyPlaying.item?.name, currentlyPlaying.item?.artists[0]?.name),
                mood: (await analyzeTrackMood(currentlyPlaying.item?.name, currentlyPlaying.item?.artists[0]?.name)) ||
                    getMoodArchetype(nowPlayingFeatures, currentlyPlaying.item?.name, currentlyPlaying.item?.artists[0]?.name),
                features: nowPlayingFeatures ? {
                    tempo: Math.round(nowPlayingFeatures.tempo),
                    energy: nowPlayingFeatures.energy,
                    valence: nowPlayingFeatures.valence,
                    danceability: nowPlayingFeatures.danceability,
                    instrumentalness: nowPlayingFeatures.instrumentalness
                } : null
            } : null
        });
    } catch (error: any) {
        console.error('Spotify API Route ERROR:', error);
        return NextResponse.json({
            error: error.message
        }, { status: 500 });
    }
}
