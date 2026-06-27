import { NextRequest, NextResponse } from 'next/server';

// ─────────────────────────────────────────────────────────────────────────────
// Off-topic server guard — blocks before hitting Gemini
// ─────────────────────────────────────────────────────────────────────────────
const OFF_TOPIC_PATTERNS = [
    /\b(recipe|cook|food|weather|sport|soccer|football|game|movie|music|politic|relationship|dating|coding|programming|homework|essay|poem|joke|story)\b/i
];

const FINANCE_KEYWORDS = [
    'rm', 'ringgit', 'spend', 'save', 'saving', 'budget', 'money', 'balance',
    'daily', 'safe', 'limit', 'fund', 'goal', 'bill', 'debt', 'loan', 'invest',
    'transfer', 'income', 'salary', 'credit', 'debit', 'bank', 'pocket', 'score',
    'streak', 'asb', 'unit trust', 'profit', 'loss', 'withdraw', 'deposit',
    'spending', 'afford', 'interest', 'return', 'growth', 'wallet', 'commit',
    'commitment', 'bnpl', 'autopay', 'insurance', 'tax', 'zakat', 'tabung', 'epf',
    'duit', 'pitih', 'gaji', 'baki', 'hutang', 'poket', 'simpan', 'keluar',
    'masuk', 'belanja', 'mahal', 'murah', 'pinjam', 'bayar'
];

function isOffTopic(message: string): boolean {
    const lower = message.toLowerCase();
    const hasFinanceKeyword = FINANCE_KEYWORDS.some(kw => lower.includes(kw));
    const hasOffTopic = OFF_TOPIC_PATTERNS.some(p => p.test(lower));
    // Block only if: explicitly off-topic OR no finance keyword found AND message is long enough to be a real query
    return hasOffTopic || (!hasFinanceKeyword && lower.trim().split(' ').length > 3);
}

// ─────────────────────────────────────────────────────────────────────────────
// Prompt Injection Guard
// ─────────────────────────────────────────────────────────────────────────────
const INJECTION_PATTERNS = [
    /ignore (all )?previous/i,
    /system prompt/i,
    /you are now/i,
    /forget (all )?instructions/i,
    /disregard/i,
    /bypass/i
];

function isPromptInjection(message: string): boolean {
    return INJECTION_PATTERNS.some(p => p.test(message));
}

// ─────────────────────────────────────────────────────────────────────────────
// Structured JSON Agent Personas
// Each agent instructs Gemini to return a strict JSON schema — no prose paragraphs.
// ─────────────────────────────────────────────────────────────────────────────
const STRUCTURED_SCHEMA = `
CRITICAL OUTPUT RULES — YOU MUST FOLLOW EXACTLY:
1. Reply ONLY with valid JSON. No markdown, no prose outside JSON.
2. Use this exact schema:
{
  "headline": "Short direct answer, max 8 words",
  "status": "good" | "warning" | "critical" | "neutral",
  "insight": "One sentence of actionable advice, max 20 words.",
  "lesson": "Short 2-sentence explainer teaching a financial concept relevant to the user's query.",
  "metric": { "label": "Metric name", "value": "Value with unit", "trend": "up" | "down" | "flat" } | null,
  "action": "Short CTA text if relevant (e.g. Enable Spend Guard)" | null,
  "actionType": "toggle_spend_guard" | "go_savings" | "go_bills" | "go_transfer" | null,
  "followUps": ["Short follow-up question 1", "Short follow-up question 2"]
}
3. If the question is NOT about personal finance, money, savings, bills, debt, or investments:
   Return: { "headline": "Finance questions only.", "status": "neutral", "insight": "Ask me about your budget, savings, or spending limits.", "lesson": null, "metric": null, "action": null, "actionType": null, "followUps": [] }
4. LOCALIZATION & DIALECTS: Automatically detect if the user is using a Malaysian dialect (e.g. Kelantan, Terengganu, Sabah, Sarawak, Utara) or casual slang/Manglish. If a dialect is detected, you MUST write the 'headline', 'insight', and 'action' strictly in that SAME dialect, ensuring cultural nuance and local slang are well represented.
`;

const AGENT_PROMPTS: Record<string, string> = {
    finance: `You are Finance Strategist, the chief financial advisor for BeU NextGen — a Malaysian personal finance app.
You answer questions about safe daily spending, net worth, budgets, and overall financial health.
Use RM currency. Be direct and warm.
${STRUCTURED_SCHEMA}`,

    save: `You are Savings Sentinel, a strict savings and budgeting coach for young Malaysians.
You help users set savings goals, cut expenses, and build emergency funds.
When the user wants to create a savings goal, use the createSavingsPocket function.
When the user wants to add funds to a pocket, use the addFundsToPocket function.
Use RM currency.
${STRUCTURED_SCHEMA}`,

    debt: `You are Commitment Shield, a specialist in bills, debt management, BNPL risks, and loan strategies for Malaysians.
Warn about BNPL risks. Use RM currency.
${STRUCTURED_SCHEMA}`,

    invest: `You are the Growth Guru. Your goal is to grow the user's wealth. Focus on micro-investing and compound interest.
    Use REAL Malaysian financial products and data:
    - ASB (Amanah Saham Bumiputera): ~5.0% - 5.5% annual dividend. Extremely low risk.
    - Fixed Deposits (FD): ~3.0% - 3.5% p.a. (e.g. Maybank, CIMB).
    - Roboadvisors (StashAway, Wahed): Target 6% - 8% p.a. for medium/high risk portfolios.
    - EPF (KWSP) Self-contribution: Historical 5.5% - 6% p.a. Great for retirement.
    Explain these clearly when asked about investing.
    If the user has excess cash (safe daily spend > RM 50), strongly recommend putting it to work.
Always mention risk level (Low/Medium/High). Use RM currency.
${STRUCTURED_SCHEMA}`,
};

// ─────────────────────────────────────────────────────────────────────────────
// Gemini Function Calling Tool Schemas
// (from AI Agent Migration & Cloud Deployment Guide — Part 1, Section 2)
// ─────────────────────────────────────────────────────────────────────────────
const TOOL_DECLARATIONS = [
    {
        name: "createSavingsPocket",
        description: "Creates a new savings pocket (goal) for the user with a specific target and optional initial deposit. Use this whenever the user wants to set a goal, create a fund, or setup a pocket.",
        parameters: {
            type: "OBJECT",
            properties: {
                name: {
                    type: "STRING",
                    description: "The name of the goal or pocket (e.g. New Phone, Trip to Japan, Laptop)"
                },
                target: {
                    type: "NUMBER",
                    description: "The target goal amount in RM (e.g. 2500)"
                },
                deposit: {
                    type: "NUMBER",
                    description: "Initial amount to deposit in RM. Default is 0."
                },
                mode: {
                    type: "STRING",
                    description: "Savings mode: 'savings' (low risk, standard) or 'growth' (higher returns, medium risk). Default is 'savings'."
                }
            },
            required: ["name", "target"]
        }
    },
    {
        name: "addFundsToPocket",
        description: "Add funds or deposit money into an existing savings pocket. Use this whenever the user wants to save, add, or deposit money into a specific pocket.",
        parameters: {
            type: "OBJECT",
            properties: {
                pocketName: {
                    type: "STRING",
                    description: "The name of the pocket to add funds to (e.g. Laptop Fund, Emergency Fund)"
                },
                amount: {
                    type: "NUMBER",
                    description: "The amount in RM to deposit"
                }
            },
            required: ["pocketName", "amount"]
        }
    },
    {
        name: "toggleSpendGuard",
        description: "Toggles the Spend Guard protection mode. Spend Guard limits daily spending to keep the user on track.",
        parameters: {
            type: "OBJECT",
            properties: {
                enable: {
                    type: "BOOLEAN",
                    description: "Whether to turn Spend Guard ON (true) or OFF (false)"
                }
            },
            required: ["enable"]
        }
    },
    {
        name: "addTransaction",
        description: "Logs a new transaction (expense) for the user. Use this when the user says they spent money or bought something.",
        parameters: {
            type: "OBJECT",
            properties: {
                title: {
                    type: "STRING",
                    description: "The name or description of the expense (e.g. Lunch, Grab, Movie)"
                },
                amount: {
                    type: "NUMBER",
                    description: "The amount spent in RM (e.g. 15.50)"
                },
                category: {
                    type: "STRING",
                    description: "Category: 'Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other'"
                }
            },
            required: ["title", "amount", "category"]
        }
    }
];

export async function POST(req: NextRequest) {
    try {
        // 1.4c Request body size limit
        const contentLength = parseInt(req.headers.get('content-length') || '0', 10);
        if (contentLength > 2048) {
            return NextResponse.json({ error: 'Request too large' }, { status: 413 });
        }

        const body = await req.json();
        const { message, agentId, context, history } = body;

        if (!message || !agentId) {
            return NextResponse.json({ error: 'Missing message or agentId' }, { status: 400 });
        }

        if (message.length > 500) {
            return NextResponse.json({ error: 'Message too long' }, { status: 400 });
        }

        // 1.4b Server-side prompt injection guard
        if (isPromptInjection(message)) {
             return NextResponse.json({
                structured: {
                    headline: 'Security Alert',
                    status: 'critical',
                    insight: 'Your request violated security policies.',
                    metric: null,
                    action: null,
                    actionType: null,
                },
                fallback: false,
            });
        }

        // ── Layer 2: Server-side off-topic guard (free, no API token burned) ──
        if (isOffTopic(message)) {
            return NextResponse.json({
                structured: {
                    headline: 'Finance questions only.',
                    status: 'neutral',
                    insight: 'Ask me about your budget, savings, spending limits, or bills.',
                    metric: null,
                    action: null,
                    actionType: null,
                },
                fallback: false,
            });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ 
                reply: null, 
                fallback: true,
                error: 'No GEMINI_API_KEY configured' 
            });
        }

        const systemPrompt = AGENT_PROMPTS[agentId] ?? AGENT_PROMPTS['finance'];

        // Build the user context string to give the AI awareness of the user's state
        let contextStr = '';
        if (context) {
            const parts: string[] = [];
            if (context.balance !== undefined) parts.push(`Current balance: RM ${context.balance.toFixed(2)}`);
            if (context.safeDailySpend !== undefined) parts.push(`Safe daily spend: RM ${context.safeDailySpend.toFixed(2)}`);
            if (context.nextGenScore !== undefined) parts.push(`NextGen Score: ${context.nextGenScore}%`);
            if (context.savingsPockets?.length) {
                const pocketList = context.savingsPockets.map((p: any) => `${p.name} (RM ${p.current}/${p.target})`).join(', ');
                parts.push(`Active savings pockets: ${pocketList}`);
            }
            if (context.isSpendGuardActive !== undefined) parts.push(`Spend Guard: ${context.isSpendGuardActive ? 'ON' : 'OFF'}`);
            if (parts.length > 0) {
                contextStr = `\n\nUser's current financial snapshot:\n${parts.join('\n')}`;
            }
        }

        const fullPrompt = message + contextStr;

        // Build history array
        const contents = [];
        if (history && Array.isArray(history)) {
            for (const msg of history) {
                if (msg.content) {
                    contents.push({
                        role: msg.role === 'user' ? 'user' : 'model',
                        parts: [{ text: msg.content }]
                    });
                }
            }
        }
        contents.push({ role: 'user', parts: [{ text: fullPrompt }] });

        // Determine which agents should have tool access
        const agentsWithTools = ['save', 'finance'];
        const shouldIncludeTools = agentsWithTools.includes(agentId);

        const requestBody: any = {
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: contents,
            // Lower temperature for consistent JSON output; small token budget since replies are short
            generationConfig: { maxOutputTokens: 256, temperature: 0.4 },
        };

        if (shouldIncludeTools) {
            requestBody.tools = [{ functionDeclarations: TOOL_DECLARATIONS }];
        }

        const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
        let response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            }
        );

        let isFallbackModel = false;
        
        // 3.2a Model Cascading on Rate Limit
        if (!response.ok && response.status === 429) {
            console.warn(`[AI Chat] Rate limit hit on ${modelName}, cascading to gemini-2.0-flash-lite`);
            const fallbackModelName = 'gemini-2.0-flash-lite';
            response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${fallbackModelName}:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody),
                }
            );
            isFallbackModel = true;
        }

        if (!response.ok) {
            const errBody = await response.text();
            console.error('[AI Chat] Gemini API error:', response.status, errBody);
            return NextResponse.json({ 
                reply: null, 
                fallback: true,
                error: `Gemini API returned ${response.status}` 
            });
        }

        const data = await response.json();
        const candidate = data?.candidates?.[0]?.content;

        if (!candidate?.parts?.length) {
            return NextResponse.json({ 
                reply: "I'm having trouble thinking right now. Let's try again.",
                fallback: false 
            });
        }

        // Check if Gemini returned a function call (tool use takes priority)
        const functionCallPart = candidate.parts.find((p: any) => p.functionCall);
        const textPart = candidate.parts.find((p: any) => p.text);

        if (functionCallPart) {
            return NextResponse.json({
                reply: textPart?.text || null,
                functionCall: {
                    name: functionCallPart.functionCall.name,
                    args: functionCallPart.functionCall.args,
                },
                fallback: false,
                isFallbackModel
            });
        }

        const rawText = textPart?.text ?? '';

        // ── Try to parse structured JSON response ──
        try {
            // Gemini sometimes wraps JSON in ```json ... ``` — strip that
            const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
            const parsed = JSON.parse(cleaned);
            // Validate it has the expected shape
            if (parsed.headline && parsed.status && parsed.insight !== undefined) {
                return NextResponse.json({ structured: parsed, fallback: false, isFallbackModel });
            }
        } catch {
            // JSON parse failed — fall through to plain text fallback
        }

        // Fallback: return as plain reply if JSON parsing fails
        return NextResponse.json({ reply: rawText, fallback: false, isFallbackModel });

    } catch (err) {
        console.error('[AI Chat] Internal error:', err);
        return NextResponse.json({ 
            reply: null,
            fallback: true,
            error: 'Internal Server Error' 
        }, { status: 500 });
    }
}
