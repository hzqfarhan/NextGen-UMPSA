import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return NextResponse.json({
            success: false,
            error: 'GEMINI_API_KEY is not set in environment variables.'
        });
    }

    const startTime = Date.now();
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: 'Respond with exactly one word: "Connected".' }] }]
                })
            }
        );

        const data = await response.json();
        
        if (data.error) {
            return NextResponse.json({
                success: false,
                error: `Gemini API returned error: ${data.error.message || JSON.stringify(data.error)}`
            });
        }

        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        const latency = Date.now() - startTime;

        if (!text) {
            return NextResponse.json({
                success: false,
                error: 'Gemini returned an empty response. Verify key permissions.'
            });
        }

        return NextResponse.json({
            success: true,
            latency: `${latency}ms`,
            response: text
        });
    } catch (err: any) {
        return NextResponse.json({
            success: false,
            error: err.message || 'Failed to request Gemini API.'
        });
    }
}
