import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { entries } = await req.json();

        if (!entries || !Array.isArray(entries) || entries.length === 0) {
            return NextResponse.json({ error: "No entries provided" }, { status: 400 });
        }

        const aiUrl = process.env.LOCAL_AI_URL;
        const modelName = process.env.LOCAL_AI_MODEL || "llama3";

        if (!aiUrl) {
            return NextResponse.json({ error: "LOCAL_AI_URL not configured" }, { status: 500 });
        }

        // Prepare a summary of entries for the AI
        const summaryText = entries.slice(0, 10).map(e => {
            const date = new Date(e.createdAt).toLocaleDateString();
            const content = e.content.replace(/<[^>]*>?/gm, '').slice(0, 200);
            return `Date: ${date} | Mood: ${e.mood || 'Unknown'} | content: ${content}...`;
        }).join('\n\n');

        const prompt = `
            You are an advanced Behavioral Biometrics Analyst. 
            Analyze the following sequence of journal entries to create a "Personal Behavioral Audit".

            Sequence:
            ${summaryText}

            TASK 1: Determine "Emotional Resilience" (Score 0-100).
            TASK 2: Identify "Anomalies" (Sudden, unexplained emotional shifts or contradictory behaviors).
            TASK 3: Generate a "Cognitive Signature" (3-4 word description of their current state).

            RETURN JSON ONLY in this format:
            {
                "resilienceScore": number,
                "signature": "string",
                "summary": "string (2 sentences maximum)",
                "anomalies": ["string", "string"],
                "recommendation": "string"
            }

            Do not include any text outside the JSON block.`;

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
        const rawText = data.response || "{}";

        // Extract JSON block in case Llama adds fluff
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        const jsonResult = jsonMatch ? JSON.parse(jsonMatch[0]) : { resilienceScore: 50, signature: "Analysis Failure", summary: "Could not parse AI response", anomalies: [], recommendation: "Keep writing." };

        return NextResponse.json(jsonResult);

    } catch (error: any) {
        console.error('Profile Analysis Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
