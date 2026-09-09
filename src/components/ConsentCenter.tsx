/**
 * Mahasetu Consent & Privacy Center
 * Enforces Digital Personal Data Protection Act (DPDP 2023)
 * Granular purpose specification, access validity countdown, and 1-click immediate revocation.
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  Ban,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  RefreshCw,
  Building2,
  Lock,
  History,
  ArrowRight
} from 'lucide-react';
import { CitizenUser, ConsentRecord } from '../types.ts';
import { Language, TRANSLATIONS } from '../locales.ts';

interface Props {
  citizen: CitizenUser;
  language: Language;
  onViewAudit: () => void;
}

export const ConsentCenter: React.FC<Props> = ({
  citizen,
  language,
  onViewAudit
}) => {
  const t = TRANSLATIONS[language];
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchConsents = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/consent/${citizen.id}`);
      const data = await res.json();
      setConsents(data);
    } catch (e) {
      console.error('Error fetching consents', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsents();
  }, [citizen.id]);

  const handleRevokeConsent = async (consentId: string) => {
    try {
      setRevokingId(consentId);
      const res = await fetch(`/api/consent/${consentId}/revoke`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccessMsg(t.revokedSuccess);
        setTimeout(() => setActionSuccessMsg(''), 4000);
        fetchConsents();
      }
    } catch (e) {
      console.error('Revocation error', e);
    } finally {
      setRevokingId(null);
    }
  };

  const activeConsents = consents.filter(c => c.status === 'active');
  const pastConsents = consents.filter(c => c.status !== 'active');

  const getDepartmentName = (c: any) => c.requestingDepartmentCode || c.requesting_department_id || 'N/A';
  const getSourceDepts = (c: any): string => {
    const list = c.sourceDepartmentCodes || c.source_department_ids || [];
    return Array.isArray(list) ? list.join(', ') : String(list || 'REVENUE');
  };
  const getDataFields = (c: any): string[] => {
    const fields = c.dataFields || c.data_fields || [];
    return Array.isArray(fields) ? fields : [];
  };
  const getGrantedDate = (c: any): string => {
    const dateStr = c.grantedAt || c.granted_at || new Date().toISOString();
    return new Date(dateStr).toLocaleString();
  };
  const getExpiresTime = (c: any): string => {
    const dateStr = c.expiresAt || c.expires_at || new Date().toISOString();
    return new Date(dateStr).toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      {/* Privacy Policy Callout */}
      <div className="bg-white/75 backdrop-blur-xl border border-black/8 rounded-3xl p-6 sm:p-7 shadow-[0_18px_44px_-26px_rgba(0,0,0,0.10)] relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-13 h-13 rounded-2xl bg-black/5 border border-black/10 text-[#141414] flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  DPDP Act 2023 Compliant
                </span>
                <span className="text-xs text-[#5c5c5c] font-medium">
                  Citizen-Centric Data Fiduciary
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#111111] mt-1.5">
                {t.navConsent}
              </h2>
              <p className="text-xs text-[#5c5c5c] max-w-2xl mt-1 leading-relaxed">
                In Mahasetu, you own your identity. Government departments can only exchange your verification records when you provide time-bound, purpose-limited consent. You can revoke consent at any moment with 1 click.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchConsents}
            className="p-2.5 text-[#5c5c5c] hover:text-[#111111] hover:bg-black/5 rounded-xl transition-all self-start md:self-auto"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Active Consents Section */}
      <div className="bg-white/80 backdrop-blur-xl border border-black/8 rounded-3xl p-6 sm:p-7 shadow-[0_18px_44px_-26px_rgba(0,0,0,0.10)]">
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-black/8">
          <div>
            <h3 className="text-xl font-semibold tracking-tight text-[#111111]">
              {t.activeConsents} ({activeConsents.length})
            </h3>
            <p className="text-xs text-[#5c5c5c] mt-0.5">
              Currently authorized data sharing channels active across Maharashtra departments
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-[#5c5c5c] flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#111111]" />
            <span>Loading consent authorizations...</span>
          </div>
        ) : activeConsents.length === 0 ? (
          <div className="text-center py-12 text-[#5c5c5c] text-xs bg-black/5 rounded-2xl border border-dashed border-black/10">
            No active data-sharing consents. Your personal data is completely sealed across all departments.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeConsents.map(consent => (
              <div
                key={consent.id}
                className="bg-white hover:border-black/20 border border-black/8 rounded-2xl p-5 transition-all text-xs flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3 pb-3 border-b border-black/8">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#111111]">
                        {(consent.id || '').slice(0, 18)}...
                      </span>
                      <div className="text-[10px] text-[#5c5c5c] mt-0.5">
                        Granted: {getGrantedDate(consent)}
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      ACTIVE
                    </span>
                  </div>

                  <div className="space-y-2 text-xs mb-4">
                    <div>
                      <span className="text-[#5c5c5c]">Target Recipient:</span>{' '}
                      <span className="font-semibold text-[#111111]">{getDepartmentName(consent)} Department</span>
                    </div>
                    <div>
                      <span className="text-[#5c5c5c]">Source Verification:</span>{' '}
                      <span className="font-semibold text-[#111111]">{getSourceDepts(consent)}</span>
                    </div>
                    <div>
                      <span className="text-[#5c5c5c]">Purpose:</span>{' '}
                      <span className="text-[#333333]">{consent.purpose}</span>
                    </div>
                    <div>
                      <span className="text-[#5c5c5c] block mb-1 font-medium">Authorized Fields:</span>{' '}
                      <div className="flex flex-wrap gap-1.5">
                        {getDataFields(consent).map((df, i) => (
                          <span key={i} className="text-[10px] bg-black/5 border border-black/8 px-2 py-0.5 rounded-md font-mono text-[#333333]">
                            {df}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-black/8 flex items-center justify-between">
                  <div className="text-[11px] text-[#5c5c5c] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Expires: {getExpiresTime(consent)}</span>
                  </div>

                  <button
                    type="button"
                    disabled={revokingId === consent.id}
                    onClick={() => handleRevokeConsent(consent.id)}
                    className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>{revokingId === consent.id ? 'Revoking...' : t.revokeConsent}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historical Consents Section */}
      {pastConsents.length > 0 && (
        <div className="bg-white/80 backdrop-blur-xl border border-black/8 rounded-3xl p-6 sm:p-7 shadow-[0_18px_44px_-26px_rgba(0,0,0,0.10)]">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-black/8">
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-[#111111] flex items-center gap-2">
                <History className="w-5 h-5 text-[#141414]" />
                <span>Historical Consent Log ({pastConsents.length})</span>
              </h3>
              <p className="text-xs text-[#5c5c5c] mt-0.5">
                Past authorizations that have been revoked or naturally expired
              </p>
            </div>
            <button
              type="button"
              onClick={onViewAudit}
              className="inline-flex items-center gap-1 text-xs text-[#111111] hover:text-black font-semibold"
            >
              <span>View Full Audit Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-black/5">
            {pastConsents.map(c => (
              <div key={c.id} className="py-3.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-[#111111] flex items-center gap-1.5">
                    <span>{getDepartmentName(c)}</span>
                    <ArrowRight className="w-3 h-3 text-[#5c5c5c]" />
                    <span>{c.purpose}</span>
                  </div>
                  <div className="text-[11px] text-[#5c5c5c] mt-0.5">
                    ID: {(c.id || '').slice(0, 16)}... • {getGrantedDate(c)}
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${
                  c.status === 'revoked' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-black/5 text-[#5c5c5c] border-black/5'
                }`}>
                  {c.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
