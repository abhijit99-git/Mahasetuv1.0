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

interface FooterProps {
  onOpenDoc: (topicId: DocTopicId) => void;
  onNavigateTab: (tab: 'citizen' | 'consent' | 'audit' | 'ai' | 'officer' | 'gateway' | 'supabase') => void;
}

export function Footer({ onOpenDoc, onNavigateTab }: FooterProps) {
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
                  Government of Maharashtra
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111111] font-marathi-calligraphy">
                  महासेतू
                </div>
              </div>
            </div>

            <p className="text-xs text-[#5c5c5c] leading-relaxed max-w-sm">
              The unified digital public infrastructure for Maharashtra. Enables instant, 100% paperless verification of citizen records between state departments with zero physical uploads, biometric authentication, and strict DPDP Act 2023 compliance.
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
              Documentation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenDoc('working')}
                  className="text-[#5c5c5c] hover:text-[#111111] transition-colors text-left flex items-center gap-1 group"
                >
                  <ChevronRight className="w-3 h-3 text-black/20 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                  <span>How Mahasetu Works</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenDoc('architecture')}
                  className="text-[#5c5c5c] hover:text-[#111111] transition-colors text-left flex items-center gap-1 group"
                >
                  <ChevronRight className="w-3 h-3 text-black/20 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                  <span>System Architecture</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenDoc('api')}
                  className="text-[#5c5c5c] hover:text-[#111111] transition-colors text-left flex items-center gap-1 group"
                >
                  <ChevronRight className="w-3 h-3 text-black/20 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                  <span>Adapter &amp; API Specs</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenDoc('status')}
                  className="text-[#5c5c5c] hover:text-[#111111] transition-colors text-left flex items-center gap-1 group"
                >
                  <ChevronRight className="w-3 h-3 text-black/20 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                  <span>System Cloud Status</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab('gateway')}
                  className="text-emerald-800 font-medium hover:text-emerald-950 transition-colors text-left flex items-center gap-1 group mt-1"
                >
                  <ArrowUpRight className="w-3 h-3" />
                  <span>Live Adapter Bench</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Citizen Security & Privacy (Span 2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#141414]" />
              Citizen Security
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenDoc('security')}
                  className="text-[#5c5c5c] hover:text-[#111111] transition-colors text-left flex items-center gap-1 group font-medium text-[#111111]"
                >
                  <ChevronRight className="w-3 h-3 text-black/20 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                  <span>What Citizens Must Know</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenDoc('dpdp')}
                  className="text-[#5c5c5c] hover:text-[#111111] transition-colors text-left flex items-center gap-1 group"
                >
                  <ChevronRight className="w-3 h-3 text-black/20 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                  <span>DPDP Act 2023 Rights</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenDoc('aadhaar')}
                  className="text-[#5c5c5c] hover:text-[#111111] transition-colors text-left flex items-center gap-1 group"
                >
                  <ChevronRight className="w-3 h-3 text-black/20 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                  <span>Biometric Protection</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenDoc('audit')}
                  className="text-[#5c5c5c] hover:text-[#111111] transition-colors text-left flex items-center gap-1 group"
                >
                  <ChevronRight className="w-3 h-3 text-black/20 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                  <span>Cryptographic Ledger</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab('consent')}
                  className="text-[#111111] font-medium hover:underline transition-colors text-left flex items-center gap-1 group mt-1"
                >
                  <ArrowUpRight className="w-3 h-3" />
                  <span>Consent Center</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Connected Departments (Span 2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#141414]" />
              State Bridges
            </h4>
            <ul className="space-y-2 text-xs text-[#5c5c5c]">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab('citizen')}
                  className="hover:text-[#111111] transition-colors text-left flex items-center gap-1 group"
                >
                  <ChevronRight className="w-3 h-3 text-black/20 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                  <span>Revenue (7/12 Land)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab('citizen')}
                  className="hover:text-[#111111] transition-colors text-left flex items-center gap-1 group"
                >
                  <ChevronRight className="w-3 h-3 text-black/20 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                  <span>District Administration</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab('citizen')}
                  className="hover:text-[#111111] transition-colors text-left flex items-center gap-1 group"
                >
                  <ChevronRight className="w-3 h-3 text-black/20 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                  <span>Transport (Vahan RTO)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab('citizen')}
                  className="hover:text-[#111111] transition-colors text-left flex items-center gap-1 group"
                >
                  <ChevronRight className="w-3 h-3 text-black/20 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                  <span>Higher &amp; Tech Education</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab('audit')}
                  className="text-[#111111] font-medium hover:underline transition-colors text-left flex items-center gap-1 group mt-1"
                >
                  <ArrowUpRight className="w-3 h-3" />
                  <span>Verify Audit Trail</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 5: Legal & Help (Span 2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-[#141414]" />
              Help &amp; Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenDoc('helpdesk')}
                  className="text-[#5c5c5c] hover:text-[#111111] transition-colors text-left flex items-center gap-1 group"
                >
                  <ChevronRight className="w-3 h-3 text-black/20 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                  <span>Citizen Helpdesk</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenDoc('helpdesk')}
                  className="text-[#5c5c5c] hover:text-[#111111] transition-colors text-left flex items-center gap-1 group"
                >
                  <ChevronRight className="w-3 h-3 text-black/20 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                  <span>Grievance Escalation</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenDoc('privacy')}
                  className="text-[#5c5c5c] hover:text-[#111111] transition-colors text-left flex items-center gap-1 group"
                >
                  <ChevronRight className="w-3 h-3 text-black/20 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                  <span>Privacy Policy</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenDoc('terms')}
                  className="text-[#5c5c5c] hover:text-[#111111] transition-colors text-left flex items-center gap-1 group"
                >
                  <ChevronRight className="w-3 h-3 text-black/20 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                  <span>Terms of Service (RTS)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab('ai')}
                  className="text-amber-800 font-medium hover:text-amber-950 transition-colors text-left flex items-center gap-1 group mt-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>AI Sahayak Chat</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Governance & Sovereignty */}
        <div className="mt-12 pt-6 border-t border-black/8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#5c5c5c]">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-center sm:text-left">
            <span className="font-semibold text-[#111111]">
              © {new Date().getFullYear()} Government of Maharashtra.
            </span>
            <span className="hidden sm:inline text-black/20">•</span>
            <span>Directorate of Information Technology (MahaIT)</span>
            <span className="hidden sm:inline text-black/20">•</span>
            <span>Digital Public Infrastructure</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              type="button"
              onClick={() => onOpenDoc('status')}
              className="flex items-center gap-1.5 text-emerald-800 hover:text-emerald-950 font-medium"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>State Cloud Operational (99.98%)</span>
            </button>
            <span className="text-black/20">•</span>
            <button
              type="button"
              onClick={() => onOpenDoc('security')}
              className="text-[#5c5c5c] hover:text-[#111111] transition-colors"
            >
              Security Advisory
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
