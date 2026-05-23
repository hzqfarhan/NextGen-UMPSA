"use client"

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Database, Sparkles, CheckCircle2, XCircle, RefreshCw, ArrowLeft, Terminal, AlertCircle } from 'lucide-react';
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
    }, []);

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
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 md:p-12 relative overflow-hidden flex flex-col items-center">
            {/* Background decorative glows */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-pink-500/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 blur-[130px] rounded-full pointer-events-none" />

            <div className="w-full max-w-2xl z-10 space-y-8">
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
                <div className="space-y-6">
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
                                    <Database className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-base font-black text-slate-200">NovaCloud PostgreSQL Server</h3>
                                    <p className="text-xs text-slate-400 font-medium">Verifies connectivity, ping speed, schema, and write capabilities.</p>
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
                            <div className="mt-5 pt-5 border-t border-slate-800/80 space-y-4">
                                {dbResult.latency && (
                                    <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-300">
                                        <div className="p-3 rounded-2xl bg-slate-950/40 border border-slate-800/40">
                                            <p className="text-slate-500 font-bold text-[9px] uppercase tracking-wider">Connection Latency</p>
                                            <p className="text-base font-black text-emerald-400 mt-1">{dbResult.latency}</p>
                                        </div>
                                        <div className="p-3 rounded-2xl bg-slate-950/40 border border-slate-800/40">
                                            <p className="text-slate-500 font-bold text-[9px] uppercase tracking-wider">Host VM IP</p>
                                            <p className="text-base font-black text-slate-200 mt-1 truncate">{dbResult.host}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Tables Status */}
                                {dbResult.success && (
                                    <div className="p-4 rounded-2xl bg-slate-950/30 border border-slate-800/40 space-y-2 text-xs">
                                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Required Table Schemas</p>
                                        <div className="flex items-center justify-between pt-1">
                                            <span className="flex items-center gap-1.5 font-medium text-slate-300">
                                                <CheckCircle2 className={`w-3.5 h-3.5 ${dbResult.chatLogsExist ? 'text-emerald-400' : 'text-slate-600'}`} />
                                                chat_logs <span className="text-[10px] text-slate-500">(audits chat logs)</span>
                                            </span>
                                            {dbResult.chatLogsExist ? 
                                                <span className="text-[10px] font-bold text-emerald-400">FOUND</span> : 
                                                <span className="text-[10px] font-bold text-rose-400">MISSING</span>
                                            }
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-1.5 font-medium text-slate-300">
                                                <CheckCircle2 className={`w-3.5 h-3.5 ${dbResult.userSyncExist ? 'text-emerald-400' : 'text-slate-600'}`} />
                                                user_sync <span className="text-[10px] text-slate-500">(saves user Zustand state)</span>
                                            </span>
                                            {dbResult.userSyncExist ? 
                                                <span className="text-[10px] font-bold text-emerald-400">FOUND</span> : 
                                                <span className="text-[10px] font-bold text-rose-400">MISSING</span>
                                            }
                                        </div>
                                    </div>
                                )}

                                {dbResult.error && (
                                    <div className="p-4 rounded-2xl bg-rose-950/15 border border-rose-900/30 space-y-2 text-xs">
                                        <div className="flex items-center gap-2 text-rose-400 font-bold">
                                            <ShieldAlert className="w-4 h-4 shrink-0" /> Connection Failed
                                        </div>
                                        <p className="font-mono text-rose-300/80 text-[10px] leading-relaxed bg-black/30 p-2.5 rounded-lg select-all border border-rose-950/50">
                                            {dbResult.error}
                                        </p>

                                        {/* Suggestions based on error message */}
                                        <div className="text-[10px] text-rose-400/90 leading-relaxed font-semibold pt-1">
                                            <p className="font-bold text-rose-400">Possible Fixes:</p>
                                            <ul className="list-disc pl-4 mt-1 space-y-1">
                                                <li>Double check that the IP address <strong>{dbResult.host}</strong> is online and correct.</li>
                                                <li>Confirm you allowed port <strong>5432</strong> in your NovaCloud Security Group Rules.</li>
                                                <li>Check if PostgreSQL service is running on the VM: <code>sudo systemctl status postgresql</code>.</li>
                                                <li>Make sure <code>listen_addresses = '*'</code> was successfully added to <code>postgresql.conf</code> and the database was restarted.</li>
                                            </ul>
                                        </div>
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
                                    <Sparkles className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-base font-black text-slate-200">Google Gemini API Connection</h3>
                                    <p className="text-xs text-slate-400 font-medium">Sends a mini test query to Gemini 2.5 Flash and measures response latency.</p>
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
                            <div className="mt-5 pt-5 border-t border-slate-800/80 space-y-4">
                                {geminiResult.latency && (
                                    <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-300">
                                        <div className="p-3 rounded-2xl bg-slate-950/40 border border-slate-800/40">
                                            <p className="text-slate-500 font-bold text-[9px] uppercase tracking-wider">API Response Time</p>
                                            <p className="text-base font-black text-emerald-400 mt-1">{geminiResult.latency}</p>
                                        </div>
                                        <div className="p-3 rounded-2xl bg-slate-950/40 border border-slate-800/40">
                                            <p className="text-slate-500 font-bold text-[9px] uppercase tracking-wider">Test Reply Result</p>
                                            <p className="text-base font-black text-slate-200 mt-1 font-mono">{geminiResult.response}</p>
                                        </div>
                                    </div>
                                )}

                                {geminiResult.error && (
                                    <div className="p-4 rounded-2xl bg-rose-950/15 border border-rose-900/30 space-y-2 text-xs">
                                        <div className="flex items-center gap-2 text-rose-400 font-bold">
                                            <AlertCircle className="w-4 h-4 shrink-0" /> API Call Failed
                                        </div>
                                        <p className="font-mono text-rose-300/80 text-[10px] leading-relaxed bg-black/30 p-2.5 rounded-lg select-all border border-rose-950/50">
                                            {geminiResult.error}
                                        </p>
                                        <div className="text-[10px] text-rose-400/90 leading-relaxed font-semibold pt-1">
                                            <p className="font-bold text-rose-400">Possible Fixes:</p>
                                            <ul className="list-disc pl-4 mt-1 space-y-1">
                                                <li>Check if your API Key in <code>.env.local</code> is copied exactly. It should start with <code>AIzaSy...</code></li>
                                                <li>Ensure your computer has working internet connection.</li>
                                                <li>Check if the Gemini model quota has been exceeded or if the API key is disabled in the AI Studio Console.</li>
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
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
