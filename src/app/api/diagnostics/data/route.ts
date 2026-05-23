import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
        return NextResponse.json({
            success: false,
            error: 'DATABASE_URL is not set.'
        });
    }

    try {
        // @ts-ignore
        const pg = await import('pg');
        const Client = pg.default?.Client || pg.Client;
        const client = new Client({ connectionString: dbUrl });

        await client.connect();

        // Query last 10 chat logs
        const chatLogsRes = await client.query(`
            SELECT id, timestamp, user_name, agent_id, message, response, function_called 
            FROM chat_logs 
            ORDER BY timestamp DESC 
            LIMIT 10;
        `);

        // Query last 10 user syncs
        const userSyncRes = await client.query(`
            SELECT user_name, balance, resilience_score, streak, updated_at 
            FROM user_sync 
            ORDER BY updated_at DESC 
            LIMIT 10;
        `);

        await client.end();

        return NextResponse.json({
            success: true,
            chatLogs: chatLogsRes.rows,
            userSyncs: userSyncRes.rows
        });
    } catch (err: any) {
        return NextResponse.json({
            success: false,
            error: err.message || 'Failed to query tables.'
        });
    }
}
