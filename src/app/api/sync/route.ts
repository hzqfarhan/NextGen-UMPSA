import { NextRequest, NextResponse } from 'next/server';

// ─────────────────────────────────────────────────────────────────────────────
// Sync API — Persists/Retrieves Zustand store state to/from PostgreSQL
// Stored as a JSONB payload per user name (acting as unique key for hackathon)
//
// CREATE TABLE IF NOT EXISTS user_sync (
//     user_name VARCHAR(100) PRIMARY KEY,
//     balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
//     nextgen_score INTEGER NOT NULL DEFAULT 60,
//     streak INTEGER NOT NULL DEFAULT 0,
//     state_data JSONB NOT NULL,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
    try {
        const dbUrl = process.env.DATABASE_URL;
        const { searchParams } = new URL(req.url);
        const userName = searchParams.get('username') || 'Aiman';

        if (!dbUrl) {
            return NextResponse.json({ 
                success: false, 
                reason: 'No DATABASE_URL configured — cloud sync is disabled.' 
            });
        }

        let Client;
        try {
            // @ts-ignore
            const pg = await import('pg');
            Client = pg.default?.Client || pg.Client;
        } catch {
            return NextResponse.json({ 
                success: false, 
                reason: 'pg module not installed. Run: npm install pg' 
            });
        }

        const client = new Client({ connectionString: dbUrl });
        await client.connect();

        const result = await client.query(
            `SELECT state_data FROM user_sync WHERE user_name = $1`,
            [userName]
        );

        await client.end();

        if (result.rows.length === 0) {
            return NextResponse.json({ success: true, data: null });
        }

        return NextResponse.json({ success: true, data: result.rows[0].state_data });
    } catch (err: any) {
        console.error('[Sync GET] Error:', err?.message || err);
        return NextResponse.json(
            { success: false, error: err?.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) {
            return NextResponse.json({ 
                success: false, 
                reason: 'No DATABASE_URL configured — cloud sync is disabled.' 
            });
        }

        const body = await req.json();
        const { userName, balance, nextGenScore, streak, stateData } = body;

        if (!userName || stateData === undefined) {
            return NextResponse.json(
                { error: 'Missing required fields: userName, stateData' },
                { status: 400 }
            );
        }

        let Client;
        try {
            // @ts-ignore
            const pg = await import('pg');
            Client = pg.default?.Client || pg.Client;
        } catch {
            return NextResponse.json({ 
                success: false, 
                reason: 'pg module not installed. Run: npm install pg' 
            });
        }

        const client = new Client({ connectionString: dbUrl });
        await client.connect();

        // Ensure the sync table exists
        await client.query(`
            CREATE TABLE IF NOT EXISTS user_sync (
                user_name VARCHAR(100) PRIMARY KEY,
                balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
                nextgen_score INTEGER NOT NULL DEFAULT 60,
                streak INTEGER NOT NULL DEFAULT 0,
                state_data JSONB NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Upsert state data
        await client.query(
            `INSERT INTO user_sync (user_name, balance, nextgen_score, streak, state_data, updated_at)
             VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
             ON CONFLICT (user_name) 
             DO UPDATE SET 
                balance = EXCLUDED.balance,
                nextgen_score = EXCLUDED.nextgen_score,
                streak = EXCLUDED.streak,
                state_data = EXCLUDED.state_data,
                updated_at = CURRENT_TIMESTAMP`,
            [
                userName,
                balance || 0,
                nextGenScore || 60,
                streak || 0,
                JSON.stringify(stateData)
            ]
        );

        await client.end();

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('[Sync POST] Error:', err?.message || err);
        return NextResponse.json(
            { success: false, error: err?.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
