import React from 'react';
import {
  ShieldCheck,
  Fingerprint,
  BookOpen,
  Lock,
  FileText,
  Layers,
  HelpCircle,
  Activity,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Building2,
  Database,
  ScrollText
} from 'lucide-react';
import { DocTopicId } from './DocumentationModal.tsx';
import { Language, TRANSLATIONS } from '../locales.ts';

interface FooterProps {
  language?: Language;
  onOpenDoc: (topicId: DocTopicId) => void;
  onNavigateTab: (tab: 'citizen' | 'consent' | 'audit' | 'ai' | 'officer' | 'gateway' | 'supabase') => void;
}

export function Footer({ language = 'en', onOpenDoc, onNavigateTab }: FooterProps) {
  const t = TRANSLATIONS[language];
  const isMr = language === 'mr';
  const isHi = language === 'hi';

  return (
    <footer className="border-t border-black/8 bg-white/75 backdrop-blur-xl mt-auto relative z-10">
      {/* Top Decorative Subtle Line */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-black/10 to-transparent" />

      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Column 1: Brand & State Mission (Span 4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 shrink-0 flex items-center justify-center overflow-hidden">
                <img
                  src="/mahasetu-logo.png"
                  alt="Mahasetu Logo"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="text-[11px] font-medium text-[#5c5c5c] block mb-0.5">
                  {t.govDepartment}
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111111] font-marathi-calligraphy">
                  {t.portalTitle}
                </div>
              </div>
            </div>

            <p className="text-xs text-[#5c5c5c] leading-relaxed max-w-sm">
              {t.footerMission}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                UIDAI 2.5 Biometric
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/5 border border-black/8 text-[#111111] text-[11px] font-medium">
                <Lock className="w-3 h-3 text-[#111111]" />
                DPDP 2023 Compliant
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/5 border border-black/8 text-[#5c5c5c] text-[11px] font-medium">
                SHA-256 Hash Chained
              </span>
            </div>
          </div>

          {/* Column 2: Platform Documentation (Span 2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#141414]" />
              {t.documentation}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenDoc('working')}
                  className="text-[#5c5c5c] hover:text-[#111111] transition-colors text-left flex items-center gap-1 group"
                >
                  <ChevronRight className="w-3 h-3 text-black/20 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                  <span>{t.howItWorks}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenDoc('architecture')}
                  className="text-[#5c5c5c] hover:text-[#111111] transition-colors text-left flex items-center gap-1 group"
                >
                  <ChevronRight className="w-3 h-3 text-black/20 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                  <span>{t.systemArchitecture}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenDoc('api')}
                  className="text-[#5c5c5c] hover:text-[#111111] transition-colors text-left flex items-center gap-1 group"
                >
                  <ChevronRight className="w-3 h-3 text-black/20 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                  <span>{t.apiDocs}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenDoc('status')}
                  className="text-[#5c5c5c] hover:text-[#111111] transition-colors text-left flex items-center gap-1 group"
                >
                  <ChevronRight className="w-3 h-3 text-black/20 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                  <span>{isMr ? 'सिस्टम क्लाउड स्थिती' : isHi ? 'क्लाउड स्थिति' : 'System Cloud Status'}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab('gateway')}
                  className="text-emerald-800 font-medium hover:text-emerald-950 transition-colors text-left flex items-center gap-1 group mt-1"
                >
                  <ArrowUpRight className="w-3 h-3" />
                  <span>{isMr ? 'लाइव्ह अडॅप्टर बेंच' : isHi ? 'लाइव एडॉप्टर बेंच' : 'Live Adapter Bench'}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Citizen Security & Privacy (Span 2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#141414]" />
              {t.navConsent}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenDoc('security')}
                  className="text-[#5c5c5c] hover:text-[#111111] transition-colors text-left flex items-center gap-1 group font-medium text-[#111111]"
                >
                  <ChevronRight className="w-3 h-3 text-black/20 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                  <span>{t.securityCompliance}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenDoc('dpdp')}
                  className="text-[#5c5c5c] hover:text-[#111111] transition-colors text-left flex items-center gap-1 group"
                >
                  <ChevronRight className="w-3 h-3 text-black/20 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                  <span>{isMr ? 'DPDP कायदा २०२३ अधिकार' : isHi ? 'DPDP अधिनियम 2023 अधिकार' : 'DPDP Act 2023 Rights'}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenDoc('aadhaar')}
                  className="text-[#5c5c5c] hover:text-[#111111] transition-colors text-left flex items-center gap-1 group"
                >
                  <ChevronRight className="w-3 h-3 text-black/20 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                  <span>{isMr ? 'बायोमेट्रिक सुरक्षा' : isHi ? 'बायोमेट्रिक सुरक्षा' : 'Biometric Protection'}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenDoc('audit')}
                  className="text-[#5c5c5c] hover:text-[#111111] transition-colors text-left flex items-center gap-1 group"
                >
                  <ChevronRight className="w-3 h-3 text-black/20 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                  <span>{t.navAudit}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab('consent')}
                  className="text-[#111111] font-medium hover:underline transition-colors text-left flex items-center gap-1 group mt-1"
                >
                  <ArrowUpRight className="w-3 h-3" />
                  <span>{t.navConsent}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Connected Departments (Span 2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#141414]" />
              {isMr ? 'शासकीय विभाग' : isHi ? 'सरकारी विभाग' : 'State Bridges'}
            </h4>
            <ul className="space-y-2 text-xs text-[#5c5c5c]">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab('citizen')}
                  className="hover:text-[#111111] transition-colors text-left flex items-center gap-1 group"
                >
                  <ChevronRight className="w-3 h-3 text-black/20 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                  <span>{isMr ? 'महसूल विभाग (७/१२ जमीन)' : isHi ? 'राजस्व विभाग (7/12 खसरा)' : 'Revenue (7/12 Land)'}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab('citizen')}
                  className="hover:text-[#111111] transition-colors text-left flex items-center gap-1 group"
                >
                  <ChevronRight className="w-3 h-3 text-black/20 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                  <span>{isMr ? 'जिल्हा प्रशासन (उत्पन्न/जात)' : isHi ? 'जिला प्रशासन (आय/जाति)' : 'District Administration'}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab('citizen')}
                  className="hover:text-[#111111] transition-colors text-left flex items-center gap-1 group"
                >
                  <ChevronRight className="w-3 h-3 text-black/20 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                  <span>{isMr ? 'परिवहन विभाग (वाहन RTO)' : isHi ? 'परिवहन विभाग (वाहन RTO)' : 'Transport (Vahan RTO)'}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab('citizen')}
                  className="hover:text-[#111111] transition-colors text-left flex items-center gap-1 group"
                >
                  <ChevronRight className="w-3 h-3 text-black/20 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                  <span>{isMr ? 'उच्च व तंत्रशिक्षण विभाग' : isHi ? 'उच्च व तकनीकी शिक्षा' : 'Higher & Tech Education'}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab('audit')}
                  className="text-[#111111] font-medium hover:underline transition-colors text-left flex items-center gap-1 group mt-1"
                >
                  <ArrowUpRight className="w-3 h-3" />
                  <span>{isMr ? 'ऑडिट ट्रेल तपासा' : isHi ? 'ऑडिट ट्रेल जांचें' : 'Verify Audit Trail'}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 5: Legal & Help (Span 2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-[#141414]" />
              {t.quickLinks}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenDoc('helpdesk')}
                  className="text-[#5c5c5c] hover:text-[#111111] transition-colors text-left flex items-center gap-1 group"
                >
                  <ChevronRight className="w-3 h-3 text-black/20 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                  <span>{isMr ? 'नागरिक मदत कक्ष (Helpdesk)' : isHi ? 'नागरिक सहायता कक्ष' : 'Citizen Helpdesk'}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenDoc('privacy')}
                  className="text-[#5c5c5c] hover:text-[#111111] transition-colors text-left flex items-center gap-1 group"
                >
                  <ChevronRight className="w-3 h-3 text-black/20 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                  <span>{isMr ? 'गोपनीयता धोरण (Privacy)' : isHi ? 'गोपनीयता नीति' : 'Privacy Policy'}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenDoc('terms')}
                  className="text-[#5c5c5c] hover:text-[#111111] transition-colors text-left flex items-center gap-1 group"
                >
                  <ChevronRight className="w-3 h-3 text-black/20 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                  <span>{isMr ? 'सेवा अटी व शर्ती' : isHi ? 'सेवा की शर्तें' : 'Terms of Service (RTS)'}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab('ai')}
                  className="text-amber-800 font-medium hover:text-amber-950 transition-colors text-left flex items-center gap-1 group mt-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{t.navAiSahayak}</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Governance & Sovereignty */}
        <div className="mt-12 pt-6 border-t border-black/8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#5c5c5c]">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-center sm:text-left">
            <span className="font-semibold text-[#111111]">
              © {new Date().getFullYear()} {t.allRightsReserved}
            </span>
            <span className="hidden sm:inline text-black/20">•</span>
            <span>{isMr ? 'माहिती तंत्रज्ञान संचालनालय (MahaIT)' : isHi ? 'सूचना प्रौद्योगिकी निदेशालय (MahaIT)' : 'Directorate of Information Technology (MahaIT)'}</span>
            <span className="hidden sm:inline text-black/20">•</span>
            <span>{isMr ? 'डिजिटल सार्वजनिक पायाभूत सुविधा' : isHi ? 'डिजिटल सार्वजनिक अवसंरचना' : 'Digital Public Infrastructure'}</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              type="button"
              onClick={() => onOpenDoc('status')}
              className="flex items-center gap-1.5 text-emerald-800 hover:text-emerald-950 font-medium"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{isMr ? 'राज्य क्लाउड सक्रिय (९९.९८%)' : isHi ? 'राज्य क्लाउड सक्रिय (99.98%)' : 'State Cloud Operational (99.98%)'}</span>
            </button>
            <span className="text-black/20">•</span>
            <button
              type="button"
              onClick={() => onOpenDoc('security')}
              className="text-[#5c5c5c] hover:text-[#111111] transition-colors"
            >
              {isMr ? 'सुरक्षा सूचना' : isHi ? 'सुरक्षा सलाह' : 'Security Advisory'}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

