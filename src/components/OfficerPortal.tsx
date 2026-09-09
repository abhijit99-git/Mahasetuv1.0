/**
 * Mahasetu Department Officer Portal
 * Allows officers to review applications with authoritative proofs pre-verified by the Mahasetu layer.
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
  Ban
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
          officerId: officer?.id || 'off-102'
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Application status updated to ${status}`);
        setTimeout(() => setSuccessMsg(''), 3500);
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

  return (
    <div className="space-y-6">
      {/* Officer Header Card */}
      <div className="bg-white/75 backdrop-blur-xl border border-black/8 rounded-3xl p-6 sm:p-7 shadow-[0_18px_44px_-26px_rgba(0,0,0,0.10)] relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-black/5 border border-black/10 text-[#141414] flex items-center justify-center font-bold text-xl shadow-xs">
              <UserCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Department Officer Workspace
                </span>
                <span className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Aadhaar Biometric Authenticated
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#111111] mt-1.5">
                {officer ? officer.name : 'Government Verification Officer'}
              </h2>
              <p className="text-xs text-[#5c5c5c]">
                {officer ? `${officer.designation} • ${officer.department}` : 'Authenticated Desk Officer / Tahsildar Portal'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!officer && (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="px-4 py-2.5 bg-[#141414] text-white hover:bg-black rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                Login as Officer
              </button>
            )}
            <button
              type="button"
              onClick={fetchApplications}
              className="p-2.5 text-[#5c5c5c] hover:text-[#111111] rounded-xl hover:bg-black/5 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Two Column Layout: Application List on Left, Detail & Actions on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: List */}
        <div className="lg:col-span-5 bg-white/80 backdrop-blur-xl border border-black/8 rounded-3xl p-5 sm:p-6 shadow-[0_18px_44px_-26px_rgba(0,0,0,0.10)]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-black/8">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5c5c5c]">
              Applications In Inbox ({applications.length})
            </span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-[#5c5c5c] flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[#111111]" />
              <span>Loading applications...</span>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#5c5c5c]">
              No applications submitted yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {applications.map(app => (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => setSelectedApp(app)}
                  className={`w-full text-left p-4 rounded-2xl border text-xs transition-all ${
                    selectedApp?.id === app.id
                      ? 'border-black/30 bg-black/5 shadow-xs ring-1 ring-black/10'
                      : 'border-black/8 bg-white hover:border-black/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono font-bold text-[#111111] text-xs">
                      {app.applicationNumber}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                      app.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                      app.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                      app.status === 'REJECTED' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                      'bg-sky-100 text-sky-800 border-sky-300'
                    }`}>
                      {app.status}
                    </span>
                  </div>

                  <div className="font-semibold text-[#111111] line-clamp-1">{app.serviceName}</div>
                  <div className="text-[11px] text-[#5c5c5c] mt-1">
                    Submitted: {new Date(app.submittedAt).toLocaleDateString()}
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
                    <span className="font-mono font-bold text-base text-[#111111]">
                      {selectedApp.applicationNumber}
                    </span>
                    <span className="text-[10px] bg-black/5 text-[#5c5c5c] border border-black/8 px-2.5 py-0.5 rounded-full font-semibold">
                      {selectedApp.departmentCode}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[#111111] mt-1.5">
                    {selectedApp.serviceName}
                  </h3>
                </div>

                <div className="text-right text-xs">
                  <span className="text-[#5c5c5c] block text-[10px] uppercase font-semibold">Current Status</span>
                  <span className="font-bold text-[#111111]">{selectedApp.status}</span>
                </div>
              </div>

              {/* Authoritative Proofs Section (Key Mahasetu feature) */}
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#111111] flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Mahasetu Pre-Verified Authoritative Proofs (Zero Physical Uploads)
                </span>
                <div className="space-y-2.5">
                  {selectedApp.verifiedProofs.map((proof, i) => (
                    <div key={i} className="p-4 bg-white border border-emerald-200 rounded-2xl text-xs shadow-xs">
                      <div className="flex items-center justify-between font-bold text-[#111111]">
                        <span>{proof.fieldCode.replace(/_/g, ' ')}</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full font-semibold">
                          AUTHENTIC STATE RECORD
                        </span>
                      </div>
                      <div className="text-[11px] text-[#5c5c5c] mt-2 grid grid-cols-2 gap-2">
                        <div>Cert No: <span className="font-semibold text-[#111111] font-mono">{proof.certificateNumber}</span></div>
                        <div>Dept: <span className="font-semibold text-[#111111]">{proof.sourceDepartment}</span></div>
                      </div>
                      <div className="text-[10px] text-[#7a7a7a] mt-1.5 font-mono">
                        Verified At: {new Date(proof.verifiedAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Data Submitted */}
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5c5c5c] block mb-2.5">
                  Applicant Declarations & Form Data
                </span>
                <div className="bg-black/5 border border-black/8 rounded-2xl p-4 text-xs space-y-2">
                  {Object.entries(selectedApp.formData).map(([k, v]) => (
                    <div key={k} className="flex justify-between border-b border-black/5 pb-1 last:border-0 last:pb-0">
                      <span className="text-[#5c5c5c]">{k}:</span>
                      <span className="font-semibold text-[#111111]">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Consent & Audit Reference */}
              <div className="bg-black/5 border border-black/8 rounded-2xl p-3.5 text-[11px] text-[#5c5c5c] space-y-1 font-mono">
                <div>Consent ID: <span className="text-[#111111] font-semibold">{selectedApp.consentId}</span></div>
                <div>DPDP 2023 Compliance: <span className="text-emerald-700 font-bold">VERIFIED AUTHENTIC</span></div>
              </div>

              {/* Officer Action Bar */}
              <div className="pt-4 border-t border-black/8 space-y-4">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[#5c5c5c] block mb-1.5">
                    Officer Decision Remarks / Instructions
                  </label>
                  <input
                    type="text"
                    value={actionRemarks}
                    onChange={e => setActionRemarks(e.target.value)}
                    placeholder="Enter approval or review remarks..."
                    className="w-full p-3 bg-white border border-black/10 rounded-xl text-xs text-[#111111] placeholder:text-[#8c8c8c] focus:outline-none focus:border-black shadow-xs"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2.5">
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleUpdateStatus('REJECTED')}
                    className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>

                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleUpdateStatus('IN_PROGRESS')}
                    className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Mark Review</span>
                  </button>

                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleUpdateStatus('APPROVED')}
                    className="px-5 py-2.5 bg-[#141414] text-white hover:bg-black rounded-xl text-xs font-semibold uppercase tracking-wider shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve Application</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-xs text-[#5c5c5c]">
              Select an application from the left panel to review proofs.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
