import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { item, budgetLimit } = body;

        if (!item) {
            return NextResponse.json({ error: 'Missing item' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ alternatives: [] });
        }

        const systemPrompt = `You are a shopping assistant. The user wants to buy "${item}" but it exceeds their budget. Their budget limit for an alternative is RM ${budgetLimit}.
Return exactly 2 cheaper alternatives that fit the budget.
CRITICAL RULE: Return ONLY a valid JSON array of objects. No markdown, no prose.
Schema:
[
  {
    "platform": "Shopee" | "Lazada",
    "name": "Alternative item name",
    "price": <number less than budgetLimit>,
    "condition": "New" | "Refurbished" | "Pre-owned"
  }
]`;

        const requestBody = {
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: 'user', parts: [{ text: `Find alternatives for ${item} under RM ${budgetLimit}` }] }],
            generationConfig: { maxOutputTokens: 256, temperature: 0.5 },
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
            return NextResponse.json({ alternatives: [] });
        }

        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.find((p: any) => p.text)?.text || '';
        
        try {
            const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
            const parsed = JSON.parse(cleaned);
            
            // Map to include UI elements
            const formattedAlternatives = parsed.map((alt: any) => ({
                ...alt,
                color: alt.platform === 'Shopee' ? 'orange' : 'blue',
                image: alt.platform === 'Shopee' ? '/assets/dump/sp.png' : '/assets/dump/lz.png',
                link: '#'
            }));
            
            return NextResponse.json({ alternatives: formattedAlternatives });
        } catch {
            return NextResponse.json({ alternatives: [] });
        }
    } catch (err) {
        return NextResponse.json({ alternatives: [] }, { status: 500 });
    }
}
