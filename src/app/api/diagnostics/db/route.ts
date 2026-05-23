import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
        return NextResponse.json({
            success: false,
            error: 'DATABASE_URL is not set in environment variables.'
        });
    }

    let host = 'unknown';
    try {
        // Safely extract hostname/IP from DATABASE_URL
        const matches = dbUrl.match(/@([^/:]+)/);
        if (matches && matches[1]) {
            host = matches[1];
        }
    } catch (e) {}

    const startTime = Date.now();
    try {
        // Dynamic import so it doesn't fail at build time
        // @ts-ignore
        const pg = await import('pg');
        const Client = pg.default?.Client || pg.Client;
        const client = new Client({ connectionString: dbUrl });
        
        await client.connect();
        
        // Test basic query
        const testResult = await client.query('SELECT NOW();');
        
        // Test table existence
        const tablesResult = await client.query(`
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public' AND tablename IN ('chat_logs', 'user_sync');
        `);
        
        const tables = tablesResult.rows.map((r: any) => r.tablename);
        
        await client.end();
        
        const latency = Date.now() - startTime;
        
        return NextResponse.json({
            success: true,
            host,
            latency: `${latency}ms`,
            tables,
            chatLogsExist: tables.includes('chat_logs'),
            userSyncExist: tables.includes('user_sync')
        });
    } catch (err: any) {
        return NextResponse.json({
            success: false,
            host,
            error: err.message || 'Failed to connect to the database.'
        });
    }
}
