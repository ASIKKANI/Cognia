import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { content } = await req.json();

        if (!content || content.trim().length < 5) {
            return NextResponse.json({ mood: "Stoic" });
        }

        const aiUrl = process.env.LOCAL_AI_URL;
        const modelName = process.env.LOCAL_AI_MODEL || "llama3";

        if (!aiUrl) {
            return NextResponse.json({ mood: "Stoic", warning: "LOCAL_AI_URL not configured" });
        }

        // Clean the content (remove HTML tags if any, though the request should send plain text)
        const plainContent = content.replace(/<[^>]*>?/gm, '').slice(0, 1000);

        const prompt = `
            You are a sensitive emotional intelligence assistant. 
            Analyze the following personal journal entry and determine the primary emotional resonance.

            Journal Entry Snippet:
            "${plainContent}"

            CHOOSE EXACTLY ONE MOOD from this sanctioned list:
            - Calm (relaxed, peaceful, serene)
            - Joy (happy, grateful, optimistic)
            - Focus (productive, determined, thinking deeply)
            - Nature (reflective of outdoors, growth, or groundedness)
            - Melancholic (sad, lonely, low energy reflection)
            - Intense (stressed, anxious, extremely excited, or angry)
            - Stoic (neutral, factual, purely observational)

            CRITICAL RULES:
            1. Return ONLY the single word from the list above.
            2. No punctuation.
            3. No explanation.
            
            Mood:`;

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
            throw new Error(`Ollama error: ${response.status}`);
        }

        const data = await response.json();
        const rawText = data.response || "";
        const cleanText = rawText.trim().toLowerCase().replace(/[#._*]/g, '');

        const validMoods = ["Calm", "Joy", "Focus", "Nature", "Melancholic", "Intense", "Stoic"];
        const foundMood = validMoods.find(m => cleanText.includes(m.toLowerCase()));

        return NextResponse.json({
            mood: foundMood || "Stoic"
        });

    } catch (error: any) {
        console.error('Sentiment Analysis Error:', error);
        return NextResponse.json({ mood: "Stoic", error: error.message }, { status: 500 });
    }
}
