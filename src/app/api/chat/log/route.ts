import { NextRequest, NextResponse } from 'next/server';

// ─────────────────────────────────────────────────────────────────────────────
// Chat Log API — Persists conversations to PostgreSQL
// Schema from AI Agent Migration & Cloud Deployment Guide (Part 2, Section 3)
//
// CREATE TABLE chat_logs (
//     id SERIAL PRIMARY KEY,
//     timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     user_name VARCHAR(100) NOT NULL,
//     agent_id VARCHAR(50) NOT NULL,
//     message TEXT NOT NULL,
//     response TEXT NOT NULL,
//     function_called VARCHAR(100) NULL
// );
// ─────────────────────────────────────────────────────────────────────────────

interface ChatLogEntry {
    user_name: string;
    agent_id: string;
    message: string;
    response: string;
    function_called?: string | null;
}

export async function POST(req: NextRequest) {
    try {
        const dbUrl = process.env.DATABASE_URL;

        // Gracefully skip if no database is configured (dev/static mode)
        if (!dbUrl) {
            return NextResponse.json({ 
                logged: false, 
                reason: 'No DATABASE_URL configured — chat logging is disabled.' 
            });
        }

        const body: ChatLogEntry = await req.json();

        if (!body.user_name || !body.agent_id || !body.message || !body.response) {
            return NextResponse.json(
                { error: 'Missing required fields: user_name, agent_id, message, response' },
                { status: 400 }
            );
        }

        // ──────────────────────────────────────────────────────────
        // PostgreSQL INSERT using native pg driver
        // Install: npm install pg  (only needed when DATABASE_URL is set)
        // ──────────────────────────────────────────────────────────
        let Client;
        try {
            // Dynamic import so it doesn't crash when pg isn't installed (static/dev mode)
            // @ts-ignore — pg is only available when deployed with DATABASE_URL
            const pg = await import('pg');
            Client = pg.default?.Client || pg.Client;
        } catch {
            return NextResponse.json({ 
                logged: false, 
                reason: 'pg module not installed. Run: npm install pg' 
            });
        }

        const client = new Client({ connectionString: dbUrl });
        await client.connect();

        await client.query(
            `INSERT INTO chat_logs (user_name, agent_id, message, response, function_called)
             VALUES ($1, $2, $3, $4, $5)`,
            [
                body.user_name,
                body.agent_id,
                body.message,
                body.response,
                body.function_called || null,
            ]
        );

        await client.end();

        return NextResponse.json({ logged: true });
    } catch (err: any) {
        console.error('[Chat Log] Error:', err?.message || err);
        return NextResponse.json(
            { logged: false, error: err?.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
