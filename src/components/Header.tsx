/**
 * Mahasetu Top Navigation Bar
 * Features official Maharashtra Government branding, live gateway status,
 * Aadhaar biometric user badge, language switcher, and tab navigation.
 */

import React from 'react';
import {
  ShieldCheck,
  User,
  LogOut,
  Globe,
  Radio,
  Building2,
  FileCheck2,
  ScrollText,
  Bot,
  Layers,
  Database,
  Fingerprint,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { CitizenUser, OfficerUser } from '../types.ts';
import { Language, TRANSLATIONS } from '../locales.ts';

interface Props {
  activeTab: 'schemes' | 'citizen' | 'consent' | 'audit' | 'ai' | 'officer';
  setActiveTab: (tab: 'schemes' | 'citizen' | 'consent' | 'audit' | 'ai' | 'officer') => void;
  currentUser: CitizenUser | OfficerUser | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  departmentsCount: number;
}

export const Header: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuthModal,
  onLogout,
  language,
  setLanguage,
  departmentsCount
}) => {
  const t = TRANSLATIONS[language];

  return (
    <header className="sticky top-0 z-40 bg-white/80 border-b border-black/8 backdrop-blur-xl text-[#111111]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Main Brand Row */}
        <div className="flex items-center justify-between py-3 border-b border-black/5">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 shrink-0 flex items-center justify-center overflow-hidden">
              <img
                src="/mahasetu-logo.png"
                alt="Mahasetu Logo"
                className="w-full h-full object-contain hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#5c5c5c] font-medium hidden sm:inline-block">
                  {t.govDepartment}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111111] font-marathi-calligraphy">
                  महासेतू
                </h1>
                <span className="text-[10.5px] tracking-wider text-[#5c5c5c] uppercase hidden md:inline-block">
                  v1.0.4
                </span>
              </div>
            </div>
          </div>

          {/* Right Header Controls: Telemetry, Language, Auth Pill */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Gateway Health Indicator */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-black/8 text-xs font-medium text-[#4a4a4a] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{departmentsCount || 5}/5 {t.nodesOnline}</span>
              <span className="text-[10px] text-emerald-700 font-semibold">14ms</span>
            </div>

            {/* User Profile / Biometric Badge */}
            {currentUser ? (
              <div className="flex items-center gap-2 bg-white/95 border border-black/10 rounded-2xl p-1.5 pl-3 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-black/5 border border-black/10 text-[#111111] flex items-center justify-center shadow-xs">
                      <User className="w-4.5 h-4.5 text-[#111111]" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                      <ShieldCheck className="w-2 h-2 text-white" />
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-bold text-[#111111] leading-tight truncate max-w-[140px]">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-[#5c5c5c] font-mono flex items-center gap-1 mt-0.5">
                      <Fingerprint className="w-2.5 h-2.5 text-[#141414]" />
                      {currentUser.maskedAadhaar}
                    </div>
                  </div>
                </div>

                <div className="h-6 w-[1px] bg-black/10 mx-1 hidden sm:block" />

                <button
                  type="button"
                  title={t.switchUser}
                  onClick={onOpenAuthModal}
                  className="p-1.5 text-[#5c5c5c] hover:text-[#111111] hover:bg-black/5 rounded-lg transition-all"
                >
                  <Fingerprint className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  title={t.logout}
                  onClick={onLogout}
                  className="p-1.5 text-[#5c5c5c] hover:text-rose-600 hover:bg-black/5 rounded-lg transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#141414] hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                <Fingerprint className="w-4.5 h-4.5 text-amber-400" />
                <span>{t.aadhaarAuth}</span>
              </button>
            )}
          </div>
        </div>

        {/* Role-Aware Tab Navigation */}
        <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-2 no-scrollbar text-xs font-medium">
          {/* If Logged in as Officer: Show Officer Workbench & Administrative Tools */}
          {currentUser?.role === 'officer' ? (
            <>
              <button
                id="tab-nav-officer"
                onClick={() => setActiveTab('officer')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                  activeTab === 'officer'
                    ? 'bg-[#141414] text-white font-semibold shadow-xs'
                    : 'text-[#5c5c5c] hover:text-[#111111] hover:bg-black/5'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.navOfficer}</span>
                <span className="text-[9px] bg-emerald-700 text-white px-1.5 py-0.5 rounded-full font-bold">
                  Active
                </span>
              </button>

              <button
                id="tab-nav-schemes"
                onClick={() => setActiveTab('schemes')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                  activeTab === 'schemes'
                    ? 'bg-[#141414] text-white font-semibold shadow-xs'
                    : 'text-[#5c5c5c] hover:text-[#111111] hover:bg-black/5'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                <span>{t.navSchemes}</span>
              </button>

              <button
                id="tab-nav-audit"
                onClick={() => setActiveTab('audit')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                  activeTab === 'audit'
                    ? 'bg-[#141414] text-white font-semibold shadow-xs'
                    : 'text-[#5c5c5c] hover:text-[#111111] hover:bg-black/5'
                }`}
              >
                <ScrollText className="w-3.5 h-3.5" />
                <span>{t.navAudit}</span>
              </button>

              <button
                id="tab-nav-ai"
                onClick={() => setActiveTab('ai')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                  activeTab === 'ai'
                    ? 'bg-[#141414] text-white font-semibold shadow-xs'
                    : 'text-[#5c5c5c] hover:text-[#111111] hover:bg-black/5'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>{t.navAiSahayak}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${activeTab === 'ai' ? 'bg-white/20 text-white' : 'bg-black/5 text-[#5c5c5c]'}`}>
                  Gemini
                </span>
              </button>
            </>
          ) : currentUser?.role === 'citizen' ? (
            /* If Logged in as Citizen: Show Citizen Portal, Consents & Applications */
            <>
              <button
                id="tab-nav-citizen"
                onClick={() => setActiveTab('citizen')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                  activeTab === 'citizen'
                    ? 'bg-[#141414] text-white font-semibold shadow-xs'
                    : 'text-[#5c5c5c] hover:text-[#111111] hover:bg-black/5'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>{t.navCitizen}</span>
              </button>

              <button
                id="tab-nav-schemes"
                onClick={() => setActiveTab('schemes')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                  activeTab === 'schemes'
                    ? 'bg-[#141414] text-white font-semibold shadow-xs'
                    : 'text-[#5c5c5c] hover:text-[#111111] hover:bg-black/5'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                <span>{t.navSchemes || 'All Schemes (4,709+)'}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === 'schemes' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-800'}`}>
                  4.7k
                </span>
              </button>

              <button
                id="tab-nav-consent"
                onClick={() => setActiveTab('consent')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                  activeTab === 'consent'
                    ? 'bg-[#141414] text-white font-semibold shadow-xs'
                    : 'text-[#5c5c5c] hover:text-[#111111] hover:bg-black/5'
                }`}
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>{t.navConsent}</span>
              </button>

              <button
                id="tab-nav-audit"
                onClick={() => setActiveTab('audit')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                  activeTab === 'audit'
                    ? 'bg-[#141414] text-white font-semibold shadow-xs'
                    : 'text-[#5c5c5c] hover:text-[#111111] hover:bg-black/5'
                }`}
              >
                <ScrollText className="w-3.5 h-3.5" />
                <span>{t.navAudit}</span>
              </button>

              <button
                id="tab-nav-ai"
                onClick={() => setActiveTab('ai')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                  activeTab === 'ai'
                    ? 'bg-[#141414] text-white font-semibold shadow-xs'
                    : 'text-[#5c5c5c] hover:text-[#111111] hover:bg-black/5'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>{t.navAiSahayak}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${activeTab === 'ai' ? 'bg-white/20 text-white' : 'bg-black/5 text-[#5c5c5c]'}`}>
                  Gemini
                </span>
              </button>
            </>
          ) : (
            /* If Unauthenticated: Public Directory & Discovery Tabs Only */
            <>
              <button
                id="tab-nav-schemes"
                onClick={() => setActiveTab('schemes')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                  activeTab === 'schemes'
                    ? 'bg-[#141414] text-white font-semibold shadow-xs'
                    : 'text-[#5c5c5c] hover:text-[#111111] hover:bg-black/5'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                <span>{t.navSchemes || 'All Schemes (4,709+)'}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === 'schemes' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-800'}`}>
                  4.7k
                </span>
              </button>

              <button
                id="tab-nav-ai"
                onClick={() => setActiveTab('ai')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                  activeTab === 'ai'
                    ? 'bg-[#141414] text-white font-semibold shadow-xs'
                    : 'text-[#5c5c5c] hover:text-[#111111] hover:bg-black/5'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>{t.navAiSahayak}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${activeTab === 'ai' ? 'bg-white/20 text-white' : 'bg-black/5 text-[#5c5c5c]'}`}>
                  Gemini
                </span>
              </button>

              <button
                id="tab-nav-audit"
                onClick={() => setActiveTab('audit')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                  activeTab === 'audit'
                    ? 'bg-[#141414] text-white font-semibold shadow-xs'
                    : 'text-[#5c5c5c] hover:text-[#111111] hover:bg-black/5'
                }`}
              >
                <ScrollText className="w-3.5 h-3.5" />
                <span>{t.navAudit}</span>
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
