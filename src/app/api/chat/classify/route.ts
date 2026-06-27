import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `
Classify this message into exactly one intent:
savings | debt | invest | transfer | bills | balance | general_finance
Reply with the intent ID only. Do not include any punctuation or extra text.
`;

export async function POST(req: NextRequest) {
    try {
        const { message } = await req.json();

        if (!message) {
            return NextResponse.json({ error: 'Missing message' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ intent: 'general_finance' }); // Fallback
        }

        const requestBody = {
            system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: [{ role: 'user', parts: [{ text: message }] }],
            generationConfig: { maxOutputTokens: 5, temperature: 0.1 },
        };

        const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            }
        );

        if (!response.ok) {
            console.error('[AI Classify] Gemini API error:', response.status);
            return NextResponse.json({ intent: 'general_finance' }); // Fallback
        }

        const data = await response.json();
        const candidate = data?.candidates?.[0]?.content;
        const textPart = candidate?.parts?.find((p: any) => p.text);
        
        let intent = textPart?.text?.trim().toLowerCase() || 'general_finance';
        
        const validIntents = ['savings', 'debt', 'invest', 'transfer', 'bills', 'balance', 'general_finance'];
        if (!validIntents.includes(intent)) {
            intent = 'general_finance';
        }

        return NextResponse.json({ intent });

    } catch (err) {
        console.error('[AI Classify] Internal error:', err);
        return NextResponse.json({ intent: 'general_finance' }); // Fallback
    }
}
