"use client"

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Database, Sparkles, CheckCircle2, XCircle, RefreshCw, ArrowLeft, Terminal, AlertCircle, MessageSquare, UserCheck, Activity, BarChart3 } from 'lucide-react';
import Link from 'next/link';

interface DiagnosticResult {
    success: boolean;
    loading: boolean;
    error?: string;
    latency?: string;
    host?: string;
    tables?: string[];
    chatLogsExist?: boolean;
    userSyncExist?: boolean;
    response?: string;
}

interface ChatLog {
    id: number;
    timestamp: string;
    user_name: string;
    agent_id: string;
    message: string;
    response: string;
    function_called: string | null;
}

interface UserSync {
    user_name: string;
    balance: string;
    resilience_score: number;
    streak: number;
    updated_at: string;
}

interface UsageInfo {
    model: string;
    rpdUsed: number;
    rpdLimit: number;
    rpmUsed: number;
    rpmLimit: number;
}

export default function DiagnosticsPage() {
    const [dbResult, setDbResult] = useState<DiagnosticResult>({ success: false, loading: false });
    const [geminiResult, setGeminiResult] = useState<DiagnosticResult>({ success: false, loading: false });
    const [envCheck, setEnvCheck] = useState({
        checked: false,
        dbUrlSet: false,
        geminiKeySet: false,
        dbUrlMasked: '',
        geminiKeyMasked: ''
    });

    // Database Tables Data State
    const [chatLogs, setChatLogs] = useState<ChatLog[]>([]);
    const [userSyncs, setUserSyncs] = useState<UserSync[]>([]);
    const [loadingData, setLoadingData] = useState(false);
    const [activeTab, setActiveTab] = useState<'chat' | 'sync'>('chat');

    // Quota usage metrics
    const [usage, setUsage] = useState<UsageInfo>({
        model: 'gemini-2.5-flash',
        rpdUsed: 0,
        rpdLimit: 20,
        rpmUsed: 0,
        rpmLimit: 15
    });

    useEffect(() => {
        // Query environment check on mount
        fetch('/api/diagnostics/db')
            .then(res => res.json())
            .then(data => {
                const dbUrlSet = data.error !== 'DATABASE_URL is not set in environment variables.';
                setEnvCheck(prev => ({
                    ...prev,
                    checked: true,
                    dbUrlSet,
                    dbUrlMasked: dbUrlSet ? 'postgres://nextgenuser:****@' + (data.host || '103.40.207.195') + ':5432/nextgendb' : 'NOT SET'
                }));
            });

        fetch('/api/diagnostics/gemini')
            .then(res => res.json())
            .then(data => {
                const geminiKeySet = data.error !== 'GEMINI_API_KEY is not set in environment variables.';
                setEnvCheck(prev => ({
                    ...prev,
                    geminiKeySet,
                    geminiKeyMasked: geminiKeySet ? 'AIzaSyAdfho6MZZi...pjmo' : 'NOT SET'
                }));
            });

        fetchTableData();
    }, []);

    const fetchTableData = async () => {
        setLoadingData(true);
        try {
            const res = await fetch('/api/diagnostics/data');
            const data = await res.json();
            if (data.success) {
                setChatLogs(data.chatLogs || []);
                setUserSyncs(data.userSyncs || []);
                if (data.usage) {
                    setUsage(data.usage);
                }
            }
        } catch (e) {
            console.error('Failed to load table data:', e);
        } finally {
            setLoadingData(false);
        }
    };

    const runTests = async () => {
        // Test Database
        setDbResult(prev => ({ ...prev, loading: true, error: undefined }));
        try {
            const dbRes = await fetch('/api/diagnostics/db');
            const dbData = await dbRes.json();
            setDbResult({
                success: dbData.success,
                loading: false,
                error: dbData.error,
                latency: dbData.latency,
                host: dbData.host,
                tables: dbData.tables,
                chatLogsExist: dbData.chatLogsExist,
                userSyncExist: dbData.userSyncExist
            });
        } catch (err: any) {
            setDbResult({
                success: false,
                loading: false,
                error: err.message || 'Network request failed'
            });
        }

        // Test Gemini
        setGeminiResult(prev => ({ ...prev, loading: true, error: undefined }));
        try {
            const geminiRes = await fetch('/api/diagnostics/gemini');
            const geminiData = await geminiRes.json();
            setGeminiResult({
                success: geminiData.success,
                loading: false,
                error: geminiData.error,
                latency: geminiData.latency,
                response: geminiData.response
            });
        } catch (err: any) {
            setGeminiResult({
                success: false,
                loading: false,
                error: err.message || 'Network request failed'
            });
        }

        // Refresh database tables logs
        fetchTableData();
    };

    // Helper to calculate usage percentage
    const rpdPercent = Math.min((usage.rpdUsed / usage.rpdLimit) * 100, 100);
    const rpmPercent = Math.min((usage.rpmUsed / usage.rpmLimit) * 100, 100);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-12 relative overflow-hidden flex flex-col items-center">
            {/* Background decorative glows */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-pink-500/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 blur-[130px] rounded-full pointer-events-none" />

            <div className="w-full max-w-3xl z-10 space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-6">
                    <div className="flex items-center gap-3">
                        <Link href="/settings" className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-pink-500 via-rose-400 to-amber-300 bg-clip-text text-transparent">
                                NextGen Diagnostics
                            </h1>
                            <p className="text-xs font-semibold text-slate-400 mt-0.5">Cloud System & AI Integration Checker</p>
                        </div>
                    </div>

                    <button 
                        onClick={runTests} 
                        disabled={dbResult.loading || geminiResult.loading}
                        className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-extrabold text-xs shadow-lg shadow-pink-500/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${dbResult.loading || geminiResult.loading ? 'animate-spin' : ''}`} />
                        Run Diagnostic Tests
                    </button>
                </div>

                {/* Env status block */}
                <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-4">
                    <h2 className="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-pink-500" /> Environment Variables (.env.local)
                    </h2>

                    <div className="space-y-3 text-xs">
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/50 border border-slate-800/50">
                            <div>
                                <p className="font-extrabold text-slate-300">DATABASE_URL</p>
                                <p className="font-mono text-slate-500 text-[10px] mt-0.5 select-all">{envCheck.dbUrlMasked || 'Checking...'}</p>
                            </div>
                            {envCheck.checked && (
                                envCheck.dbUrlSet ? 
                                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[9px]">ACTIVE</span> :
                                    <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold text-[9px]">MISSING</span>
                            )}
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/50 border border-slate-800/50">
                            <div>
                                <p className="font-extrabold text-slate-300">GEMINI_API_KEY</p>
                                <p className="font-mono text-slate-500 text-[10px] mt-0.5 select-all">{envCheck.geminiKeyMasked || 'Checking...'}</p>
                            </div>
                            {envCheck.checked && (
                                envCheck.geminiKeySet ? 
                                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[9px]">ACTIVE</span> :
                                    <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold text-[9px]">MISSING</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Diagnostics tests list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Database Diagnostic Card */}
                    <div className={`p-6 rounded-[2rem] border transition-all ${
                        dbResult.loading ? 'border-slate-800 bg-slate-900/30' :
                        !envCheck.dbUrlSet ? 'border-slate-800/80 bg-slate-900/10' :
                        dbResult.error ? 'border-rose-500/30 bg-rose-500/5' :
                        dbResult.latency ? 'border-emerald-500/30 bg-emerald-500/5' :
                        'border-slate-800 bg-slate-900/40'
                    }`}>
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-2xl ${dbResult.error ? 'bg-rose-500/10 text-rose-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                    <Database className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-sm font-black text-slate-200">PostgreSQL Server</h3>
                                    <p className="text-[10px] text-slate-400 font-medium">Verifies connectivity and schemas.</p>
                                </div>
                            </div>
                            
                            <div>
                                {dbResult.loading && <RefreshCw className="w-5 h-5 text-slate-500 animate-spin" />}
                                {!dbResult.loading && dbResult.latency && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                                {!dbResult.loading && dbResult.error && <XCircle className="w-5 h-5 text-rose-500" />}
                            </div>
                        </div>

                        {/* Connection Results */}
                        {(dbResult.latency || dbResult.error) && (
                            <div className="mt-4 pt-4 border-t border-slate-800/60 space-y-3">
                                {dbResult.latency && (
                                    <div className="grid grid-cols-2 gap-3 text-[10px] font-semibold text-slate-300">
                                        <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/40">
                                            <p className="text-slate-500 font-bold text-[8px] uppercase">Latency</p>
                                            <p className="text-sm font-black text-emerald-400 mt-0.5">{dbResult.latency}</p>
                                        </div>
                                        <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/40">
                                            <p className="text-slate-500 font-bold text-[8px] uppercase">IP Host</p>
                                            <p className="text-sm font-black text-slate-200 mt-0.5 truncate">{dbResult.host}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Tables Status */}
                                {dbResult.success && (
                                    <div className="p-3 rounded-xl bg-slate-950/30 border border-slate-800/40 space-y-1.5 text-[10px]">
                                        <p className="text-slate-400 font-bold text-[8px] uppercase tracking-wider">Required Table Schemas</p>
                                        <div className="flex items-center justify-between pt-1">
                                            <span className="flex items-center gap-1 font-medium text-slate-300">
                                                <CheckCircle2 className={`w-3 h-3 ${dbResult.chatLogsExist ? 'text-emerald-400' : 'text-slate-600'}`} />
                                                chat_logs
                                            </span>
                                            {dbResult.chatLogsExist ? 
                                                <span className="text-[9px] font-bold text-emerald-400">FOUND</span> : 
                                                <span className="text-[9px] font-bold text-rose-400">MISSING</span>
                                            }
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-1 font-medium text-slate-300">
                                                <CheckCircle2 className={`w-3 h-3 ${dbResult.userSyncExist ? 'text-emerald-400' : 'text-slate-600'}`} />
                                                user_sync
                                            </span>
                                            {dbResult.userSyncExist ? 
                                                <span className="text-[9px] font-bold text-emerald-400">FOUND</span> : 
                                                <span className="text-[9px] font-bold text-rose-400">MISSING</span>
                                            }
                                        </div>
                                    </div>
                                )}

                                {dbResult.error && (
                                    <div className="p-3 rounded-xl bg-rose-950/15 border border-rose-900/30 space-y-2 text-[10px]">
                                        <div className="flex items-center gap-1 text-rose-400 font-bold">
                                            <ShieldAlert className="w-3.5 h-3.5" /> Connection Failed
                                        </div>
                                        <p className="font-mono text-rose-300/80 text-[9px] leading-relaxed bg-black/30 p-2 rounded border border-rose-950/50">
                                            {dbResult.error}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Gemini Diagnostic Card */}
                    <div className={`p-6 rounded-[2rem] border transition-all ${
                        geminiResult.loading ? 'border-slate-800 bg-slate-900/30' :
                        !envCheck.geminiKeySet ? 'border-slate-800/80 bg-slate-900/10' :
                        geminiResult.error ? 'border-rose-500/30 bg-rose-500/5' :
                        geminiResult.latency ? 'border-emerald-500/30 bg-emerald-500/5' :
                        'border-slate-800 bg-slate-900/40'
                    }`}>
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-2xl ${geminiResult.error ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-sm font-black text-slate-200">Google Gemini API</h3>
                                    <p className="text-[10px] text-slate-400 font-medium">Sends a mini test query to Gemini 2.5/3.1.</p>
                                </div>
                            </div>
                            
                            <div>
                                {geminiResult.loading && <RefreshCw className="w-5 h-5 text-slate-500 animate-spin" />}
                                {!geminiResult.loading && geminiResult.latency && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                                {!geminiResult.loading && geminiResult.error && <XCircle className="w-5 h-5 text-rose-500" />}
                            </div>
                        </div>

                        {/* Gemini Results */}
                        {(geminiResult.latency || geminiResult.error) && (
                            <div className="mt-4 pt-4 border-t border-slate-800/60 space-y-3">
                                {geminiResult.latency && (
                                    <div className="grid grid-cols-2 gap-3 text-[10px] font-semibold text-slate-300">
                                        <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/40">
                                            <p className="text-slate-500 font-bold text-[8px] uppercase">API Latency</p>
                                            <p className="text-sm font-black text-emerald-400 mt-0.5">{geminiResult.latency}</p>
                                        </div>
                                        <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/40">
                                            <p className="text-slate-500 font-bold text-[8px] uppercase">API Output</p>
                                            <p className="text-sm font-black text-slate-200 mt-0.5 font-mono">{geminiResult.response}</p>
                                        </div>
                                    </div>
                                )}

                                {geminiResult.error && (
                                    <div className="p-3 rounded-xl bg-rose-950/15 border border-rose-900/30 space-y-2 text-[10px]">
                                        <div className="flex items-center gap-1 text-rose-400 font-bold">
                                            <AlertCircle className="w-3.5 h-3.5" /> API Call Failed
                                        </div>
                                        <p className="font-mono text-rose-300/80 text-[9px] leading-relaxed bg-black/30 p-2 rounded border border-rose-950/50">
                                            {geminiResult.error}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Quota Usage Monitor Card */}
                {envCheck.dbUrlSet && (
                    <div className="p-6 rounded-[2rem] bg-slate-900/40 border border-slate-800/80 space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                            <Activity className="w-5 h-5 text-emerald-400" />
                            <h2 className="text-sm font-black text-slate-200">Real-Time API Quota Monitor</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* RPD Progress Bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-[11px] font-bold">
                                    <span className="text-slate-400">Requests Per Day (RPD)</span>
                                    <span className={usage.rpdUsed >= usage.rpdLimit ? 'text-rose-400' : 'text-emerald-400'}>
                                        {usage.rpdUsed} / {usage.rpdLimit}
                                    </span>
                                </div>
                                <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800/60 p-0.5">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-500 ${
                                            rpdPercent > 90 ? 'bg-gradient-to-r from-red-500 to-rose-500' :
                                            rpdPercent > 60 ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                                            'bg-gradient-to-r from-emerald-500 to-teal-400'
                                        }`} 
                                        style={{ width: `${rpdPercent}%` }}
                                    />
                                </div>
                                <p className="text-[9px] text-slate-500 font-medium">
                                    Active Model: <code className="text-slate-300 font-bold bg-slate-950 px-1 py-0.5 rounded">{usage.model}</code>
                                </p>
                            </div>

                            {/* RPM Progress Bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-[11px] font-bold">
                                    <span className="text-slate-400">Requests Per Minute (RPM)</span>
                                    <span className={usage.rpmUsed >= usage.rpmLimit ? 'text-rose-400 font-black animate-pulse' : 'text-emerald-400'}>
                                        {usage.rpmUsed} / {usage.rpmLimit}
                                    </span>
                                </div>
                                <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800/60 p-0.5">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-500 ${
                                            rpmPercent > 80 ? 'bg-gradient-to-r from-amber-400 to-red-500' :
                                            'bg-gradient-to-r from-emerald-500 to-teal-400'
                                        }`} 
                                        style={{ width: `${rpmPercent}%` }}
                                    />
                                </div>
                                <p className="text-[9px] text-slate-500 font-medium">
                                    Automatically resets every minute.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Database Table Row Viewer */}
                <div className="p-6 rounded-[2rem] bg-slate-900/40 border border-slate-800/80 space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                        <div className="flex items-center gap-2">
                            <Database className="w-5 h-5 text-pink-500" />
                            <h2 className="text-base font-black text-slate-200">Database Tables Viewer</h2>
                        </div>
                        <button 
                            onClick={fetchTableData}
                            disabled={loadingData}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Refresh Data"
                        >
                            <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    {/* Tab Selectors */}
                    <div className="flex gap-2 p-1 rounded-2xl bg-slate-950/60 border border-slate-800/50 w-fit">
                        <button
                            onClick={() => setActiveTab('chat')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'chat' ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            <MessageSquare className="w-3.5 h-3.5" />
                            chat_logs ({chatLogs.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('sync')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'sync' ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            <UserCheck className="w-3.5 h-3.5" />
                            user_sync ({userSyncs.length})
                        </button>
                    </div>

                    {/* Table View */}
                    <div className="overflow-x-auto w-full border border-slate-800/80 rounded-2xl bg-slate-950/40 max-h-[300px] overflow-y-auto custom-scrollbar">
                        {loadingData ? (
                            <div className="p-12 text-center text-xs text-slate-500 font-bold flex items-center justify-center gap-2">
                                <RefreshCw className="w-4 h-4 animate-spin text-pink-500" />
                                Querying PostgreSQL VM Database...
                            </div>
                        ) : activeTab === 'chat' ? (
                            chatLogs.length === 0 ? (
                                <div className="p-12 text-center text-xs text-slate-500 font-medium">
                                    No records found in table <code className="text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">chat_logs</code>.<br />
                                    Send a message to the AI coach to register a record.
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse text-[10px]">
                                    <thead>
                                        <tr className="border-b border-slate-800 bg-slate-900/60 font-bold text-slate-400 uppercase tracking-wider">
                                            <th className="p-3 font-semibold">Time</th>
                                            <th className="p-3 font-semibold">User</th>
                                            <th className="p-3 font-semibold">Agent</th>
                                            <th className="p-3 font-semibold">Message</th>
                                            <th className="p-3 font-semibold">Response</th>
                                            <th className="p-3 font-semibold">Function</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/50">
                                        {chatLogs.map((log) => (
                                            <tr key={log.id} className="hover:bg-slate-900/30 transition-colors">
                                                <td className="p-3 text-slate-400 font-mono select-none">
                                                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                </td>
                                                <td className="p-3 font-bold text-slate-300">{log.user_name}</td>
                                                <td className="p-3 select-none">
                                                    <span className={`px-2 py-0.5 rounded-full font-bold text-[8px] border ${
                                                        log.agent_id === 'finance' ? 'bg-[#CC0D5A]/10 text-[#CC0D5A] border-[#CC0D5A]/20' :
                                                        log.agent_id === 'save' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                        log.agent_id === 'invest' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                        'bg-slate-500/10 text-slate-400 border-slate-800'
                                                    }`}>
                                                        {log.agent_id}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-slate-300 max-w-[120px] truncate" title={log.message}>{log.message}</td>
                                                <td className="p-3 text-slate-400 max-w-[150px] truncate" title={log.response}>{log.response}</td>
                                                <td className="p-3 font-mono text-slate-500">{log.function_called || 'none'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )
                        ) : (
                            userSyncs.length === 0 ? (
                                <div className="p-12 text-center text-xs text-slate-500 font-medium">
                                    No records found in table <code className="text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">user_sync</code>.<br />
                                    The state will sync when database transactions occur.
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse text-[10px]">
                                    <thead>
                                        <tr className="border-b border-slate-800 bg-slate-900/60 font-bold text-slate-400 uppercase tracking-wider">
                                            <th className="p-3 font-semibold">User</th>
                                            <th className="p-3 font-semibold">Wallet Balance</th>
                                            <th className="p-3 font-semibold">Resilience Score</th>
                                            <th className="p-3 font-semibold">Streak Count</th>
                                            <th className="p-3 font-semibold">Last Sync</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/50">
                                        {userSyncs.map((sync) => (
                                            <tr key={sync.user_name} className="hover:bg-slate-900/30 transition-colors">
                                                <td className="p-3 font-bold text-slate-300">{sync.user_name}</td>
                                                <td className="p-3 font-bold text-emerald-400 font-mono">RM {parseFloat(sync.balance).toFixed(2)}</td>
                                                <td className="p-3 font-bold text-indigo-400">{sync.resilience_score}%</td>
                                                <td className="p-3 font-bold text-amber-500">{sync.streak} days</td>
                                                <td className="p-3 text-slate-400 font-mono">
                                                    {new Date(sync.updated_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )
                        )}
                    </div>
                </div>

                {/* Back button */}
                <div className="flex justify-center pt-4">
                    <Link href="/settings" className="text-xs text-slate-400 hover:text-slate-200 font-bold flex items-center gap-1.5 transition-colors border border-slate-800 rounded-full px-5 py-2.5 bg-slate-900/40 hover:bg-slate-900">
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to Application Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
