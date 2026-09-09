/**
 * Mahasetu Supabase & Architecture Hub
 * Explains credentials required, provides ready-to-run PostgreSQL/Supabase schema,
 * and allows instant one-click synchronization of all live platform records to Supabase tables.
 */

import React, { useState, useEffect } from 'react';
import {
  Database,
  Key,
  ShieldCheck,
  Copy,
  Check,
  ExternalLink,
  Download,
  Server,
  Terminal,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  Layers,
  FileCheck2,
  FileText,
  Users,
  Activity
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../locales.ts';

interface Props {
  language: Language;
}

export const SupabaseHub: React.FC<Props> = ({ language }) => {
  const t = TRANSLATIONS[language];
  const [copiedSql, setCopiedSql] = useState(false);
  const [sqlSchema, setSqlSchema] = useState('');
  const [loadingSql, setLoadingSql] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [syncingData, setSyncingData] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
    counts?: {
      departments?: number;
      services?: number;
      users?: number;
      consents?: number;
      dataRequests?: number;
      applications?: number;
      auditLogs?: number;
    };
  } | null>(null);

  const [connectionStatus, setConnectionStatus] = useState<{
    connected?: boolean;
    configured?: boolean;
    url?: string | null;
    hasAnonKey?: boolean;
    hasServiceKey?: boolean;
    lastTestedAt?: string | null;
    error?: string;
  }>({
    connected: false,
    configured: false
  });

  const checkStatus = async () => {
    try {
      const res = await fetch('/api/supabase/status');
      const data = await res.json();
      setConnectionStatus(data);
    } catch (e) {
      console.error('Status error', e);
    }
  };

  const handleTestConnection = async () => {
    try {
      setTestingConnection(true);
      const res = await fetch('/api/supabase/test-connection', { method: 'POST' });
      const data = await res.json();
      setConnectionStatus(data);
    } catch (e: any) {
      setConnectionStatus({
        connected: false,
        configured: true,
        error: e?.message || 'Connection failed'
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSyncAllData = async () => {
    try {
      setSyncingData(true);
      setSyncResult(null);
      const res = await fetch('/api/supabase/sync-now', { method: 'POST' });
      const data = await res.json();
      setSyncResult(data);
      checkStatus();
    } catch (e: any) {
      setSyncResult({
        success: false,
        error: e?.message || 'Failed to sync data to Supabase'
      });
    } finally {
      setSyncingData(false);
    }
  };

  const fetchSqlSchema = async () => {
    try {
      setLoadingSql(true);
      const res = await fetch('/api/supabase/export-sql');
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        setSqlSchema(data.sql || '');
      } else {
        const text = await res.text();
        setSqlSchema(text);
      }
    } catch (e) {
      console.error('SQL export error', e);
    } finally {
      setLoadingSql(false);
    }
  };

  useEffect(() => {
    fetchSqlSchema();
    checkStatus();
  }, []);

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white/75 backdrop-blur-xl border border-black/8 rounded-3xl p-6 sm:p-7 shadow-[0_18px_44px_-26px_rgba(0,0,0,0.10)] relative overflow-hidden">
        <div className="flex items-start gap-4 relative z-10">
          <div className="w-13 h-13 rounded-2xl bg-black/5 border border-black/10 text-[#141414] flex items-center justify-center font-bold text-xl shrink-0 shadow-xs">
            <Database className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5c5c5c] bg-black/5 border border-black/5 px-2.5 py-0.5 rounded-full">
                Database & Cloud Deployment Hub
              </span>
              <span className="text-xs text-[#5c5c5c] font-medium">
                Live PostgreSQL Synchronizer
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#111111] mt-1.5">
              Supabase PostgreSQL Integration
            </h2>
            <p className="text-xs text-[#5c5c5c] max-w-3xl mt-1 leading-relaxed">
              Mahasetu synchronizes all citizen scheme applications, verified cross-departmental proofs, consent records, and SHA-256 tamper-evident audit logs directly into your live Supabase PostgreSQL tables.
            </p>
          </div>
        </div>

        {/* Live Diagnostics & Action Card */}
        <div className="mt-6 pt-5 border-t border-black/8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-black/[0.02] p-4 sm:p-5 rounded-2xl border border-black/5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                Supabase Connection:
              </span>
              {connectionStatus.connected ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Connected & Ready for Live Sync</span>
                </span>
              ) : connectionStatus.configured ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  <span>Credentials Configured (Pinging...)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  <span>Sovereign Local Sandbox Active (In-Memory)</span>
                </span>
              )}
            </div>

            <p className="text-xs text-[#5c5c5c]">
              {connectionStatus.connected
                ? `PostgreSQL Cluster: ${connectionStatus.url} • Tables active & live sync enabled.`
                : connectionStatus.error
                ? connectionStatus.error
                : 'Local mode active: Operating with high performance in-memory database.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full lg:w-auto">
            <button
              id="btn-sync-supabase-now"
              type="button"
              onClick={handleSyncAllData}
              disabled={syncingData}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingData ? 'animate-spin' : ''}`} />
              <span>{syncingData ? 'Syncing to Supabase...' : 'Push / Sync All Data to Supabase'}</span>
            </button>

            <button
              id="btn-test-supabase-conn"
              type="button"
              onClick={handleTestConnection}
              disabled={testingConnection}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-[#141414] hover:bg-black text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {testingConnection ? (
                <span>Checking Connection...</span>
              ) : (
                <>
                  <Server className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Test Connection</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sync Result Banner */}
        {syncResult && (
          <div className={`mt-4 p-4 rounded-2xl border text-xs space-y-2 animate-fadeIn ${
            syncResult.success
              ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
              : 'bg-rose-50/90 border-rose-300 text-rose-950'
          }`}>
            <div className="flex items-center gap-2 font-bold text-sm">
              {syncResult.success ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Sync Complete</span>
                </>
              ) : (
                <span>Sync Notice</span>
              )}
            </div>
            <p>{syncResult.message || syncResult.error}</p>
            {syncResult.counts && (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-2 border-t border-emerald-200/60 font-mono text-[11px]">
                <div className="bg-white/80 p-2 rounded-xl border border-emerald-200">
                  <span className="text-[10px] text-gray-500 block uppercase font-sans">Depts</span>
                  <span className="font-bold text-emerald-800">{syncResult.counts.departments}</span>
                </div>
                <div className="bg-white/80 p-2 rounded-xl border border-emerald-200">
                  <span className="text-[10px] text-gray-500 block uppercase font-sans">Services</span>
                  <span className="font-bold text-emerald-800">{syncResult.counts.services}</span>
                </div>
                <div className="bg-white/80 p-2 rounded-xl border border-emerald-200">
                  <span className="text-[10px] text-gray-500 block uppercase font-sans">Users</span>
                  <span className="font-bold text-emerald-800">{syncResult.counts.users}</span>
                </div>
                <div className="bg-white/80 p-2 rounded-xl border border-emerald-200">
                  <span className="text-[10px] text-gray-500 block uppercase font-sans">Schemes / Apps</span>
                  <span className="font-bold text-emerald-800">{syncResult.counts.applications}</span>
                </div>
                <div className="bg-white/80 p-2 rounded-xl border border-emerald-200">
                  <span className="text-[10px] text-gray-500 block uppercase font-sans">Consents</span>
                  <span className="font-bold text-emerald-800">{syncResult.counts.consents}</span>
                </div>
                <div className="bg-white/80 p-2 rounded-xl border border-emerald-200">
                  <span className="text-[10px] text-gray-500 block uppercase font-sans">Data Reqs</span>
                  <span className="font-bold text-emerald-800">{syncResult.counts.dataRequests}</span>
                </div>
                <div className="bg-white/80 p-2 rounded-xl border border-emerald-200">
                  <span className="text-[10px] text-gray-500 block uppercase font-sans">Audit Logs</span>
                  <span className="font-bold text-emerald-800">{syncResult.counts.auditLogs}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Supabase PostgreSQL Tables Structure */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-xl border border-black/8 rounded-2xl p-4 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-[#111111] font-semibold text-xs">
            <FileText className="w-4 h-4 text-emerald-700" />
            <span>applications table</span>
          </div>
          <p className="text-[11px] text-[#5c5c5c] leading-relaxed">
            Stores every citizen scheme submission (Namo Shetkari, Ladki Bahin, DBT) with JSONB form data, status (SUBMITTED, APPROVED), and tracking notes.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-black/8 rounded-2xl p-4 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-[#111111] font-semibold text-xs">
            <ShieldCheck className="w-4 h-4 text-sky-700" />
            <span>consent_records table</span>
          </div>
          <p className="text-[11px] text-[#5c5c5c] leading-relaxed">
            Stores purpose-bound, time-delimited citizen consent tokens permitting data exchange between Revenue, District Admin, and RTO.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-black/8 rounded-2xl p-4 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-[#111111] font-semibold text-xs">
            <Activity className="w-4 h-4 text-purple-700" />
            <span>audit_logs table</span>
          </div>
          <p className="text-[11px] text-[#5c5c5c] leading-relaxed">
            Append-only, cryptographically linked SHA-256 block ledger recording all citizen logins, data requests, and officer approvals.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-black/8 rounded-2xl p-4 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-[#111111] font-semibold text-xs">
            <Users className="w-4 h-4 text-amber-700" />
            <span>users & departments</span>
          </div>
          <p className="text-[11px] text-[#5c5c5c] leading-relaxed">
            Stores registered Maharashtra citizens, department officers, and participating ministerial adapter nodes with endpoints.
          </p>
        </div>
      </div>

      {/* Required Credentials Matrix */}
      <div className="bg-white/80 backdrop-blur-xl border border-black/8 rounded-3xl p-6 sm:p-7 shadow-[0_18px_44px_-26px_rgba(0,0,0,0.10)]">
        <h3 className="text-xl font-bold text-[#111111] mb-1">
          Configured Environment Variables
        </h3>
        <p className="text-xs text-[#5c5c5c] mb-5">
          All configuration parameters supported by Mahasetu in <code className="text-[#141414] bg-black/5 px-1 py-0.5 rounded">.env</code> or AI Studio Secrets
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-black/8 rounded-2xl overflow-hidden">
            <thead className="bg-black/5 border-b border-black/8 text-[#111111] font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Variable Name</th>
                <th className="p-4">Status</th>
                <th className="p-4">Purpose / Integration</th>
                <th className="p-4">Source in Supabase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/8 font-mono text-[11px]">
              <tr className="bg-white hover:bg-black/5 transition-all">
                <td className="p-4 font-bold text-[#111111]">SUPABASE_URL</td>
                <td className="p-4 font-semibold text-emerald-800">
                  {connectionStatus.url ? 'Connected' : 'Configured'}
                </td>
                <td className="p-4 font-sans text-[#333333] text-xs">
                  HTTPS endpoint of your Supabase PostgreSQL cluster.
                </td>
                <td className="p-4 font-sans text-[#5c5c5c] text-xs">
                  <span className="inline-flex items-center gap-1">
                    <span>Supabase Project Settings</span>
                    <ChevronRight className="w-3 h-3 text-[#5c5c5c]" />
                    <span>API</span>
                  </span>
                </td>
              </tr>
              <tr className="bg-white hover:bg-black/5 transition-all">
                <td className="p-4 font-bold text-[#111111]">SUPABASE_ANON_KEY</td>
                <td className="p-4 font-semibold text-emerald-800">
                  {connectionStatus.hasAnonKey ? 'Active' : 'Unset'}
                </td>
                <td className="p-4 font-sans text-[#333333] text-xs">
                  Public anonymous API key for executing queries under Row Level Security.
                </td>
                <td className="p-4 font-sans text-[#5c5c5c] text-xs">
                  <span className="inline-flex items-center gap-1">
                    <span>Supabase Project Settings</span>
                    <ChevronRight className="w-3 h-3 text-[#5c5c5c]" />
                    <span>API (anon public)</span>
                  </span>
                </td>
              </tr>
              <tr className="bg-white hover:bg-black/5 transition-all">
                <td className="p-4 font-bold text-[#111111]">SUPABASE_SERVICE_ROLE_KEY</td>
                <td className="p-4 font-semibold text-emerald-800">
                  {connectionStatus.hasServiceKey ? 'Active' : 'Optional'}
                </td>
                <td className="p-4 font-sans text-[#333333] text-xs">
                  Backend secret service key for direct administrative table upserts.
                </td>
                <td className="p-4 font-sans text-[#5c5c5c] text-xs">
                  <span className="inline-flex items-center gap-1">
                    <span>Supabase Project Settings</span>
                    <ChevronRight className="w-3 h-3 text-[#5c5c5c]" />
                    <span>API (service_role secret)</span>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Ready-to-Run PostgreSQL / Supabase Schema Exporter */}
      <div className="bg-white/80 backdrop-blur-xl border border-black/8 rounded-3xl p-6 sm:p-7 shadow-[0_18px_44px_-26px_rgba(0,0,0,0.10)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-xl font-bold text-[#111111]">
              Complete Supabase PostgreSQL DDL Schema
            </h3>
            <p className="text-xs text-[#5c5c5c] mt-0.5">
              Includes 8 core tables, foreign keys, SHA-256 hash constraints, and Row Level Security (RLS) policies
            </p>
          </div>

          <button
            id="btn-copy-supabase-sql"
            type="button"
            onClick={handleCopySql}
            className="px-5 py-2.5 bg-[#141414] text-white hover:bg-black font-semibold uppercase tracking-wider rounded-xl text-xs shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto"
          >
            {copiedSql ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy SQL for Supabase</span>
              </>
            )}
          </button>
        </div>

        <div className="relative">
          <pre className="bg-[#fcfdfc] text-[#111111] p-5 rounded-2xl font-mono text-xs overflow-x-auto max-h-96 border border-black/10 shadow-xs">
            {sqlSchema || 'Loading SQL schema...'}
          </pre>
        </div>
      </div>
    </div>
  );
};
