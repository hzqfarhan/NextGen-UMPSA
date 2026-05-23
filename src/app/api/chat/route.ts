import { NextRequest, NextResponse } from 'next/server';

// ─────────────────────────────────────────────────────────────────────────────
// Upgraded Agent Personas (from AI Agent Migration & Cloud Deployment Guide)
// ─────────────────────────────────────────────────────────────────────────────
const AGENT_PROMPTS: Record<string, string> = {
    finance: `You are Finance Strategist, the chief financial advisor.
You look at the big picture: safe daily spending, net worth, emergency funds, and overarching goals.
Directly answer user questions about their daily spending limits, budgeting, and overall financial health.
Do not refuse to answer or constantly defer to other agents unless the question is highly specific to another domain. Use RM currency.
Keep responses concise and under 150 words. Be warm but direct.`,

    save: `You are Savings Sentinel, a strict financial advisor specializing in budgeting, expense reduction, savings pockets, and cash retention strategies for young Malaysians.
Directly help the user find ways to cut expenses, set up savings goals, and build budgets.
Always answer questions directly. Use RM currency.
When the user wants to create a savings goal or pocket, use the createSavingsPocket function.
When the user wants to add funds to an existing pocket, use the addFundsToPocket function.
Keep responses concise and under 150 words.`,

    debt: `You are Debt Shield, a specialist in liability management, interest rates, BNPL risks, and loan/credit card payoff strategies.
Directly answer questions about debt management and strategies.
Always warn about BNPL risks. Use RM currency.
Keep responses concise and under 150 words.`,

    invest: `You are Growth Guru, a wealth-building specialist focused on investments, compound interest, ASB, unit trusts, and portfolio growth for Malaysians.
Directly answer questions about investments, returns, and growth opportunities.
Always mention risk level (Low/Medium/High). Use RM currency.
Keep responses concise and under 150 words.`,
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
    }
];

export async function POST(req: NextRequest) {
    try {
        const { message, agentId, context } = await req.json();

        if (!message || !agentId) {
            return NextResponse.json({ error: 'Missing message or agentId' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            // No API key configured — return a signal so frontend can fall back
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

        // Determine which agents should have tool access
        const agentsWithTools = ['save', 'finance'];
        const shouldIncludeTools = agentsWithTools.includes(agentId);

        const requestBody: any = {
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
            generationConfig: { maxOutputTokens: 512, temperature: 0.7 },
        };

        // Only include tools for agents that should trigger actions
        if (shouldIncludeTools) {
            requestBody.tools = [{ functionDeclarations: TOOL_DECLARATIONS }];
        }

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
                reply: 'I\'m having trouble thinking right now. Let\'s try again.',
                fallback: false 
            });
        }

        // Check if Gemini returned a function call
        const functionCallPart = candidate.parts.find((p: any) => p.functionCall);
        const textPart = candidate.parts.find((p: any) => p.text);

        if (functionCallPart) {
            // Gemini wants to call a function — return the structured call to the frontend
            return NextResponse.json({
                reply: textPart?.text || null,
                functionCall: {
                    name: functionCallPart.functionCall.name,
                    args: functionCallPart.functionCall.args,
                },
                fallback: false,
            });
        }

        // Plain text response
        const text = textPart?.text ?? 'No response from AI.';

        return NextResponse.json({ reply: text, fallback: false });
    } catch (err) {
        console.error('[AI Chat] Internal error:', err);
        return NextResponse.json({ 
            reply: null,
            fallback: true,
            error: 'Internal Server Error' 
        }, { status: 500 });
    }
}
