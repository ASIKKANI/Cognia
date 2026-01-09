// Simple in-memory cache to prevent redundant API calls
const moodCache: Record<string, string> = {};

export async function analyzeTrackMood(trackName: string, artistName: string): Promise<string | null> {
    const key = `${trackName}-${artistName}`.toLowerCase();
    if (moodCache[key]) return moodCache[key];

    // Local AI Configuration
    const aiUrl = process.env.LOCAL_AI_URL; // e.g., http://192.168.1.X:11434/api/generate
    const modelName = process.env.LOCAL_AI_MODEL || "llama3";

    if (!aiUrl) {
        console.warn("AI Mood Engine: LOCAL_AI_URL not set. Using Audio Feature Fallback.");
        return null;
    }

    try {
        const prompt = `
            You are a Music Analyst for a well-being application.
            Your task is to infer the dominant *perceived mood* of a track based on
            how it typically feels to listeners — not personal interpretation.

            Track: "${trackName}" by "${artistName}"

            STEP 1 — ANALYZE USING THESE SIGNALS (in this order of priority):
            1. Energy & tempo (slow / moderate / fast)
            2. Sonic texture (soft, heavy, distorted, airy, smooth)
            3. Overall emotional tone (uplifting, tense, calm, heavy, neutral)
            4. Genre conventions ONLY if audio cues are ambiguous

            STEP 2 — CHOOSE EXACTLY ONE MOOD from this list:
            - Euphoric (high energy, expansive, uplifting, soaring)
            - Peaceful (very calm, ambient, meditative)
            - Aggressive (angry, heavy, confrontational)
            - Melancholic (consistently sad, slow, emotionally heavy)
            - Intense (fast, tense, dramatic, adrenaline-driven)
            - Chill (laid-back, smooth, lo-fi, shoegaze, relaxed)
            - Positive (upbeat, light, catchy, good-vibes)
            - Stoic (emotionally neutral, restrained, serious)

            IMPORTANT CONSTRAINTS:
            - Do NOT assume sadness unless the track is clearly slow AND emotionally heavy.
            - Alternative metal / shoegaze (e.g., Deftones-style) is often "Chill", "Intense", or "Euphoric", not automatically "Melancholic".
            - Heavy ≠ sad. Distortion alone does not imply melancholy.
            - If multiple moods apply, choose the one a casual listener would feel FIRST.
            - If unsure between two moods, prefer the higher-energy one.

            CRITICAL OUTPUT RULE:
            Return ONLY the single mood word.
            No explanations. No punctuation. No extra text.
        `;

        console.log(`[Llama Debug] Requesting analysis for: "${trackName}" -> ${aiUrl}`);

        const response = await fetch(aiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: modelName,
                prompt: prompt,
                stream: false
            })
        });

        if (!response.ok) {
            console.error(`[Llama Debug] Failed with status: ${response.status}`);
            throw new Error(`Status ${response.status}`);
        }

        const data = await response.json();
        const rawText = data.response || "";
        console.log(`[Llama Debug] Raw Output for "${trackName}": [${rawText.trim()}]`);

        const cleanText = rawText.toLowerCase().replace(/[*_"`.]/g, " ").trim();
        const validMoods = ["Euphoric", "Peaceful", "Aggressive", "Melancholic", "Intense", "Chill", "Positive", "Stoic"];

        // Match exact words to avoid false positives
        const foundMood = validMoods.find(m => cleanText.split(/\s+/).includes(m.toLowerCase()));

        if (!foundMood) {
            console.warn(`[Llama Debug] Could not parse mood from: "${rawText}"`);
            return null;
        }

        const finalMood = foundMood.charAt(0).toUpperCase() + foundMood.slice(1);
        moodCache[key] = finalMood;
        console.log(`[Llama Debug] Success! Assigned: ${finalMood}`);
        return finalMood;

    } catch (error: any) {
        console.error("[Llama Debug] Error:", error.message);
        return null; // Trigger Fallback
    }
}
