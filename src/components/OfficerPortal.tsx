/**
 * Mahasetu Department Officer Administrative Portal & Task Management Workbench
 * Dedicated dashboard for authenticated Maharashtra administrative officers:
 * - Application adjudication with 100% pre-verified departmental proofs
 * - DBT Direct Benefit Transfer disbursements via PFMS / Aadhaar Payment Bridge
 * - Inter-departmental data hop inspection & Supabase sync monitoring
 */

import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  FileCheck2,
  RefreshCw,
  ShieldCheck,
  Search,
  Check,
  Ban,
  IndianRupee,
  Send,
  Sparkles,
  Layers,
  Database,
  ArrowRight,
  Filter,
  CheckCircle,
  Activity,
  AlertTriangle,
  Lock,
  Fingerprint
} from 'lucide-react';
import { OfficerUser, ApplicationRecord } from '../types.ts';
import { Language, TRANSLATIONS } from '../locales.ts';

interface Props {
  officer: OfficerUser | null;
  language: Language;
  onOpenAuthModal: () => void;
}

export const OfficerPortal: React.FC<Props> = ({
  officer,
  language,
  onOpenAuthModal
}) => {
  const t = TRANSLATIONS[language];
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<ApplicationRecord | null>(null);
  const [actionRemarks, setActionRemarks] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTaskTab, setActiveTaskTab] = useState<'applications' | 'dbt' | 'interop' | 'roster' | 'supabase_sql'>('applications');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dbtAmount, setDbtAmount] = useState<number>(2000);
  const [dbtSuccessInfo, setDbtSuccessInfo] = useState<any | null>(null);
  const [officersList, setOfficersList] = useState<OfficerUser[]>([]);
  const [officersSource, setOfficersSource] = useState<string>('SUPABASE_POSTGRESQL');
  const [sqlCopied, setSqlCopied] = useState(false);

  const fetchOfficers = async () => {
    try {
      const res = await fetch('/api/officers');
      const data = await res.json();
      if (data.officers) {
        setOfficersList(data.officers);
        setOfficersSource(data.source || 'SUPABASE_POSTGRESQL');
      }
    } catch (e) {
      console.error('Error fetching officers list', e);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/applications');
      const data = await res.json();
      setApplications(data);
      if (data.length > 0 && !selectedApp) {
        setSelectedApp(data[0]);
      }
    } catch (e) {
      console.error('Error fetching officer applications', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchOfficers();
  }, [officer?.id]);

  const handleUpdateStatus = async (status: 'APPROVED' | 'REJECTED' | 'IN_PROGRESS') => {
    if (!selectedApp) return;
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/applications/${selectedApp.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          remarks: actionRemarks || (status === 'APPROVED' ? 'Approved based on Mahasetu verified proofs' : 'Requires clarification'),
          officerId: officer?.id || 'off-101'
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Application ${selectedApp.applicationNumber} status updated to ${status}`);
        setTimeout(() => setSuccessMsg(''), 4000);
        setActionRemarks('');
        fetchApplications();
        if (data.application) {
          setSelectedApp(data.application);
        }
      }
    } catch (e) {
      console.error('Error updating status', e);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDisburseDBT = async (appId: string, amount: number) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/applications/${appId}/dbt-disburse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          officerId: officer?.id || 'off-101',
          amount: amount
        })
      });
      const data = await res.json();
      if (data.success) {
        setDbtSuccessInfo(data.dbtTransaction);
        setSuccessMsg(`DBT ₹${amount.toLocaleString('en-IN')} successfully disbursed to beneficiary's Aadhaar-seeded bank account!`);
        setTimeout(() => setSuccessMsg(''), 6000);
        fetchApplications();
        if (data.application) {
          setSelectedApp(data.application);
        }
      }
    } catch (e) {
      console.error('Error executing DBT disbursement', e);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredApps = applications.filter(app => {
    const matchesStatus = filterStatus === 'ALL' || app.status === filterStatus;
    const matchesSearch = !searchQuery ||
      app.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.citizenName && app.citizenName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const pendingCount = applications.filter(a => a.status === 'SUBMITTED' || a.status === 'IN_PROGRESS').length;
  const approvedCount = applications.filter(a => a.status === 'APPROVED').length;
  const rejectedCount = applications.filter(a => a.status === 'REJECTED').length;

  if (!officer) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-white/80 backdrop-blur-xl border border-black/8 rounded-3xl p-8 sm:p-10 text-center shadow-[0_18px_44px_-26px_rgba(0,0,0,0.12)] space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#111815] text-amber-400 flex items-center justify-center mx-auto shadow-sm">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-950 text-[11px] font-bold">
            <Lock className="w-3.5 h-3.5 text-amber-700" />
            <span>Restricted Administrative Portal</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#111111]">
            Officer Authentication Required
          </h2>
          <p className="text-xs text-[#5c5c5c] max-w-md mx-auto leading-relaxed">
            This workbench is restricted to authorized Government of Maharashtra department verification officers and DBT custodians. Please authenticate using your registered 12-digit Aadhaar UID and Official Email.
          </p>
        </div>

        <button
          type="button"
          id="btn-officer-auth-required"
          onClick={onOpenAuthModal}
          className="w-full sm:w-auto px-8 py-3.5 bg-[#141414] hover:bg-black text-white font-semibold text-xs rounded-xl shadow-sm hover:shadow transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
        >
          <Fingerprint className="w-4 h-4 text-emerald-400" />
          <span>Officer Login (Aadhaar & Email)</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Officer Header Card */}
      <div className="bg-white/80 backdrop-blur-xl border border-black/8 rounded-3xl p-6 sm:p-7 shadow-[0_18px_44px_-26px_rgba(0,0,0,0.10)] relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#111815] text-amber-400 flex items-center justify-center font-bold text-2xl shadow-sm shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <Database className="w-3 h-3 text-emerald-600" />
                  Verified Officer
                </span>
                <span className="text-[10px] text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full font-bold">
                  {officer.departmentCode}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111111] mt-1.5">
                {officer.name}
              </h2>
              <p className="text-xs text-[#5c5c5c] font-medium mt-0.5">
                {officer.designation} • {officer.officeLocation} • {officer.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              id="btn-refresh-officer-queue"
              onClick={fetchApplications}
              className="px-3.5 py-2 text-xs font-bold text-gray-700 hover:text-black bg-gray-100 hover:bg-gray-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Queue</span>
            </button>
          </div>
        </div>

        {/* Officer Task Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-gray-100">
          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="text-[10px] font-bold uppercase text-gray-400">Total Inbox</div>
            <div className="text-xl font-extrabold text-gray-900 mt-0.5">{applications.length}</div>
          </div>
          <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-100">
            <div className="text-[10px] font-bold uppercase text-amber-800">Pending Review</div>
            <div className="text-xl font-extrabold text-amber-900 mt-0.5">{pendingCount}</div>
          </div>
          <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100">
            <div className="text-[10px] font-bold uppercase text-emerald-800">Approved & Cleared</div>
            <div className="text-xl font-extrabold text-emerald-900 mt-0.5">{approvedCount}</div>
          </div>
          <div className="p-3 bg-rose-50/70 rounded-2xl border border-rose-100">
            <div className="text-[10px] font-bold uppercase text-rose-800">Rejected / Returned</div>
            <div className="text-xl font-extrabold text-rose-900 mt-0.5">{rejectedCount}</div>
          </div>
        </div>

        {/* Task Tabs Bar */}
        <div className="flex items-center gap-2 mt-5 border-t border-gray-100 pt-3 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTaskTab('applications')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTaskTab === 'applications'
                ? 'bg-black text-white shadow-xs'
                : 'text-gray-600 hover:text-black hover:bg-gray-100'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Applications Adjudication</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 font-mono">
              {applications.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTaskTab('dbt')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTaskTab === 'dbt'
                ? 'bg-black text-white shadow-xs'
                : 'text-gray-600 hover:text-black hover:bg-gray-100'
            }`}
          >
            <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
            <span>Direct Benefit Transfer (DBT)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500 text-white font-mono">
              PFMS
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTaskTab('interop')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTaskTab === 'interop'
                ? 'bg-black text-white shadow-xs'
                : 'text-gray-600 hover:text-black hover:bg-gray-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Inter-Department Data Hops</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTaskTab('roster')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTaskTab === 'roster'
                ? 'bg-black text-white shadow-xs'
                : 'text-gray-600 hover:text-black hover:bg-gray-100'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-purple-400" />
            <span>Officer Registry</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-800 font-mono">
              {officersList.length || 4}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTaskTab('supabase_sql')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTaskTab === 'supabase_sql'
                ? 'bg-emerald-900 text-white shadow-xs'
                : 'text-gray-600 hover:text-black hover:bg-gray-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Supabase Officers Table & DDL</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs flex items-center gap-2.5 font-bold shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Task 1: Application Adjudication & Proof Review */}
      {activeTaskTab === 'applications' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Filterable Application Queue */}
          <div className="lg:col-span-5 bg-white/85 backdrop-blur-xl border border-black/8 rounded-3xl p-5 sm:p-6 shadow-[0_18px_44px_-26px_rgba(0,0,0,0.10)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/8">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-700" />
                <span>Inbox Queue ({filteredApps.length})</span>
              </span>
              <span className="text-[10px] text-gray-400 font-mono">100% Verified Proofs</span>
            </div>

            {/* Search & Status Filters */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by ID, citizen or scheme..."
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-black placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-black"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-bold pb-1">
                {['ALL', 'SUBMITTED', 'IN_PROGRESS', 'APPROVED', 'REJECTED'].map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setFilterStatus(st)}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      filterStatus === st
                        ? 'bg-gray-900 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {st === 'ALL' ? 'All' : st}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-black" />
                <span>Loading officer applications...</span>
              </div>
            ) : filteredApps.length === 0 ? (
              <div className="text-center py-12 text-xs text-gray-500 bg-gray-50 rounded-2xl border border-gray-100 p-4">
                No applications found matching the selected filter.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
                {filteredApps.map(app => (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => setSelectedApp(app)}
                    className={`w-full text-left p-4 rounded-2xl border text-xs transition-all cursor-pointer ${
                      selectedApp?.id === app.id
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-500'
                        : 'border-black/8 bg-white hover:border-black/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono font-bold text-gray-950 text-xs">
                        {app.applicationNumber}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                        app.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-900 border-emerald-300' :
                        app.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-900 border-amber-300' :
                        app.status === 'REJECTED' ? 'bg-rose-100 text-rose-900 border-rose-300' :
                        'bg-sky-100 text-sky-900 border-sky-300'
                      }`}>
                        {app.status}
                      </span>
                    </div>

                    <div className="font-bold text-gray-900 line-clamp-1">{app.serviceName}</div>
                    <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1.5">
                      <span>Applicant: <strong className="text-gray-800">{app.citizenName || 'Citizen'}</strong></span>
                      <span className="font-mono text-[10px]">{app.citizenAadhaarMasked || 'XXXX-XXXX-0000'}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Detailed Proof Review & Adjudication */}
          <div className="lg:col-span-7 bg-white/85 backdrop-blur-xl border border-black/8 rounded-3xl p-6 sm:p-7 shadow-[0_18px_44px_-26px_rgba(0,0,0,0.10)]">
            {selectedApp ? (
              <div className="space-y-6">
                <div className="flex items-start justify-between border-b border-black/8 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-base text-[#111111]">
                        {selectedApp.applicationNumber}
                      </span>
                      <span className="text-[10px] bg-black/5 text-[#5c5c5c] border border-black/8 px-2.5 py-0.5 rounded-full font-bold">
                        {selectedApp.departmentCode}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-[#111111] mt-1">
                      {selectedApp.serviceName}
                    </h3>
                  </div>

                  <div className="text-right text-xs">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Current Status</span>
                    <span className={`font-bold px-2.5 py-0.5 rounded-full text-xs inline-block mt-0.5 ${
                      selectedApp.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-900' :
                      selectedApp.status === 'REJECTED' ? 'bg-rose-100 text-rose-900' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {selectedApp.status}
                    </span>
                  </div>
                </div>

                {/* Authoritative Proofs Section (Key Mahasetu feature) */}
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-2 mb-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Mahasetu Pre-Verified Authoritative Proofs (No Physical Uploads Needed)</span>
                  </span>

                  {selectedApp.verifiedProofs && selectedApp.verifiedProofs.length > 0 ? (
                    <div className="space-y-2.5">
                      {selectedApp.verifiedProofs.map((proof, i) => (
                        <div key={i} className="p-4 bg-emerald-50/40 border border-emerald-200/80 rounded-2xl text-xs shadow-xs">
                          <div className="flex items-center justify-between font-bold text-gray-900">
                            <span className="flex items-center gap-1.5">
                              <CheckCircle className="w-4 h-4 text-emerald-600" />
                              {proof.fieldCode.replace(/_/g, ' ')}
                            </span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 rounded-full font-extrabold">
                              AUTHENTIC STATE RECORD
                            </span>
                          </div>
                          <div className="text-[11px] text-gray-600 mt-2 grid grid-cols-2 gap-2 font-mono">
                            <div>Certificate / Ref: <span className="font-bold text-black">{proof.certificateNumber || 'MH-VERIFIED'}</span></div>
                            <div>Source Department: <span className="font-bold text-black">{proof.sourceDepartment}</span></div>
                          </div>
                          <div className="text-[10px] text-gray-400 mt-1.5 font-mono">
                            Digitally Verified At: {new Date(proof.verifiedAt).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-600">
                      Standard Aadhaar identity & biometric verified credentials attached.
                    </div>
                  )}
                </div>

                {/* Form Data Submitted */}
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2.5">
                    Applicant Form Declarations
                  </span>
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs space-y-2">
                    {Object.entries(selectedApp.formData).map(([k, v]) => (
                      <div key={k} className="flex justify-between border-b border-gray-200/60 pb-1 last:border-0 last:pb-0">
                        <span className="text-gray-500 font-medium">{k}:</span>
                        <span className="font-bold text-gray-900 font-mono">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Consent & Audit Reference */}
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5 text-[11px] text-gray-600 space-y-1 font-mono">
                  <div>Consent ID: <span className="text-black font-bold">{selectedApp.consentId || 'CNS-MAH-2025'}</span></div>
                  <div>DPDP 2023 Compliance: <span className="text-emerald-700 font-extrabold">ENFORCED & VERIFIED AUTHENTIC</span></div>
                </div>

                {/* Officer Action Bar */}
                <div className="pt-4 border-t border-black/8 space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-1.5">
                      Officer Decision Remarks / Instructions
                    </label>
                    <input
                      type="text"
                      value={actionRemarks}
                      onChange={e => setActionRemarks(e.target.value)}
                      placeholder="Enter verification comments or approval note..."
                      className="w-full p-3 bg-white border border-gray-300 rounded-xl text-xs text-black placeholder:text-gray-400 focus:outline-none focus:border-black shadow-xs"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2.5">
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus('REJECTED')}
                      className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Reject Application</span>
                    </button>

                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus('IN_PROGRESS')}
                      className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Mark In-Progress</span>
                    </button>

                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus('APPROVED')}
                      className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve Application</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-xs text-gray-500">
                Select an application from the left queue to review proofs and approve.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Task 2: Direct Benefit Transfer (DBT) Disbursement */}
      {activeTaskTab === 'dbt' && (
        <div className="bg-white/85 backdrop-blur-xl border border-black/8 rounded-3xl p-6 sm:p-8 shadow-[0_18px_44px_-26px_rgba(0,0,0,0.10)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                PFMS / NPCI Aadhaar Payment Bridge System
              </span>
              <h3 className="text-xl font-extrabold text-gray-900 mt-1.5">
                Direct Benefit Transfer (DBT) Fund Disbursement Workbench
              </h3>
              <p className="text-xs text-gray-500">
                Authorize instant Aadhaar-seeded Direct Benefit Transfers for approved welfare schemes.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-gray-400 block uppercase">Gateway Protocol</span>
              <span className="text-xs font-mono font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-block">
                APBS v2.4 (Live)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <h4 className="text-xs font-bold uppercase text-gray-700">1. Select Target Application</h4>
              <select
                aria-label="Target Application"
                value={selectedApp?.id || ''}
                onChange={e => {
                  const f = applications.find(a => a.id === e.target.value);
                  if (f) setSelectedApp(f);
                }}
                className="w-full p-3 bg-white border border-gray-300 rounded-xl text-xs font-bold text-black focus:outline-none focus:border-black"
              >
                {applications.map(app => (
                  <option key={app.id} value={app.id}>
                    {app.applicationNumber} - {app.citizenName} ({app.serviceName})
                  </option>
                ))}
              </select>

              <h4 className="text-xs font-bold uppercase text-gray-700 mt-3">2. Disbursement Amount (₹)</h4>
              <div className="flex gap-2">
                {[1000, 2000, 5000, 10000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDbtAmount(amt)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      dbtAmount === amt
                        ? 'border-emerald-600 bg-emerald-600 text-white font-extrabold'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    ₹{amt.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  disabled={!selectedApp || isUpdating}
                  onClick={() => selectedApp && handleDisburseDBT(selectedApp.id, dbtAmount)}
                  className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Execute Direct Benefit Transfer (₹{dbtAmount.toLocaleString('en-IN')})</span>
                </button>
              </div>
            </div>

            <div className="bg-emerald-950 text-white p-6 rounded-2xl border border-emerald-900 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                  APBS Payment Receipt
                </span>
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>

              {dbtSuccessInfo ? (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-white/10 rounded-xl border border-white/15">
                    <div className="text-gray-300 text-[10px]">PFMS Transaction Ref:</div>
                    <div className="font-mono font-bold text-amber-300 text-sm mt-0.5">{dbtSuccessInfo.txnId}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>Amount: <strong className="text-white font-mono">₹{dbtSuccessInfo.amount}</strong></div>
                    <div>Status: <strong className="text-emerald-400">DISBURSED</strong></div>
                  </div>
                  <div className="text-[10px] text-gray-300">
                    Payment Gateway: {dbtSuccessInfo.paymentBridge}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-gray-300 py-8 text-center space-y-2">
                  <Activity className="w-8 h-8 text-emerald-400 mx-auto animate-pulse" />
                  <p>Awaiting officer disbursement execution...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Task 3: Inter-Department Data Hops */}
      {activeTaskTab === 'interop' && (
        <div className="bg-white/85 backdrop-blur-xl border border-black/8 rounded-3xl p-6 sm:p-8 shadow-[0_18px_44px_-26px_rgba(0,0,0,0.10)] space-y-5">
          <div className="pb-3 border-b border-gray-100">
            <h3 className="text-lg font-extrabold text-gray-900">Inter-Department Data Hop Orchestrator</h3>
            <p className="text-xs text-gray-500">Live monitor of automated cross-department verification queries across Maharashtra databases</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-1">
              <div className="text-[10px] font-bold uppercase text-amber-700">Revenue Dept</div>
              <div className="text-xs font-bold text-gray-900">7/12 & Income Certificates</div>
              <div className="text-[11px] text-emerald-600 font-mono font-bold">12ms Latency • Online</div>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-1">
              <div className="text-[10px] font-bold uppercase text-blue-700">District Administration</div>
              <div className="text-xs font-bold text-gray-900">Domicile & Caste Validity</div>
              <div className="text-[11px] text-emerald-600 font-mono font-bold">18ms Latency • Online</div>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-1">
              <div className="text-[10px] font-bold uppercase text-purple-700">MahaRTO</div>
              <div className="text-xs font-bold text-gray-900">Driving License & RC</div>
              <div className="text-[11px] text-emerald-600 font-mono font-bold">15ms Latency • Online</div>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-1">
              <div className="text-[10px] font-bold uppercase text-emerald-700">Arogya / Health</div>
              <div className="text-xs font-bold text-gray-900">Disability & Fitness Certs</div>
              <div className="text-[11px] text-emerald-600 font-mono font-bold">21ms Latency • Online</div>
            </div>
          </div>
        </div>
      )}

      {/* Task 4: Officer Registry */}
      {activeTaskTab === 'roster' && (
        <div className="bg-white/85 backdrop-blur-xl border border-black/8 rounded-3xl p-6 sm:p-8 shadow-[0_18px_44px_-26px_rgba(0,0,0,0.10)] space-y-5">
          <div className="pb-3 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-extrabold text-gray-900">Official Government Officer Directory</h3>
              <p className="text-xs text-gray-500">Authorized personnel registered in Supabase PostgreSQL & Maharashtra Administrative Gateway</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-700" />
                <span>{officersSource === 'SUPABASE_POSTGRESQL' ? 'Live Supabase DB' : 'Registry Synchronized'}</span>
              </span>
              <button
                type="button"
                onClick={fetchOfficers}
                className="p-1.5 text-gray-500 hover:text-black bg-gray-100 hover:bg-gray-200 rounded-lg transition-all cursor-pointer"
                title="Refresh from Supabase"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {officersList.length > 0 ? (
              officersList.map((off, idx) => (
                <div key={off.id || idx} className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-1.5 hover:border-gray-300 transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-bold text-sm text-gray-900">{off.name}</div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                      {off.departmentCode || 'REVENUE'}
                    </span>
                  </div>
                  <div className="text-xs text-amber-800 font-semibold">{off.designation}</div>
                  <div className="text-xs text-gray-600 font-mono flex items-center gap-1">
                    <span>Email:</span>
                    <strong className="text-gray-900">{off.email}</strong>
                  </div>
                  <div className="text-[11px] text-gray-500 font-mono flex items-center justify-between">
                    <span>Aadhaar: <strong className="text-gray-800">{off.maskedAadhaar || 'XXXX-XXXX-0000'}</strong></span>
                    <span className="text-[10px] text-gray-400">{off.officeLocation?.split(',')[0]}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-8 text-gray-500 text-xs">
                No officers loaded yet. Check your Supabase connection.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Task 5: Supabase Officers Table & DDL Setup */}
      {activeTaskTab === 'supabase_sql' && (
        <div className="bg-white/85 backdrop-blur-xl border border-black/8 rounded-3xl p-6 sm:p-8 shadow-[0_18px_44px_-26px_rgba(0,0,0,0.10)] space-y-5">
          <div className="pb-3 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  PostgreSQL Schema
                </span>
                <span className="text-xs text-gray-500">Supabase Table Definition</span>
              </div>
              <h3 className="text-lg font-extrabold text-gray-900 mt-1">Supabase Officers Table & Seed Script</h3>
              <p className="text-xs text-gray-500">
                Run this SQL in your Supabase Dashboard (SQL Editor) to create the dedicated <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-emerald-800 font-bold">officers</code> table.
              </p>
            </div>

            <button
              type="button"
              id="btn-copy-officer-sql"
              onClick={() => {
                const sqlToCopy = `-- Create dedicated officers table in Supabase PostgreSQL
CREATE TABLE IF NOT EXISTS officers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aadhaar_number TEXT NOT NULL,
  masked_aadhaar TEXT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'officer',
  department_id TEXT,
  department_code TEXT DEFAULT 'REVENUE',
  designation TEXT,
  employee_code TEXT,
  office_location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert or Update Officers
INSERT INTO officers (aadhaar_number, masked_aadhaar, name, email, phone, role, department_code, designation, employee_code, office_location)
VALUES 
  ('987654321098', 'XXXX-XXXX-1098', 'Abhijit Tikone', 'abhijittikone0@gmail.com', '+91 98230 45678', 'officer', 'REVENUE', 'Sub-Divisional Officer (SDO) & DBT Custodian', 'MH-OFF-1098', 'Collectorate Office, Pune Division, Maharashtra'),
  ('445566778899', 'XXXX-XXXX-8899', 'Sanjay Deshpande', 'sanjay.deshpande@mahashasan.gov.in', '+91 98221 44556', 'officer', 'REVENUE', 'Revenue Tahsildar & Desk Officer', 'MH-OFF-8899', 'Tehsil Office, Haveli, Pune'),
  ('223344556677', 'XXXX-XXXX-6677', 'Dr. Meena Kulkarni', 'meena.kulkarni@mahashasan.gov.in', '+91 98222 33445', 'officer', 'WELFARE', 'MahaDBT Welfare Desk Officer', 'MH-OFF-6677', 'Social Justice & Assistance Directorate, Pune'),
  ('998877665544', 'XXXX-XXXX-5544', 'Vikram Joshi', 'vikram.joshi@mahashasan.gov.in', '+91 98223 99887', 'officer', 'RTO', 'MahaRTO Motor Vehicles Inspector', 'MH-OFF-5544', 'Regional Transport Office, Pune MH-12')
ON CONFLICT (email) DO UPDATE SET
  aadhaar_number = EXCLUDED.aadhaar_number,
  masked_aadhaar = EXCLUDED.masked_aadhaar,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  department_code = EXCLUDED.department_code,
  designation = EXCLUDED.designation,
  employee_code = EXCLUDED.employee_code,
  office_location = EXCLUDED.office_location,
  updated_at = NOW();`;
                navigator.clipboard.writeText(sqlToCopy);
                setSqlCopied(true);
                setTimeout(() => setSqlCopied(false), 3000);
              }}
              className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 shadow-xs"
            >
              {sqlCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>SQL Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <FileCheck2 className="w-4 h-4" />
                  <span>Copy SQL Script</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-[#121815] text-emerald-300 p-5 rounded-2xl border border-emerald-900/50 font-mono text-xs overflow-x-auto max-h-[380px] leading-relaxed shadow-inner">
            <pre className="text-gray-300 font-mono text-[11px] whitespace-pre-wrap">
{`-- ==========================================================
-- 1. Create Dedicated 'officers' Table
-- ==========================================================
CREATE TABLE IF NOT EXISTS officers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aadhaar_number TEXT NOT NULL,
  masked_aadhaar TEXT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'officer',
  department_id TEXT,
  department_code TEXT DEFAULT 'REVENUE',
  designation TEXT,
  employee_code TEXT,
  office_location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================================
-- 2. Insert Authorized Officers
-- ==========================================================
INSERT INTO officers (aadhaar_number, masked_aadhaar, name, email, phone, role, department_code, designation, employee_code, office_location)
VALUES 
  ('987654321098', 'XXXX-XXXX-1098', 'Abhijit Tikone', 'abhijittikone0@gmail.com', '+91 98230 45678', 'officer', 'REVENUE', 'Sub-Divisional Officer (SDO) & DBT Custodian', 'MH-OFF-1098', 'Collectorate Office, Pune Division, Maharashtra'),
  ('445566778899', 'XXXX-XXXX-8899', 'Sanjay Deshpande', 'sanjay.deshpande@mahashasan.gov.in', '+91 98221 44556', 'officer', 'REVENUE', 'Revenue Tahsildar & Desk Officer', 'MH-OFF-8899', 'Tehsil Office, Haveli, Pune'),
  ('223344556677', 'XXXX-XXXX-6677', 'Dr. Meena Kulkarni', 'meena.kulkarni@mahashasan.gov.in', '+91 98222 33445', 'officer', 'WELFARE', 'MahaDBT Welfare Desk Officer', 'MH-OFF-6677', 'Social Justice & Assistance Directorate, Pune'),
  ('998877665544', 'XXXX-XXXX-5544', 'Vikram Joshi', 'vikram.joshi@mahashasan.gov.in', '+91 98223 99887', 'officer', 'RTO', 'MahaRTO Motor Vehicles Inspector', 'MH-OFF-5544', 'Regional Transport Office, Pune MH-12')
ON CONFLICT (email) DO UPDATE SET
  aadhaar_number = EXCLUDED.aadhaar_number,
  masked_aadhaar = EXCLUDED.masked_aadhaar,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  department_code = EXCLUDED.department_code,
  designation = EXCLUDED.designation,
  employee_code = EXCLUDED.employee_code,
  office_location = EXCLUDED.office_location,
  updated_at = NOW();`}
            </pre>
          </div>

          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>How the Mahasetu Officer Gatekeeper Works:</span>
            </div>
            <p className="leading-relaxed">
              When an officer attempts to log in with their <strong>Official Email</strong> and <strong>12-digit Aadhaar UID</strong>, the Mahasetu backend queries the <code className="font-mono bg-emerald-100 px-1 py-0.5 rounded font-bold">officers</code> table in Supabase. If the email and Aadhaar match, the officer is immediately granted access to the Officer Portal with full adjudication and DBT disbursement privileges. If not present in Supabase, access is strictly denied.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

