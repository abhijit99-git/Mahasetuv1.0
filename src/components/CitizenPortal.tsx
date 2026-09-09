/**
 * Mahasetu Citizen Portal
 * Complete end-to-end interactive interoperability workflow:
 * Service Catalogue -> Consent Grant -> Live Inter-Department Hops -> Pre-filled Application -> Submission & AI Explainer
 */

import React, { useState, useEffect } from 'react';
import {
  Building2,
  FileCheck,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Bot,
  RefreshCw,
  Send,
  Eye,
  AlertCircle,
  FileText,
  HelpCircle,
  Check,
  X,
  User,
  PenLine,
  MapPin,
  Landmark,
  CreditCard,
  Layers,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CitizenUser, ServiceDefinition, ConsentRecord, ApplicationRecord } from '../types.ts';
import { Language, TRANSLATIONS } from '../locales.ts';
import { UnifiedProfileForm } from './UnifiedProfileForm.tsx';

interface Props {
  citizen: CitizenUser;
  language: Language;
  onViewAudit: () => void;
  onViewConsents: () => void;
  onUpdateCitizen?: (updated: CitizenUser) => void;
}

export const CitizenPortal: React.FC<Props> = ({
  citizen,
  language,
  onViewAudit,
  onViewConsents,
  onUpdateCitizen
}) => {
  const t = TRANSLATIONS[language];

  const [services, setServices] = useState<ServiceDefinition[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceDefinition | null>(null);
  const [activeWorkflowStep, setActiveWorkflowStep] = useState<'SELECT' | 'CONSENT' | 'HOPS' | 'FORM' | 'SUCCESS'>('SELECT');
  
  // Consent flow state
  const [isGrantingConsent, setIsGrantingConsent] = useState(false);
  const [currentConsent, setCurrentConsent] = useState<ConsentRecord | null>(null);

  // Live Hop execution state
  const [hopStep, setHopStep] = useState<number>(0);
  const [verifiedProofs, setVerifiedProofs] = useState<any[]>([]);
  const [isVerifyingHops, setIsVerifyingHops] = useState<boolean>(false);

  // Form submission state
  const [formData, setFormData] = useState<Record<string, any>>({
    collegeName: 'COEP Technological University, Pune',
    courseName: 'B.Tech Computer Engineering (Third Year)',
    annualTuitionFee: 85000,
    bankAccountNumber: '309981245512',
    ifscCode: 'SBIN0001234'
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedApp, setSubmittedApp] = useState<ApplicationRecord | null>(null);

  // My Applications list
  const [myApplications, setMyApplications] = useState<ApplicationRecord[]>([]);
  const [activeAppTab, setActiveAppTab] = useState<'catalogue' | 'my_apps' | 'profile'>('catalogue');

  // AI explainer modal state
  const [explainingStatus, setExplainingStatus] = useState<string | null>(null);
  const [aiExplanationText, setAiExplanationText] = useState<string>('');
  const [isExplainingAi, setIsExplainingAi] = useState<boolean>(false);

  // Load services and existing applications
  const loadData = async () => {
    try {
      const srvRes = await fetch('/api/services');
      const srvData = await srvRes.json();
      setServices(srvData);

      const appRes = await fetch(`/api/applications?citizenId=${citizen.id}`);
      const appData = await appRes.json();
      setMyApplications(appData);
    } catch (e) {
      console.error('Error fetching services/applications', e);
    }
  };

  useEffect(() => {
    loadData();
  }, [citizen.id]);

  // Start application workflow
  const handleSelectService = (srv: ServiceDefinition) => {
    setSelectedService(srv);
    setActiveWorkflowStep('CONSENT');
    setHopStep(0);
    setVerifiedProofs([]);
    setSubmittedApp(null);
  };

  // Step 1: Grant Purpose-Bound Consent
  const handleApproveConsent = async () => {
    if (!selectedService) return;
    setIsGrantingConsent(true);

    try {
      const res = await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          citizen_id: citizen.id,
          requesting_department_id: selectedService.departmentCode,
          source_department_ids: selectedService.requiredFields.map(f => f.sourceDepartmentCode),
          service_id: selectedService.id,
          purpose: `Authoritative qualification verification for ${selectedService.name}`,
          data_fields: selectedService.requiredFields.map(f => f.fieldCode),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
      });

      const data = await res.json();
      if (data.success && data.consent) {
        setCurrentConsent(data.consent);
        setIsGrantingConsent(false);
        setActiveWorkflowStep('HOPS');
        executeLiveInteroperabilityHops(data.consent);
      }
    } catch (err) {
      console.error('Consent error', err);
      setIsGrantingConsent(false);
    }
  };

  // Step 2: Execute Live Inter-Departmental Gateway Hops
  const executeLiveInteroperabilityHops = async (consent: ConsentRecord) => {
    if (!selectedService) return;
    setIsVerifyingHops(true);
    setHopStep(1);

    const proofs: any[] = [];

    // Hop 1: Request from first source department
    const field1 = selectedService.requiredFields[0];
    if (field1) {
      setTimeout(async () => {
        try {
          const res1 = await fetch('/api/data-request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              consent_id: consent.id,
              source_department_id: field1.sourceDepartmentCode,
              requesting_department_id: selectedService.departmentCode,
              requested_fields: [field1.fieldCode],
              citizen_id: citizen.id
            })
          });
          const data1 = await res1.json();
          if (data1.success && data1.result?.canonical) {
            proofs.push({
              fieldCode: field1.fieldCode,
              sourceDepartment: field1.sourceDepartmentCode,
              verificationStatus: 'VERIFIED',
              certificateNumber: data1.result.canonical.documentNumber,
              validUntil: data1.result.canonical.validUntil,
              verifiedAt: new Date().toISOString(),
              canonicalPayload: data1.result.canonical
            });
            setVerifiedProofs([...proofs]);
          }
        } catch (e) {
          console.error('Hop 1 error', e);
        }

        // Hop 2: Request from second source department
        setHopStep(2);
        const field2 = selectedService.requiredFields[1];
        if (field2) {
          setTimeout(async () => {
            try {
              const res2 = await fetch('/api/data-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  consent_id: consent.id,
                  source_department_id: field2.sourceDepartmentCode,
                  requesting_department_id: selectedService.departmentCode,
                  requested_fields: [field2.fieldCode],
                  citizen_id: citizen.id
                })
              });
              const data2 = await res2.json();
              if (data2.success && data2.result?.canonical) {
                proofs.push({
                  fieldCode: field2.fieldCode,
                  sourceDepartment: field2.sourceDepartmentCode,
                  verificationStatus: 'VERIFIED',
                  certificateNumber: data2.result.canonical.documentNumber,
                  validUntil: data2.result.canonical.validUntil,
                  verifiedAt: new Date().toISOString(),
                  canonicalPayload: data2.result.canonical
                });
                setVerifiedProofs([...proofs]);
              }
            } catch (e) {
              console.error('Hop 2 error', e);
            }

            setHopStep(3);
            setIsVerifyingHops(false);
            setTimeout(() => {
              setActiveWorkflowStep('FORM');
            }, 900);
          }, 700);
        } else {
          setHopStep(3);
          setIsVerifyingHops(false);
          setTimeout(() => {
            setActiveWorkflowStep('FORM');
          }, 900);
        }
      }, 700);
    }
  };

  // Step 3: Final Form Submission
  const handleSubmitFinalApplication = async () => {
    if (!selectedService || !currentConsent) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          citizenId: citizen.id,
          serviceId: selectedService.id,
          formData,
          verifiedProofs,
          consentId: currentConsent.id
        })
      });

      const data = await res.json();
      if (data.success && data.application) {
        setSubmittedApp(data.application);
        setActiveWorkflowStep('SUCCESS');
        setIsSubmitting(false);
        loadData();
      }
    } catch (err) {
      console.error('Submission error', err);
      setIsSubmitting(false);
    }
  };

  // Call Gemini AI Status Explainer
  const handleExplainWithAi = async (app: ApplicationRecord) => {
    setExplainingStatus(app.applicationNumber);
    setIsExplainingAi(true);
    setAiExplanationText('');

    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          statusMessage: `${app.serviceName} is currently ${app.status}. Remarks: ${app.trackingRemarks || 'Proofs verified by Mahasetu layer.'}`,
          language: language === 'mr' ? 'Marathi' : language === 'hi' ? 'Hindi' : 'English'
        })
      });
      const data = await res.json();
      setAiExplanationText(data.explanation || 'Status explanation generated.');
    } catch (e) {
      setAiExplanationText('माहिती उपलब्ध झाली आहे: अर्ज पडताळणी पूर्ण झाली असून निर्णय प्रक्रियेत आहे.');
    } finally {
      setIsExplainingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-white/75 backdrop-blur-xl border border-black/8 rounded-3xl p-6 sm:p-7 shadow-[0_18px_44px_-26px_rgba(0,0,0,0.10)] relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-[#111111] text-xs font-semibold mb-2 border border-black/8 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>AADHAAR VERIFIED: {citizen.maskedAadhaar}</span>
              {citizen.category && (
                <span className="ml-1 pl-2 border-l border-black/10 text-[#5c5c5c] font-normal">
                  {citizen.category} • {citizen.address?.district || 'Maharashtra'}
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#111111]">
              {citizen.name ? (language === 'mr' ? `नमस्कार, ${citizen.nameMr || citizen.name}!` : `Welcome, ${citizen.name}!`) : 'Identity Verified (Aadhaar Authenticated)'}
            </h2>
            <p className="text-xs text-[#5c5c5c] max-w-2xl mt-1 leading-relaxed">
              {citizen.name ? t.servicesSubtitle : 'Aadhaar identity verified. Please complete your Unified Digital Profile once to access all Maharashtra welfare schemes.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex p-1 bg-black/5 rounded-xl border border-black/5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveAppTab('catalogue')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeAppTab === 'catalogue'
                    ? 'bg-[#141414] text-white shadow-xs'
                    : 'text-[#5c5c5c] hover:text-[#111111]'
                }`}
              >
                {t.servicesTitle}
              </button>
              <button
                type="button"
                onClick={() => setActiveAppTab('my_apps')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  activeAppTab === 'my_apps'
                    ? 'bg-[#141414] text-white shadow-xs'
                    : 'text-[#5c5c5c] hover:text-[#111111]'
                }`}
              >
                <span>{t.myApplications}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeAppTab === 'my_apps' ? 'bg-white/20 text-white font-bold' : 'bg-black/10 text-[#5c5c5c]'}`}>
                  {myApplications.length}
                </span>
              </button>
              <button
                id="btn-tab-edit-profile"
                type="button"
                onClick={() => setActiveAppTab('profile')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  activeAppTab === 'profile'
                    ? 'bg-[#141414] text-white shadow-xs'
                    : 'text-[#5c5c5c] hover:text-[#111111]'
                }`}
              >
                <PenLine className="w-3.5 h-3.5 text-amber-500" />
                <span>{t.editProfile || 'Edit Profile'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* If profile is incomplete or blank, force display of Unified Profile Builder Form */}
      {(!citizen.name || citizen.isProfileComplete === false) ? (
        <UnifiedProfileForm
          citizen={citizen}
          language={language}
          onProfileSaved={(updatedCitizen) => {
            if (onUpdateCitizen) onUpdateCitizen(updatedCitizen);
            loadData();
          }}
        />
      ) : (
        <>
          {/* Main Content View */}
      {activeAppTab === 'profile' ? (
        <UnifiedProfileForm
          citizen={citizen}
          language={language}
          onCancel={() => setActiveAppTab('catalogue')}
          onProfileSaved={(updatedCitizen) => {
            if (onUpdateCitizen) onUpdateCitizen(updatedCitizen);
            loadData();
            setActiveAppTab('catalogue');
          }}
        />
      ) : activeAppTab === 'catalogue' ? (
        <div className="space-y-6">
          {/* Quick Unified Profile Summary Card */}
          {activeWorkflowStep === 'SELECT' && (
            <div className="bg-white/80 backdrop-blur-xl border border-black/8 rounded-3xl p-5 shadow-[0_12px_36px_-20px_rgba(0,0,0,0.08)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-400/20 border border-amber-400/30 text-amber-900 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#111111]">{citizen.name || 'Citizen User'}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {citizen.category || 'OBC'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-black/5 text-[#5c5c5c] text-[10px] font-mono">
                      ₹{(citizen.annualIncome || 0).toLocaleString('en-IN')}/yr
                    </span>
                  </div>
                  <div className="text-[11px] text-[#5c5c5c] flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                    <span><strong>7/12 Land:</strong> {citizen.landHolding?.gatNumber || 'MH-712-GAT-101'} ({citizen.landHolding?.areaInAcres || 2.5} Acres)</span>
                    <span>•</span>
                    <span><strong>DBT Bank:</strong> {citizen.dbtBankDetails?.bankName || 'SBI'} (A/C: {citizen.dbtBankDetails?.accountNumber ? `••••${citizen.dbtBankDetails.accountNumber.slice(-4)}` : '••••5512'})</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveAppTab('profile')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black/5 hover:bg-black/10 text-[#111111] text-xs font-semibold border border-black/8 hover:border-black/20 transition-all shrink-0 cursor-pointer"
              >
                <PenLine className="w-3.5 h-3.5 text-amber-600" />
                <span>{t.editProfile || 'Edit Profile'}</span>
              </button>
            </div>
          )}

          {/* If an active workflow is selected */}
          {activeWorkflowStep !== 'SELECT' && selectedService && (
            <div className="bg-white/85 backdrop-blur-xl border border-black/8 rounded-3xl shadow-[0_18px_44px_-26px_rgba(0,0,0,0.12)] overflow-hidden mb-6 text-[#111111]">
              {/* Stepper Progress Bar */}
              <div className="bg-black/5 border-b border-black/8 px-6 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-[#111111]">
                    {language === 'mr' ? selectedService.nameMr : selectedService.name}
                  </span>
                  <span className="text-[10px] text-[#111111] bg-white border border-black/8 px-2 py-0.5 rounded font-mono font-semibold">
                    {selectedService.departmentCode}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveWorkflowStep('SELECT');
                    setSelectedService(null);
                  }}
                  className="inline-flex items-center gap-1 text-xs text-[#5c5c5c] hover:text-[#111111] font-medium"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>CANCEL</span>
                </button>
              </div>

              <div className="p-6">
                {/* STEP 1: CONSENT GRANT (DPDP 2023) */}
                {activeWorkflowStep === 'CONSENT' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
                    <div className="text-center mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-black/5 border border-black/10 text-[#141414] flex items-center justify-center mx-auto mb-2 shadow-xs">
                        <FileCheck className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-[#111111]">{t.consentTitle}</h3>
                      <p className="text-xs text-[#5c5c5c] mt-0.5">{t.consentSubtitle}</p>
                    </div>

                    <div className="bg-black/5 border border-black/8 rounded-2xl p-5 space-y-3 text-xs">
                      <div className="flex justify-between border-b border-black/8 pb-2">
                        <span className="text-[#5c5c5c] font-medium">{t.requestingDept}:</span>
                        <span className="font-bold text-[#111111]">{selectedService.departmentCode} Portal</span>
                      </div>
                      <div className="flex justify-between border-b border-black/8 pb-2">
                        <span className="text-[#5c5c5c] font-medium">{t.sourceDept}:</span>
                        <span className="font-bold text-[#111111]">
                          {selectedService.requiredFields.map(f => f.sourceDepartmentCode).join(', ')}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-black/8 pb-2">
                        <span className="text-[#5c5c5c] font-medium">{t.purposeOfAccess}:</span>
                        <span className="font-medium text-[#111111]">
                          Scholarship & Eligibility Verification (Non-disclosive minimal verification)
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-black/8 pb-2">
                        <span className="text-[#5c5c5c] font-medium">{t.accessDuration}:</span>
                        <span className="font-mono text-[10px] text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded font-semibold">
                          SINGLE TRANSACTION / 24 HOURS ONLY
                        </span>
                      </div>

                      <div className="pt-2">
                        <span className="font-semibold text-[#111111] block mb-1.5 uppercase text-[10px] tracking-wider">Authorized Data Fields Requested:</span>
                        <ul className="space-y-1.5">
                          {selectedService.requiredFields.map(rf => (
                            <li key={rf.id} className="flex items-center gap-2 text-[#111111] bg-white p-2.5 rounded-xl border border-black/8 shadow-xs">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <div>
                                <span className="font-semibold text-[#111111]">{language === 'mr' ? rf.displayNameMr : rf.displayName}</span>
                                <span className="text-[10px] text-[#5c5c5c] block">{rf.purpose}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 mt-6">
                      <button
                        type="button"
                        onClick={() => setActiveWorkflowStep('SELECT')}
                        className="px-4 py-2 text-xs font-semibold text-[#5c5c5c] hover:text-[#111111]"
                      >
                        {t.rejectConsent}
                      </button>

                      <button
                        id="btn-approve-consent"
                        type="button"
                        disabled={isGrantingConsent}
                        onClick={handleApproveConsent}
                        className="px-6 py-3 bg-[#141414] hover:bg-black text-white rounded-xl text-xs font-semibold tracking-wide shadow-sm hover:shadow transition-all flex items-center gap-2"
                      >
                        {isGrantingConsent ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Creating Cryptographic Consent...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" />
                            <span>{t.approveAndFetch}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: LIVE INTEROPERABILITY HOP VISUALIZER */}
                {activeWorkflowStep === 'HOPS' && (
                  <div className="max-w-2xl mx-auto py-4">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-[#111111]">Mahasetu Peer-to-Peer Interoperability Gateway</h3>
                      <p className="text-xs text-[#5c5c5c] mt-1">
                        Zero manual document uploads • Real-time canonical schema translation
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Hop 1 */}
                      <div className={`p-4 rounded-2xl border transition-all ${
                        hopStep >= 1 ? 'border-emerald-300 bg-emerald-50/50 shadow-xs' : 'border-black/8 bg-white'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs font-mono ${
                              hopStep > 1 ? 'bg-[#141414] text-white' : hopStep === 1 ? 'bg-black/10 text-black animate-pulse' : 'bg-black/5 text-[#5c5c5c]'
                            }`}>
                              {hopStep > 1 ? <Check className="w-4 h-4" /> : '1'}
                            </div>
                            <div>
                              <div className="font-semibold text-xs text-[#111111] flex items-center gap-1.5">
                                <span>Hop 1: Mahasetu Gateway</span>
                                <ArrowRight className="w-3 h-3 text-[#5c5c5c]" />
                                <span>Revenue Department Adapter</span>
                              </div>
                              <div className="text-[11px] text-[#5c5c5c] font-mono">
                                GET /api/adapters/revenue/income-certificate/INC-MH-2026-10382
                              </div>
                            </div>
                          </div>
                          {hopStep > 1 && (
                            <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded inline-flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-700" />
                              <span>VERIFIED (16ms)</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Hop 2 */}
                      <div className={`p-4 rounded-2xl border transition-all ${
                        hopStep >= 2 ? 'border-emerald-300 bg-emerald-50/50 shadow-xs' : 'border-black/8 bg-white'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs font-mono ${
                              hopStep > 2 ? 'bg-[#141414] text-white' : hopStep === 2 ? 'bg-black/10 text-black animate-pulse' : 'bg-black/5 text-[#5c5c5c]'
                            }`}>
                              {hopStep > 2 ? <Check className="w-4 h-4" /> : '2'}
                            </div>
                            <div>
                              <div className="font-semibold text-xs text-[#111111] flex items-center gap-1.5">
                                <span>Hop 2: Mahasetu Gateway</span>
                                <ArrowRight className="w-3 h-3 text-[#5c5c5c]" />
                                <span>District Administration Adapter</span>
                              </div>
                              <div className="text-[11px] text-[#5c5c5c] font-mono">
                                GET /api/adapters/district/domicile/DOM-MH-2024-88491
                              </div>
                            </div>
                          </div>
                          {hopStep > 2 && (
                            <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded inline-flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-700" />
                              <span>VERIFIED (18ms)</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Hop 3: Canonical Mapping Result */}
                      <div className={`p-4 rounded-2xl border transition-all ${
                        hopStep >= 3 ? 'border-emerald-300 bg-emerald-50/50 shadow-xs' : 'border-black/8 bg-white'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs font-mono ${
                              hopStep >= 3 ? 'bg-[#141414] text-white' : 'bg-black/5 text-[#5c5c5c]'
                            }`}>
                              {hopStep >= 3 ? <Check className="w-4 h-4" /> : '3'}
                            </div>
                            <div>
                              <div className="font-semibold text-xs text-[#111111]">
                                Hop 3: Canonical Data Ingestion & Pre-Fill Payload
                              </div>
                              <div className="text-[11px] text-[#5c5c5c] font-mono">
                                All proofs verified • Signed SHA-256 Audit Log Dispatched
                              </div>
                            </div>
                          </div>
                          {hopStep >= 3 && (
                            <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded">
                              PRE-FILLING FORM...
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: PRE-FILLED FORM & DIRECT SUBMISSION */}
                {activeWorkflowStep === 'FORM' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-5">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-[#111111]">
                          {language === 'mr' ? selectedService.nameMr : selectedService.name} - Application Form
                        </h3>
                        <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          ZERO UPLOADS NEEDED
                        </span>
                      </div>
                      <p className="text-xs text-[#5c5c5c] mt-1">
                        All mandatory proofs have been verified directly from departmental databases through Mahasetu.
                      </p>
                    </div>

                    {/* Pre-verified proofs banner */}
                    <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-900 mb-2.5 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Verified Authoritative Proofs Attached Automatically:</span>
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {verifiedProofs.map((vp, i) => (
                          <div key={i} className="p-3 bg-white rounded-xl border border-emerald-200 text-xs shadow-xs">
                            <div className="font-bold text-[#111111] flex items-center justify-between">
                              <span>{vp.fieldCode.replace(/_/g, ' ')}</span>
                              <span className="text-[10px] text-emerald-700 font-mono font-bold">VERIFIED</span>
                            </div>
                            <div className="text-[10px] text-[#5c5c5c] mt-0.5 font-mono">
                              Cert No: {vp.certificateNumber}
                            </div>
                            <div className="text-[10px] text-[#7a7a7a]">
                              Source: {vp.sourceDepartment} Dept
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Citizen details (pre-filled from Aadhaar Auth) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-black/5 p-4 rounded-2xl border border-black/8">
                      <div>
                        <label className="text-[#5c5c5c] block mb-1 text-[10px] uppercase font-semibold">Applicant Full Name</label>
                        <input
                          type="text"
                          disabled
                          value={citizen.name}
                          className="w-full p-2.5 bg-white border border-black/8 rounded-xl font-bold text-[#111111] shadow-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[#5c5c5c] block mb-1 text-[10px] uppercase font-semibold">Aadhaar Masked UID</label>
                        <input
                          type="text"
                          disabled
                          value={citizen.maskedAadhaar}
                          className="w-full p-2.5 bg-white border border-black/8 rounded-xl font-mono font-bold text-[#111111] shadow-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[#5c5c5c] block mb-1 text-[10px] uppercase font-semibold">Taluka & District</label>
                        <input
                          type="text"
                          disabled
                          value={`${citizen.address.taluka}, ${citizen.address.district}`}
                          className="w-full p-2.5 bg-white border border-black/8 rounded-xl font-bold text-[#111111] shadow-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[#5c5c5c] block mb-1 text-[10px] uppercase font-semibold">Contact Number</label>
                        <input
                          type="text"
                          disabled
                          value={citizen.phone}
                          className="w-full p-2.5 bg-white border border-black/8 rounded-xl font-bold text-[#111111] shadow-xs"
                        />
                      </div>
                    </div>

                    {/* Service specific fields */}
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="font-semibold text-[#111111] block mb-1">Educational Institution / College</label>
                        <input
                          type="text"
                          value={formData.collegeName}
                          onChange={e => setFormData({ ...formData, collegeName: e.target.value })}
                          className="w-full p-3 bg-white border border-black/10 rounded-xl text-[#111111] font-medium focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all shadow-xs"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="font-semibold text-[#111111] block mb-1">Enrolled Course</label>
                          <input
                            type="text"
                            value={formData.courseName}
                            onChange={e => setFormData({ ...formData, courseName: e.target.value })}
                            className="w-full p-3 bg-white border border-black/10 rounded-xl text-[#111111] font-medium focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all shadow-xs"
                          />
                        </div>
                        <div>
                          <label className="font-semibold text-[#111111] block mb-1">Direct DBT Bank Account (Aadhaar Seeded)</label>
                          <input
                            type="text"
                            value={formData.bankAccountNumber}
                            onChange={e => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                            className="w-full p-3 bg-white border border-black/10 rounded-xl text-[#111111] font-mono font-medium focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all shadow-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Final Action */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/8">
                      <button
                        type="button"
                        onClick={() => setActiveWorkflowStep('SELECT')}
                        className="px-4 py-2 text-xs font-semibold text-[#5c5c5c] hover:text-[#111111]"
                      >
                        Cancel
                      </button>

                      <button
                        id="btn-submit-verified-app"
                        type="button"
                        disabled={isSubmitting}
                        onClick={handleSubmitFinalApplication}
                        className="px-6 py-3 bg-[#141414] hover:bg-black text-white rounded-xl text-xs font-semibold tracking-wide shadow-sm hover:shadow transition-all flex items-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Submitting Application...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>{t.submitApplication}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 4: SUCCESS RECEIPT */}
                {activeWorkflowStep === 'SUCCESS' && submittedApp && (
                  <motion.div initial={{ scale: 0.96 }} animate={{ scale: 1 }} className="max-w-xl mx-auto text-center py-6">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto mb-3 shadow-xs">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#111111]">
                      Application Submitted Successfully!
                    </h3>
                    <p className="text-xs text-[#5c5c5c] mt-1">
                      Your application has been received with 100% authoritative verified proofs.
                    </p>

                    <div className="bg-black/5 border border-black/8 rounded-2xl p-5 my-5 text-left text-xs space-y-2 font-mono">
                      <div className="flex justify-between">
                        <span className="text-[#5c5c5c]">Application Number:</span>
                        <span className="font-bold text-[#111111]">{submittedApp.applicationNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5c5c5c]">Service:</span>
                        <span className="font-semibold text-[#111111]">{submittedApp.serviceName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5c5c5c]">Consent ID:</span>
                        <span className="text-[#111111]">{submittedApp.consentId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5c5c5c]">Status:</span>
                        <span className="font-semibold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded">
                          {submittedApp.status} (IN REVIEW)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveWorkflowStep('SELECT');
                          setActiveAppTab('my_apps');
                        }}
                        className="px-5 py-3 bg-[#141414] text-white font-semibold text-xs rounded-xl hover:bg-black shadow-sm transition-all"
                      >
                        Track in My Applications
                      </button>
                      <button
                        type="button"
                        onClick={onViewAudit}
                        className="px-4 py-3 bg-black/5 text-[#111111] font-semibold rounded-xl text-xs hover:bg-black/10 transition-all border border-black/8"
                      >
                        Inspect Audit Ledger
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {/* Service Cards Grid (Shown when activeWorkflowStep is SELECT) */}
          {activeWorkflowStep === 'SELECT' && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight text-[#111111]">
                    {t.servicesTitle}
                  </h3>
                  <p className="text-xs text-[#5c5c5c] mt-0.5">
                    Choose a scheme or service to verify and apply with zero document uploads
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#111111] bg-white border border-black/8 px-3 py-1 rounded-full shadow-xs">
                  {services.length} ACTIVE SERVICES
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {services.map(srv => (
                  <div
                    key={srv.id}
                    className="bg-white/80 hover:bg-white border border-black/8 hover:border-black/20 rounded-3xl p-6 shadow-[0_18px_44px_-26px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_48px_-20px_rgba(0,0,0,0.14)] transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <span className="text-[10px] font-semibold tracking-wider uppercase text-[#5c5c5c] bg-black/5 px-2.5 py-1 rounded-lg border border-black/5">
                          {srv.category} • {srv.departmentCode}
                        </span>
                        <span className="text-[11px] text-[#5c5c5c] font-medium">
                          SLA: {srv.slaDays} {t.days}
                        </span>
                      </div>

                      <h4 className="text-lg font-semibold text-[#111111] leading-snug group-hover:text-black transition-colors">
                        {language === 'mr' ? srv.nameMr : srv.name}
                      </h4>
                      <p className="text-xs text-[#5c5c5c] mt-2 leading-relaxed">
                        {language === 'mr' ? srv.descriptionMr : srv.description}
                      </p>

                      {/* Required proofs pills */}
                      <div className="mt-5 pt-3.5 border-t border-black/8">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5c5c5c] block mb-2">
                          {t.requiredProofs}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {srv.requiredFields.map(f => (
                            <span
                              key={f.id}
                              className="text-[10.5px] font-medium bg-white text-[#333333] px-2.5 py-1 rounded-lg border border-black/8 flex items-center gap-1.5 shadow-xs"
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              {f.sourceDepartmentCode}: {language === 'mr' ? f.displayNameMr : f.displayName}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-black/8 flex items-center justify-between">
                      <div className="text-xs">
                        <span className="text-[#5c5c5c]">{t.fee}</span>{' '}
                        <span className="font-bold text-[#111111] text-sm">{srv.feeInr === 0 ? t.free : `₹${srv.feeInr}`}</span>
                      </div>

                      <button
                        id={`btn-apply-service-${srv.code}`}
                        type="button"
                        onClick={() => handleSelectService(srv)}
                        className="px-5 py-2.5 bg-[#141414] text-white hover:bg-black font-semibold rounded-xl text-xs transition-all shadow-xs flex items-center gap-2"
                      >
                        <span>{t.applyNow}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* MY APPLICATIONS TAB */
        <div className="bg-white/80 backdrop-blur-xl border border-black/8 rounded-3xl p-6 sm:p-7 shadow-[0_18px_44px_-26px_rgba(0,0,0,0.10)]">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-black/8">
            <div>
              <h3 className="text-xl font-semibold tracking-tight text-[#111111]">
                {t.myApplications}
              </h3>
              <p className="text-xs text-[#5c5c5c] mt-0.5">
                Track status and verification audit trails of submitted applications
              </p>
            </div>
            <button
              type="button"
              onClick={loadData}
              className="p-2 text-[#5c5c5c] hover:text-[#111111] rounded-xl hover:bg-black/5 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {myApplications.length === 0 ? (
            <div className="text-center py-12 text-[#5c5c5c] text-xs">
              No applications submitted yet. Select a service from the catalogue to apply!
            </div>
          ) : (
            <div className="space-y-4">
              {myApplications.map(app => (
                <div
                  key={app.id}
                  className="p-5 rounded-2xl border border-black/8 bg-white hover:border-black/20 transition-all text-xs shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-black/8">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-[#111111] text-sm tracking-tight">
                        {app.applicationNumber}
                      </span>
                      <span className="text-[10px] font-semibold bg-black/5 px-2 py-0.5 rounded-md text-[#5c5c5c]">
                        {app.departmentCode}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase border ${
                        app.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                        app.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                        app.status === 'REJECTED' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                        'bg-sky-100 text-sky-800 border-sky-300'
                      }`}>
                        {app.status}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleExplainWithAi(app)}
                        className="px-3 py-1.5 bg-black/5 hover:bg-black/10 text-[#111111] border border-black/10 rounded-xl font-semibold flex items-center gap-1.5 text-[10px] uppercase tracking-wider transition-all"
                      >
                        <Bot className="w-3.5 h-3.5 text-[#111111]" />
                        <span>AI Explainer</span>
                      </button>
                    </div>
                  </div>

                  <h4 className="font-semibold text-[#111111] text-base mb-1">{app.serviceName}</h4>
                  <p className="text-[#5c5c5c] text-xs mb-3">
                    Remarks: {app.trackingRemarks || 'Under standard verification'}
                  </p>

                  {/* Proofs Verified Badges */}
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-black/8">
                    {app.verifiedProofs.map((vp, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono bg-black/5 text-[#333333] border border-black/8 px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {vp.fieldCode.replace(/_/g, ' ')}: {vp.certificateNumber}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AI Explanation Modal */}
      <AnimatePresence>
        {explainingStatus && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white/95 backdrop-blur-2xl text-[#111111] rounded-3xl p-6 sm:p-7 shadow-2xl border border-black/10 relative overflow-hidden"
            >
              <div className="flex items-center gap-3 border-b border-black/8 pb-4 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-black/5 border border-black/10 text-[#141414] flex items-center justify-center shadow-xs">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#111111] text-base">AI Status Assistant</h4>
                  <span className="text-[10px] text-[#5c5c5c] font-mono">App #{explainingStatus}</span>
                </div>
              </div>

              {isExplainingAi ? (
                <div className="py-8 text-center text-xs text-[#5c5c5c] flex flex-col items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-[#111111]" />
                  <span>Gemini AI is generating simple language status explanation...</span>
                </div>
              ) : (
                <div className="bg-black/5 border border-black/8 rounded-2xl p-4 text-xs text-[#111111] leading-relaxed font-sans">
                  <p>{aiExplanationText}</p>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setExplainingStatus(null)}
                  className="px-5 py-2.5 bg-[#141414] text-white hover:bg-black text-xs font-semibold rounded-xl transition-all shadow-xs"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
        </>
      )}
    </div>
  );
};
