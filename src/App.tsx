/**
 * Mahasetu (महासेतू) - Maharashtra Government Interoperability Platform
 * System Integration and Interoperability among Government Digital Platforms
 * 
 * Strict Aadhaar Biometric Authentication Only
 * Federated Consent & Canonical Data Exchange Layer
 */

import React, { useState, useEffect } from 'react';
import { HeroSection } from './components/HeroSection.tsx';
import { Header } from './components/Header.tsx';
import { SchemesCatalogue } from './components/SchemesCatalogue.tsx';
import { AadhaarBiometricAuthModal } from './components/AadhaarBiometricAuthModal.tsx';
import { CitizenPortal } from './components/CitizenPortal.tsx';
import { ConsentCenter } from './components/ConsentCenter.tsx';
import { AuditLedger } from './components/AuditLedger.tsx';
import { AISahayak } from './components/AISahayak.tsx';
import { OfficerPortal } from './components/OfficerPortal.tsx';
import { GatewayInspector } from './components/GatewayInspector.tsx';
import { SupabaseHub } from './components/SupabaseHub.tsx';
import { WelcomeGreetingModal } from './components/WelcomeGreetingModal.tsx';
import { Footer } from './components/Footer.tsx';
import { DocumentationModal, DocTopicId } from './components/DocumentationModal.tsx';
import { CitizenUser, OfficerUser, WelfareScheme } from './types.ts';
import { Language, TRANSLATIONS } from './locales.ts';
import { ShieldCheck, Fingerprint, Sparkles, ArrowUp } from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<'schemes' | 'citizen' | 'consent' | 'audit' | 'ai' | 'officer' | 'gateway' | 'supabase'>('schemes');
  
  // Welcome Greeting Overlay state (opens automatically on site load)
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(true);

  // Current user state (starts blank/null on initial site load for live Aadhaar signup/login)
  const [currentUser, setCurrentUser] = useState<CitizenUser | OfficerUser | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [departmentsCount, setDepartmentsCount] = useState(5);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [docTopic, setDocTopic] = useState<DocTopicId>('working');

  const handleOpenDoc = (topicId: DocTopicId) => {
    setDocTopic(topicId);
    setIsDocModalOpen(true);
  };

  const t = TRANSLATIONS[language];

  useEffect(() => {
    fetch('/api/departments')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDepartmentsCount(data.length);
      })
      .catch(() => {});
  }, []);

  // Restore logged-in user session from localStorage on app load
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('mahasetu_active_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.id) {
          setCurrentUser(parsed);
          setActiveTab(parsed.role === 'officer' ? 'officer' : 'citizen');
          setIsWelcomeModalOpen(false);
        }
      }
    } catch (e) {
      console.warn('Could not restore session from localStorage:', e);
    }
  }, []);

  // Listen for Supabase Magic Link / Auth Callback redirects
  useEffect(() => {
    const handleAuthCallback = async () => {
      const hash = window.location.hash;
      const search = window.location.search;

      if (
        hash.includes('access_token') ||
        hash.includes('verify-supabase-session') ||
        search.includes('code=') ||
        search.includes('verify_email=') ||
        search.includes('verify_aadhaar=')
      ) {
        const params = new URLSearchParams(hash.replace(/^#/, '') || search.replace(/^\?/, ''));
        const accessToken = params.get('access_token');
        const email = params.get('email') || params.get('verify_email');
        const aadhaarNumber = params.get('aadhaar') || params.get('verify_aadhaar');
        const otp = params.get('otp');

        if (accessToken || email || aadhaarNumber) {
          try {
            const res = await fetch('/api/auth/verify-supabase-session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email,
                aadhaarNumber,
                otp,
                accessToken
              })
            });
            const data = await res.json();
            if (data.success && data.citizen) {
              handleCitizenAuthenticated(data.citizen);
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          } catch (e) {
            console.warn('Error handling Supabase callback:', e);
          }
        }
      }
    };

    handleAuthCallback();
    window.addEventListener('hashchange', handleAuthCallback);
    return () => window.removeEventListener('hashchange', handleAuthCallback);
  }, []);

  const handleCitizenAuthenticated = (citizen: CitizenUser) => {
    setCurrentUser(citizen);
    try {
      localStorage.setItem('mahasetu_active_user', JSON.stringify(citizen));
    } catch (e) {}
    setIsWelcomeModalOpen(false);
    setIsAuthModalOpen(false);
    setActiveTab('citizen');

    setTimeout(() => {
      const workspace = document.getElementById('portal-workspace');
      if (workspace) {
        workspace.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  const handleOfficerAuthenticated = (officer: OfficerUser) => {
    setCurrentUser(officer);
    try {
      localStorage.setItem('mahasetu_active_user', JSON.stringify(officer));
    } catch (e) {}
    setIsAuthModalOpen(false);
    setActiveTab('officer');
  };

  const handleUpdateUser = (updatedUser: CitizenUser) => {
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('mahasetu_active_user', JSON.stringify(updatedUser));
    } catch (e) {}
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('mahasetu_active_user');
    } catch (e) {}
    setIsAuthModalOpen(true);
  };

  const handleScrollToHero = () => {
    const el = document.getElementById('hero');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#eef2ee] text-[#111111] flex flex-col font-sans selection:bg-[#141414] selection:text-white relative overflow-x-hidden">
      {/* Ambient background glow orbs */}
      <div className="fixed top-[-10%] right-[-10%] w-[650px] h-[650px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[550px] h-[550px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* FULL-VIEWPORT HERO SECTION (Spec UI with background video, Poppins typography, prompt card) */}
      <HeroSection
        onNavigateToTab={(tab) => setActiveTab(tab)}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        language={language}
        setLanguage={setLanguage}
        onSelectServiceFromHero={(serviceCode) => {
          setActiveTab('citizen');
        }}
      />

      {/* MAHASETU WORKSPACE & DETAILED PORTALS */}
      <div id="portal-workspace" className="relative z-10 flex flex-col flex-1">
        {/* Top Header for Workspace View */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
          language={language}
          setLanguage={setLanguage}
          departmentsCount={departmentsCount}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
          {/* If no user is logged in, show prompt to authenticate via Aadhaar */}
          {!currentUser && (
            <div className="max-w-xl mx-auto my-12 bg-white/75 backdrop-blur-xl border border-black/8 rounded-3xl p-8 text-center shadow-[0_18px_44px_-26px_rgba(0,0,0,0.12)] space-y-6 relative overflow-hidden group">
              <div className="w-16 h-16 rounded-2xl bg-[#111815] text-amber-400 flex items-center justify-center mx-auto shadow-sm">
                <Fingerprint className="w-8 h-8" />
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-black/10 text-[#111111] text-[11px] font-medium tracking-wide">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Aadhaar Identity Gateway</span>
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-[#111111] mt-3">
                  Sign In with Aadhaar & Email OTP
                </h2>
                <p className="text-xs text-[#5c5c5c] max-w-md mx-auto mt-2 leading-relaxed">
                  To access the Mahasetu Interoperability Layer, please verify your identity using your 12-digit Aadhaar UID Number and linked Email OTP code.
                </p>
              </div>

              <button
                id="btn-trigger-aadhaar-login"
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#141414] hover:bg-black text-white font-medium text-xs rounded-xl shadow-sm hover:shadow transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Fingerprint className="w-4 h-4 text-emerald-400" />
                <span>Sign In / Sign Up with Aadhaar</span>
              </button>
            </div>
          )}

          {/* Tab 0: All Indian Government & Maharashtra Welfare Schemes Directory (4,709+ Schemes) */}
          {activeTab === 'schemes' && (
            <SchemesCatalogue
              language={language}
              onSelectSchemeForApplication={(scheme: WelfareScheme) => {
                setActiveTab('citizen');
                const workspace = document.getElementById('portal-workspace');
                if (workspace) workspace.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          )}

          {/* Tab 1: Citizen Portal */}
          {currentUser && activeTab === 'citizen' && (
            <CitizenPortal
              citizen={currentUser as CitizenUser}
              language={language}
              onViewAudit={() => setActiveTab('audit')}
              onViewConsents={() => setActiveTab('consent')}
              onUpdateCitizen={(updated) => handleUpdateUser(updated)}
            />
          )}

          {/* Tab 2: Consent & Privacy Center */}
          {currentUser && activeTab === 'consent' && (
            <ConsentCenter
              citizen={currentUser as CitizenUser}
              language={language}
              onViewAudit={() => setActiveTab('audit')}
            />
          )}

          {/* Tab 3: Immutable Cryptographic Audit Ledger */}
          {activeTab === 'audit' && (
            <AuditLedger language={language} />
          )}

          {/* Tab 4: AI Citizen Sahayak (Gemini 3.8 Flash) */}
          {activeTab === 'ai' && (
            <AISahayak
              language={language}
              onApplyForService={() => {
                setActiveTab('citizen');
              }}
            />
          )}

          {/* Tab 5: Department Officer Portal */}
          {activeTab === 'officer' && (
            <OfficerPortal
              officer={currentUser && 'department' in currentUser ? (currentUser as OfficerUser) : null}
              language={language}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
            />
          )}

          {/* Tab 6: Interoperability Gateway & Adapters */}
          {activeTab === 'gateway' && (
            <GatewayInspector language={language} />
          )}

          {/* Tab 7: Supabase Hub & Production Architecture */}
          {activeTab === 'supabase' && (
            <SupabaseHub language={language} />
          )}
        </main>
      </div>

      {/* Welcome to Mahasetu Greeting Animation Overlay */}
      <WelcomeGreetingModal
        isOpen={isWelcomeModalOpen}
        onProceedToAadhaar={() => {
          setIsWelcomeModalOpen(false);
          setIsAuthModalOpen(true);
        }}
        language={language}
      />

      {/* Aadhaar Biometric Authentication Modal */}
      <AadhaarBiometricAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onCitizenAuthenticated={handleCitizenAuthenticated}
        onOfficerAuthenticated={handleOfficerAuthenticated}
        currentLanguage={language}
      />

      {/* Floating Return to Hero Button */}
      <div className="fixed bottom-16 right-6 z-40">
        <button
          type="button"
          onClick={handleScrollToHero}
          className="px-3 py-2 rounded-full bg-white/90 hover:bg-white text-[#111111] border border-black/10 backdrop-blur-md shadow-lg text-xs font-medium flex items-center gap-1.5 transition-all hover:scale-105"
          title="Return to Hero"
        >
          <ArrowUp className="w-3.5 h-3.5 text-[#141414]" />
          <span className="hidden sm:inline">Hero View</span>
        </button>
      </div>

      {/* Official Government Standard Frosted Footer */}
      <Footer
        onOpenDoc={handleOpenDoc}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          const el = document.getElementById('portal-workspace');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Comprehensive Working Documentation & Citizen Security Modal */}
      <DocumentationModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        initialTopic={docTopic}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          const el = document.getElementById('portal-workspace');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />
    </div>
  );
}
