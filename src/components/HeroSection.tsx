/**
 * Mahasetu (महासेतू) - Maharashtra Government Interoperability & Consent Layer
 * Modern Hero Section: High-Impact GovTech & Federated Data Mesh Interface
 * 
 * Features:
 * - Maharashtra Government Interoperability branding
 * - Live Federated Mesh Topology visualizer (Revenue, MahaDBT, Higher Ed, Transport, UIDAI)
 * - Multilingual AI Sahayak with voice recognition and instant canonical proof resolution
 * - Strict Aadhaar Biometric Authentication status & quick actions
 * - 4-Pillar Architecture Grid (Biometrics, Zero-Upload Adapters, DPDP Consent, SHA-256 Audit)
 */

import React, { useState, useEffect, useRef } from 'react';
import { CitizenUser, OfficerUser } from '../types.ts';
import { Language, TRANSLATIONS } from '../locales.ts';
import {
  ShieldCheck,
  Fingerprint,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Building2,
  Network,
  Lock,
  FileCheck2,
  Layers,
  Activity,
  Mic,
  Search,
  ChevronDown,
  Database,
  ExternalLink,
  ChevronRight,
  Cpu,
  Zap,
  Globe,
  Radio,
  Share2,
  Eye,
  Check,
  RefreshCw,
  Landmark,
  GraduationCap,
  BookOpen,
  Car
} from 'lucide-react';

interface Props {
  onNavigateToTab: (tab: 'schemes' | 'citizen' | 'consent' | 'audit' | 'ai' | 'officer' | 'gateway' | 'supabase') => void;
  currentUser: CitizenUser | OfficerUser | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  onSelectServiceFromHero?: (serviceCode: string) => void;
}

interface DepartmentNode {
  id: string;
  name: string;
  nameMr: string;
  code: string;
  category: string;
  status: 'ONLINE' | 'SYNCED' | 'STANDBY';
  records: string;
  schema: string;
  sampleProof: string;
  latency: string;
}

export const HeroSection: React.FC<Props> = ({
  onNavigateToTab,
  currentUser,
  onOpenAuthModal,
  onLogout,
  language,
  setLanguage,
  onSelectServiceFromHero
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [promptText, setPromptText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiResult, setAiResult] = useState<any | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('rev');
  const [isSimulatingPacket, setIsSimulatingPacket] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const t = TRANSLATIONS[language];

  const renderDeptIcon = (id: string, className = "w-4 h-4") => {
    switch (id) {
      case 'rev':
        return <Landmark className={className} />;
      case 'dbt':
        return <GraduationCap className={className} />;
      case 'hed':
        return <BookOpen className={className} />;
      case 'rto':
        return <Car className={className} />;
      case 'uid':
        return <Fingerprint className={className} />;
      default:
        return <Building2 className={className} />;
    }
  };

  const departmentNodes: DepartmentNode[] = [
    {
      id: 'rev',
      name: 'Revenue & Land Records (Bhulekh)',
      nameMr: 'महसूल व भूमी अभिलेख (७/१२)',
      code: 'MAHA-REV-01',
      category: 'Land & Domicile',
      status: 'ONLINE',
      records: '2.84 Cr 7/12 Extracts',
      schema: 'JSON-LD / LandRecordSchema-v2.1',
      sampleProof: 'Survey No. 142/B, Khadakwasla, Haveli, Pune (Verified)',
      latency: '12ms'
    },
    {
      id: 'dbt',
      name: 'MahaDBT Social Welfare',
      nameMr: 'महाडीबीटी समाज कल्याण',
      code: 'MAHA-DBT-02',
      category: 'Scholarships & Welfare',
      status: 'ONLINE',
      records: '1.18 Cr Beneficiaries',
      schema: 'JSON-LD / CasteIncomeProfile-v1.4',
      sampleProof: 'OBC / NT-C Verified Lineage Registry #MH/PUN/2023/8812',
      latency: '18ms'
    },
    {
      id: 'hed',
      name: 'Higher & Technical Education',
      nameMr: 'उच्च व तंत्रशिक्षण विभाग',
      code: 'MAHA-HED-03',
      category: 'Academic Repositories',
      status: 'ONLINE',
      records: '46 State Universities',
      schema: 'JSON-LD / AcademicEnrollment-v3.0',
      sampleProof: 'COEP Pune • B.Tech Computer Engg • Enr: 2022-77182',
      latency: '14ms'
    },
    {
      id: 'rto',
      name: 'Transport & RTO Services',
      nameMr: 'परिवहन व आरटीओ विभाग',
      code: 'MAHA-RTO-04',
      category: 'Vehicles & Licenses',
      status: 'ONLINE',
      records: '3.42 Cr Driving Licenses',
      schema: 'JSON-LD / SarathiVahanRegistry-v2.0',
      sampleProof: 'DL #MH-12-2022-0091823 • LMV & Motorcycle Verified',
      latency: '22ms'
    },
    {
      id: 'uid',
      name: 'UIDAI Biometric Auth Gateway',
      nameMr: 'आधार बायोमेट्रिक गेटवे',
      code: 'UIDAI-L1-AUTH',
      category: 'Identity & Liveness',
      status: 'SYNCED',
      records: '100% L1 Certified',
      schema: 'Aadhaar XML-PID / NFIQ 2.0',
      sampleProof: 'Biometric Match Quality: 94% (Zero OTP Bypass Enforced)',
      latency: '9ms'
    }
  ];

  const activeNode = departmentNodes.find(d => d.id === selectedDeptId) || departmentNodes[0];

  // Auto packet simulation ping
  const triggerPacketSimulation = (deptId: string) => {
    setSelectedDeptId(deptId);
    setIsSimulatingPacket(true);
    setTimeout(() => setIsSimulatingPacket(false), 900);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
        document.body.classList.remove('menu-open');
        toggleRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  const toggleMenu = () => {
    const nextState = !isMenuOpen;
    setIsMenuOpen(nextState);
    if (nextState) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
  };

  const handleNavClick = (tab: 'schemes' | 'citizen' | 'consent' | 'audit' | 'ai' | 'officer' | 'gateway' | 'supabase') => {
    setIsMenuOpen(false);
    document.body.classList.remove('menu-open');
    onNavigateToTab(tab);

    const el = document.getElementById('portal-workspace');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePromptSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promptText.trim()) return;

    setIsSubmitting(true);
    setAiResult(null);

    try {
      const res = await fetch('/api/ai/navigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: promptText,
          language: language === 'mr' ? 'Marathi' : language === 'hi' ? 'Hindi' : 'English'
        })
      });
      const data = await res.json();
      setAiResult(data);
    } catch (err) {
      console.warn('Could not query Mahasetu AI endpoint:', err);
      const fallback = {
        greeting: language === 'mr' ? 'नमस्कार! महासेतू डिजिटल सेवा मंचावर आपले स्वागत आहे.' : language === 'hi' ? 'नमस्ते! महासेतु सेवा मंच में आपका स्वागत है।' : 'Hello! Welcome to Mahasetu Citizen Sahayak.',
        serviceCode: 'CASTE_CERT',
        serviceName: language === 'mr' ? 'जात प्रमाणपत्र (Caste Certificate)' : 'Caste Certificate (जात प्रमाणपत्र)',
        department: 'Revenue Department (महसूल विभाग)',
        explanation: language === 'mr' ? 'जात प्रमाणपत्रासाठी आपल्या कुटुंबाची महसूल व अधिवास नोंद महासेतू डिजिटल जाळ्याद्वारे आपोआप तपासली जाते. कोणत्याही कागदपत्रांची प्रत जोडण्याची गरज नाही.' : 'Mahasetu verifies your identity and family lineage records across state databases with zero manual document uploads.',
        summary: 'Mahasetu verified your identity and family lineage records across state databases.',
        requiredDocuments: ['Aadhaar Card Biometric Verification', 'Ration Card / Electoral Record', 'School Leaving Certificate'],
        availableInMesh: ['Aadhaar Card Biometric Verification', 'Ration Card / Electoral Record']
      };
      setAiResult(fallback);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);
        recognition.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          setPromptText(text);
          setIsListening(false);
        };

        recognition.start();
        return;
      } catch (err) {
        console.warn('SpeechRecognition failed:', err);
      }
    }

    const samples = [
      'Apply for Caste Certificate without uploading 7/12',
      'मला ७/१२ उतारा त्वरित पडताळायचा आहे',
      'Post-matric scholarship application for OBC student',
      'Driving license renewal under transport department'
    ];
    setPromptText(samples[Math.floor(Math.random() * samples.length)]);
  };

  const sampleServices = [
    { title: '7/12 Land Record', code: '7_12_EXTRACT', query: 'Need 7/12 land extract for agricultural loan', dept: 'Revenue' },
    { title: 'Caste Certificate', code: 'CASTE_CERT', query: 'I need Caste Certificate for engineering admission', dept: 'Social Welfare' },
    { title: 'MahaDBT Scholarship', code: 'MAHADBT_SCHOLARSHIP', query: 'Apply for Mahadbt Post-Matric Scholarship', dept: 'Higher Ed' },
    { title: 'Driving License', code: 'DRIVING_LICENSE', query: 'Apply for learner driving license RTO Maharashtra', dept: 'Transport' },
    { title: 'Income Certificate', code: 'INCOME_CERT', query: 'Income certificate needed for EWS admission', dept: 'Revenue' }
  ];

  return (
    <section id="hero" className="relative w-full bg-dot-grid overflow-hidden border-b border-slate-200 min-h-screen pb-16">
      {/* Dynamic Embedded Styles for Unique CSS Accents */}
      <style>{`
        .bg-dot-grid {
          background-color: #f8fafc;
          background-image: radial-gradient(#cbd5e1 1.1px, transparent 1.1px);
          background-size: 24px 24px;
        }
        
        .top-glow-gradient {
          background: radial-gradient(circle at 50% 20%, rgba(204, 251, 241, 0.45) 0%, rgba(254, 243, 199, 0.35) 40%, rgba(248, 250, 252, 0) 75%);
        }

        .wavy-underline {
          position: relative;
          display: inline-block;
        }
        .wavy-underline::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -10px;
          width: 100%;
          height: 12px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 6' preserveAspectRatio='none'%3E%3Cpath d='M0,3 Q2.5,0 5,3 T10,3 T15,3 T20,3' fill='none' stroke='%23d97706' stroke-width='1.8' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: repeat-x;
          background-size: 20px 7px;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.72);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03);
        }
      `}</style>

      {/* Background Ambient Glow Overlay */}
      <div className="pointer-events-none absolute inset-0 top-glow-gradient h-[750px] z-0"></div>

      {/* 1. TOP HERO HEADER / NAVIGATION */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand & Maharashtra Emblem */}
          <a className="flex items-center gap-3.5 shrink-0 group focus:outline-none" href="#hero">
            <img
              alt="Government of Maharashtra Official Emblem"
              className="w-12 h-12 md:w-14 md:h-14 object-contain drop-shadow-sm transition-transform group-hover:scale-105"
              src="/mahasetu-logo-transparent.png"
            />
            <div className="flex flex-col min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 leading-none font-marathi-calligraphy">
                  महासेतू
                </span>
              </div>
              <span className="text-[11px] md:text-[12px] font-medium text-slate-600 tracking-tight leading-tight mt-0.5">
                <span className="sm:hidden">
                  {language === 'mr' ? 'महाराष्ट्र शासन' : language === 'hi' ? 'महाराष्ट्र शासन' : 'Govt of Maharashtra'}
                </span>
                <span className="hidden sm:inline">
                  {language === 'mr' 
                    ? 'महाराष्ट्र शासन • आंतर-विभागीय इंटरऑपरेबिलिटी मंच' 
                    : language === 'hi' 
                    ? 'महाराष्ट्र शासन • अंतर-विभागीय इंटरऑपरेबिलिटी मंच' 
                    : 'Govt of Maharashtra • Inter-Departmental Interoperability'}
                </span>
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1.5 text-[14.5px] font-medium text-slate-700" data-purpose="desktop-nav">
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-3.5 py-2 font-semibold text-slate-950 hover:text-amber-700 transition-colors"
            >
              {language === 'mr' ? 'मुख्यपृष्ठ' : language === 'hi' ? 'मुख्य पृष्ठ' : 'Home'}
            </button>
            <button
              onClick={() => handleNavClick('citizen')}
              className="px-3.5 py-2 hover:text-amber-700 transition-colors"
            >
              {t.navCitizen}
            </button>
            <button
              onClick={() => handleNavClick('schemes')}
              className="px-3.5 py-1.5 text-amber-800 font-semibold rounded-lg bg-amber-50/90 border border-amber-300/80 hover:bg-amber-100 transition-colors"
            >
              {t.navSchemes}
            </button>
            <button
              onClick={() => handleNavClick('officer')}
              className="px-3.5 py-2 hover:text-amber-700 transition-colors"
            >
              {t.navOfficer}
            </button>
            <button
              onClick={() => handleNavClick('audit')}
              className="px-3.5 py-2 hover:text-amber-700 transition-colors"
            >
              {t.navAudit}
            </button>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Language Selector Segmented Pill */}
            <div className="hidden sm:inline-flex items-center p-1 bg-slate-100 rounded-full border border-slate-200/90 text-xs font-medium text-slate-600 shadow-inner" data-purpose="language-selector">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-full transition-all ${language === 'en' ? 'bg-slate-900 text-white font-bold shadow-sm' : 'hover:text-slate-900'}`}
                type="button"
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('mr')}
                className={`px-2.5 py-1 rounded-full transition-all ${language === 'mr' ? 'bg-slate-900 text-white font-bold shadow-sm' : 'hover:text-slate-900'}`}
                type="button"
              >
                मराठी
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2.5 py-1 rounded-full transition-all ${language === 'hi' ? 'bg-slate-900 text-white font-bold shadow-sm' : 'hover:text-slate-900'}`}
                type="button"
              >
                हिंदी
              </button>
            </div>

            {/* Citizen Auth Dynamic CTA */}
            {currentUser ? (
              <button
                onClick={onOpenAuthModal}
                className="hidden md:inline-flex items-center gap-2.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-200 animate-pulse" />
                <span>
                  {currentUser.name.split(' ')[0]} ({language === 'mr' ? 'पडताळणीकृत' : language === 'hi' ? 'सत्यापित' : 'Aadhaar Verified'})
                </span>
              </button>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="hidden md:inline-flex items-center gap-2.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition-all transform active:scale-95"
                data-purpose="citizen-auth-btn"
              >
                <Fingerprint className="w-4 h-4 text-amber-400" />
                <span>{t.aadhaarAuth}</span>
              </button>
            )}

            {/* Mobile Menu Hamburger Button */}
            <button
              onClick={toggleMenu}
              aria-label="Open Navigation Menu"
              className="xl:hidden p-2.5 text-slate-700 hover:text-slate-950 rounded-xl hover:bg-slate-100 border border-slate-200 transition focus:outline-none"
              type="button"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <>
                    <line x1="4" x2="20" y1="6" y2="6"></line>
                    <line x1="4" x2="20" y1="12" y2="12"></line>
                    <line x1="4" x2="20" y1="18" y2="18"></line>
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Panel */}
        {isMenuOpen && (
          <div className="xl:hidden p-5 bg-white border-t border-slate-100 flex flex-col space-y-3 font-medium text-slate-800 shadow-xl">
            <button
              onClick={() => handleNavClick('citizen')}
              className="w-full text-left px-4 py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              {t.navCitizen}
            </button>
            <button
              onClick={() => handleNavClick('schemes')}
              className="w-full text-left px-4 py-2.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 transition-colors"
            >
              {t.navSchemes}
            </button>
            <button
              onClick={() => handleNavClick('officer')}
              className="w-full text-left px-4 py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              {t.navOfficer}
            </button>
            <button
              onClick={() => handleNavClick('audit')}
              className="w-full text-left px-4 py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              {t.navAudit}
            </button>
            
            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {language === 'mr' ? 'भाषा निवडा' : language === 'hi' ? 'भाषा चुनें' : 'Select Language'}
              </p>
              <div className="flex gap-2 text-sm">
                <button
                  onClick={() => { setLanguage('en'); setIsMenuOpen(false); }}
                  className={`flex-1 py-1.5 rounded-md font-semibold transition-all ${language === 'en' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}
                >
                  EN
                </button>
                <button
                  onClick={() => { setLanguage('mr'); setIsMenuOpen(false); }}
                  className={`flex-1 py-1.5 rounded-md font-semibold transition-all ${language === 'mr' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}
                >
                  मराठी
                </button>
                <button
                  onClick={() => { setLanguage('hi'); setIsMenuOpen(false); }}
                  className={`flex-1 py-1.5 rounded-md font-semibold transition-all ${language === 'hi' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}
                >
                  हिंदी
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenAuthModal();
                }}
                className="flex items-center justify-center gap-2.5 w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold shadow transition-all"
              >
                <Fingerprint className="w-4 h-4 text-amber-400" />
                <span>{currentUser ? t.switchUser : t.aadhaarAuth}</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO MAIN CONTENT SECTION */}
      <main className="relative z-10 pt-10 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Layout Spacer replacing the removed live services badge to maintain identical vertical rhythm */}
        <div className="h-10 sm:h-12 w-full" aria-hidden="true" />

        {/* Main Headings */}
        <div className="max-w-4xl mx-auto mb-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl text-slate-800 tracking-tight font-normal mb-2 font-marathi-calligraphy">
            महाराष्ट्र शासन
          </h2>
          <h1 className="text-3.5xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
            {language === 'mr' ? (
              <>
                सर्व सेवा आणि योजनांसाठी<br className="hidden sm:block"/>
                <span className="text-orange-500 font-serif italic font-normal tracking-wide wavy-underline">
                  युनिफाइड सिटीझन गेटवे
                </span>
              </>
            ) : language === 'hi' ? (
              <>
                सभी सेवाओं और योजनाओं के लिए<br className="hidden sm:block"/>
                <span className="text-orange-500 font-serif italic font-normal tracking-wide wavy-underline">
                  एकीकृत नागरिक गेटवे
                </span>
              </>
            ) : (
              <>
                Unified Citizen Gateway for All<br className="hidden sm:block"/>
                <span className="text-orange-500 font-serif italic font-normal tracking-wide wavy-underline">
                  Services and Schemes
                </span>
              </>
            )}
          </h1>
        </div>

        {/* Description Subtitle */}
        <div className="max-w-3xl text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed mb-10 text-center">
          <span className="font-bold text-slate-800 block mb-1">
            {language === 'mr' 
              ? 'शून्य अपलोड फेडरेटेड गव्हर्नन्स:' 
              : language === 'hi' 
              ? 'शून्य अपलोड फेडरेटेड गवर्नेंस:' 
              : 'Zero Upload Federated Governance:'}
          </span>
          <span className="text-slate-700 block">
            {language === 'mr' 
              ? 'डिजिटल पडताळणी: भौतिक कागदपत्रे अपलोड न करता महसूल, शिक्षण, कृषी आणि सामाजिक कल्याण सेवांमध्ये प्रवेश मिळवण्यासाठी सिंगल क्लिक आधार प्रमाणीकरण'
              : language === 'hi'
              ? 'डिजिटल सत्यापन: भौतिक दस्तावेज अपलोड किए बिना राजस्व, शिक्षा, कृषि और समाज कल्याण सेवाओं तक पहुंच के लिए सिंगल क्लिक आधार प्रमाणीकरण'
              : 'Digital Verification: Single Click Aadhaar Authentication to Access Revenue, Education, Agriculture, and Social Welfare Services Without Uploading Physical Documents'}
          </span>
        </div>

        {/* BEGIN: AISahayakCard */}
        <div className="w-full max-w-3xl bg-white rounded-3xl p-4 sm:p-7 shadow-[0_20px_50px_rgba(15,23,42,0.06)] border border-slate-200/90 mb-10 text-left transition-all hover:shadow-[0_25px_60px_rgba(15,23,42,0.09)]" data-purpose="search-box-card">
          {/* Card Top Bar */}
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base sm:text-lg">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>
                {language === 'mr' ? 'AI नागरिक सहाय्यक ' : language === 'hi' ? 'AI नागरिक सहायक ' : 'AI Citizen Sahayak '}
                <span className="font-medium text-slate-700 text-sm sm:text-base">
                  {language === 'mr' ? '(शून्य कागदपत्र सहाय्यक)' : language === 'hi' ? '(शून्य दस्तावेज सहायक)' : '(Zero-Document Assistant)'}
                </span>
              </span>
            </div>
            <span className="text-xs sm:text-sm font-medium text-slate-400 shrink-0">
              {language === 'mr' ? 'आवाज आणि मराठी सक्षम' : language === 'hi' ? 'आवाज़ और हिंदी सक्षम' : 'Voice & Marathi Enabled'}
            </span>
          </div>

          {/* Search Input Container */}
          <form onSubmit={handlePromptSubmit} className="space-y-3">
            <div className="relative flex items-center bg-slate-50 hover:bg-slate-100/80 rounded-full border border-slate-200 focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-100 transition-all p-1.5 sm:p-2 mb-4">
              <input
                className="w-full bg-transparent border-0 px-4 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:ring-0 focus:outline-none"
                placeholder={t.aiSearchPlaceholder}
                type="text"
                value={promptText}
                onChange={e => setPromptText(e.target.value)}
              />
              <div className="flex items-center gap-2 shrink-0 pr-1">
                {/* Mic Voice Button */}
                <button
                  className={`p-2 rounded-full transition-all ${
                    isListening ? 'bg-rose-500 text-white animate-pulse' : 'text-slate-500 hover:text-slate-800 hover:bg-white'
                  }`}
                  title="Voice Search"
                  type="button"
                  onClick={handleToggleVoice}
                >
                  <Mic className="w-5 h-5" />
                </button>
                {/* Submit Search Button */}
                <button
                  className="w-10 h-10 rounded-full bg-slate-950 text-white flex items-center justify-center hover:bg-amber-600 transition-colors shadow disabled:opacity-45"
                  title="Search"
                  type="submit"
                  disabled={isSubmitting || !promptText.trim()}
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Quick Search Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
              <span className="text-slate-500 font-medium">
                {language === 'mr' ? 'त्वरित:' : language === 'hi' ? 'त्वरित:' : 'Quick:'}
              </span>
              {(sampleServices || []).slice(0, 4).map(s => {
                const localizedTitle = language === 'mr' ? (s.code === '7_12_EXTRACT' ? '७/१२ उतारा' : s.code === 'CASTE_CERT' ? 'जात प्रमाणपत्र' : s.code === 'MAHADBT_SCHOLARSHIP' ? 'महाडीबीटी शिष्यवृत्ती' : 'ड्रायव्हिंग लायसन्स') : language === 'hi' ? (s.code === '7_12_EXTRACT' ? '7/12 भूलेख' : s.code === 'CASTE_CERT' ? 'जाति प्रमाण पत्र' : s.code === 'MAHADBT_SCHOLARSHIP' ? 'महाडीबीटी छात्रवृत्ति' : 'ड्राइविंग लाइसेंस') : s.title;
                return (
                  <button
                    key={s.code}
                    type="button"
                    onClick={() => setPromptText(s.query)}
                    className="px-3.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium border border-slate-200/70 transition"
                  >
                    {localizedTitle}
                  </button>
                );
              })}
            </div>

            {/* Simulated processing skeleton */}
            {isSubmitting && (
              <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-emerald-300 text-xs space-y-2.5 shadow-sm relative overflow-hidden animate-pulse">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin shrink-0" />
                    <span className="font-bold text-emerald-900 text-[11px] flex items-center gap-1.5">
                      <span className="uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100/70 border border-emerald-200 text-[9px] font-bold text-emerald-800">
                        {language === 'mr' ? 'प्रक्रिया सुरू आहे' : language === 'hi' ? 'प्रक्रिया जारी है' : 'Processing'}
                      </span>
                      <span className="text-[#111111] font-semibold">
                        {language === 'mr'
                          ? 'महासेतू एआय साहाय्यक विश्लेषण सुरू आहे...'
                          : 'Mahasetu AI analyzing query...'}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* AI Result presentation */}
            {aiResult && (
              <div className="mt-4 p-4 rounded-2xl bg-white border border-emerald-300 text-xs space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {aiResult.serviceName || 'Service Identified'}
                  </span>
                  <span className="text-[10px] text-[#5c5c5c] font-mono">{aiResult.department}</span>
                </div>
                <p className="text-[11px] text-[#333333] leading-relaxed bg-black/[0.02] p-2.5 rounded-xl">
                  {aiResult.explanation || aiResult.summary}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>
                      {language === 'mr' 
                        ? 'राज्य डेटा मेश द्वारे आपोआप पडताळणीकृत' 
                        : language === 'hi' 
                        ? 'राज्य डेटा मेश द्वारा स्वचालित सत्यापित' 
                        : 'Auto-verified via State Data Mesh'}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectServiceFromHero && aiResult.serviceCode) {
                        onSelectServiceFromHero(aiResult.serviceCode);
                      }
                      handleNavClick('citizen');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-950 text-white text-[11px] font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1"
                  >
                    <span>{language === 'mr' ? 'ऑनलाइन अर्ज करा' : language === 'hi' ? 'ऑनलाइन आवेदन करें' : 'Apply Online'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
        {/* END: AISahayakCard */}

        {/* BEGIN: MetricsBadgesStrip */}
        <div className="w-full flex flex-col items-center gap-2.5 mb-14" data-purpose="metrics-badges">
          {/* First Row of Badges */}
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 text-xs sm:text-sm">
            {/* Badge 1: Citizens */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 text-white font-medium shadow-sm border border-slate-800">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span>
                {language === 'mr' ? 'नोंदणीकृत नागरिक: ' : language === 'hi' ? 'पंजीकृत नागरिक: ' : 'Registered Citizens: '}
                <strong>{language === 'mr' || language === 'hi' ? '४.८८ कोटी+' : '4.88 Cr+'}</strong>
              </span>
            </div>
            {/* Badge 2: Direct Benefit Transfer */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 text-white font-medium shadow-sm border border-slate-800">
              <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                <rect height="16" rx="2" width="20" x="2" y="4"></rect>
                <path d="M16 12h.01"></path>
                <path d="M2 10h20"></path>
              </svg>
              <span>
                {language === 'mr' ? 'थेट लाभ हस्तांतरण: ' : language === 'hi' ? 'प्रत्यक्ष लाभ हस्तांतरण: ' : 'Direct Benefit Transfer: '}
                <strong>{language === 'mr' || language === 'hi' ? '₹१८,५२० कोटी+' : '₹18,520 Cr+'}</strong>
              </span>
            </div>
            {/* Badge 3: Paperless Verification */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 text-white font-medium shadow-sm border border-slate-800">
              <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>
                {language === 'mr' ? 'कागदपत्रविरहित पडताळणी: ' : language === 'hi' ? 'दस्तावेज़ रहित सत्यापन: ' : 'Paperless Verification: '}
                <strong>{language === 'mr' || language === 'hi' ? '१००%' : '100%'}</strong>
              </span>
            </div>
          </div>
          {/* Second Row of Badges */}
          <div className="flex justify-center items-center">
            {/* Badge 4: Districts & Talukas */}
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs sm:text-sm font-medium shadow-sm border border-slate-800">
              <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                <rect height="20" rx="2" ry="2" width="16" x="4" y="2"></rect>
                <path d="M9 22v-4h6v4"></path>
                <line x1="8" x2="8.01" y1="6" y2="6"></line>
                <line x1="16" x2="16.01" y1="6" y2="6"></line>
                <line x1="12" x2="12.01" y1="6" y2="6"></line>
                <line x1="8" x2="8.01" y1="10" y2="10"></line>
                <line x1="16" x2="16.01" y1="10" y2="10"></line>
                <line x1="12" x2="12.01" y1="10" y2="10"></line>
              </svg>
              <span>
                {language === 'mr' ? 'सक्रिय जिल्हे: ' : language === 'hi' ? 'सक्रिय जिले: ' : 'Active Districts: '}
                <strong>{language === 'mr' || language === 'hi' ? '३६ जिल्हे / ३५८ तालुके' : '36 Districts / 358 Talukas'}</strong>
              </span>
            </div>
          </div>
        </div>
        {/* END: MetricsBadgesStrip */}

        {/* BEGIN: DevicePreviewShowcase */}
        <div className="w-full max-w-4xl relative mx-auto" data-purpose="mockup-frame-container">
          {/* Outer Display Frame */}
          <div className="bg-slate-900 p-3 sm:p-5 md:p-6 rounded-[2.5rem] shadow-2xl border-4 border-slate-800 relative overflow-hidden">
            {/* Screen Content */}
            <div className="bg-gradient-to-b from-slate-100 to-slate-200/90 rounded-[2rem] h-[340px] sm:h-[420px] md:h-[480px] w-full relative flex items-center justify-center overflow-hidden border border-white/60">
              
              {/* Product Animation Video inside Device Screen */}
              <video
                src="/GovTech_platform_product_animation_202609092312.mp4"
                autoPlay
                loop
                muted
                playsInline
                controls={false}
                className="absolute inset-0 w-full h-full object-cover opacity-90 z-0 pointer-events-none"
                title="Mahasetu Product Animation Video"
              />

              {/* Gradient Dark Backdrop for Legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent z-10 pointer-events-none" />

              {/* Mock Phone Cutout / Dynamic Island on the left */}
              <div className="absolute left-6 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-20 sm:h-28 bg-slate-900 rounded-full shadow-md z-20"></div>

              {/* Floating Glass UI Chip: ID Card (Top Left) */}
              <div className="absolute left-14 sm:left-24 top-10 sm:top-14 glass-card p-3 sm:p-4 rounded-2xl flex items-center gap-3 z-20 transition-transform hover:-translate-y-1">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-slate-800 rounded-xl flex items-center justify-center text-white">
                  <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                    {language === 'mr' ? 'ओळख' : language === 'hi' ? 'पहचान' : 'Identity'}
                  </div>
                  <div className="w-12 h-1.5 bg-slate-400 rounded mt-1"></div>
                </div>
              </div>

              {/* Floating Glass UI Chip: Education / Cap (Top Right) */}
              <div className="absolute right-12 sm:right-28 top-12 sm:top-16 glass-card p-3 sm:p-4 rounded-2xl flex items-center justify-center z-20 hover:-translate-y-1 transition-transform">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-slate-700" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                </svg>
              </div>

              {/* Floating Glass UI Chip: Scholarship / Education (Bottom Left) */}
              <div className="absolute left-16 sm:left-28 bottom-12 sm:bottom-16 glass-card p-3 sm:p-4 rounded-2xl flex items-center justify-center z-20 hover:-translate-y-1 transition-transform">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-slate-700" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
              </div>

              {/* Floating Glass UI Chip: Medical / Health (Bottom Right) */}
              <div className="absolute right-14 sm:right-32 bottom-12 sm:bottom-16 glass-card p-3.5 sm:p-4 rounded-2xl flex items-center justify-center z-20 hover:-translate-y-1 transition-transform">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-slate-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z"></path>
                </svg>
              </div>

              {/* Center Device Text */}
              <div className="text-center px-6 py-4 z-20 max-w-sm sm:max-w-md bg-white/80 backdrop-blur-md rounded-2xl border border-white/40 shadow-lg">
                <h3 className="text-xl sm:text-2xl font-serif text-slate-800 leading-tight">
                  {language === 'mr' ? (
                    <>तुमच्या डिजिटल सेवा<br/>थेट जोडत आहोत...</>
                  ) : language === 'hi' ? (
                    <>आपकी डिजिटल सेवाएं<br/>सीधे जोड़ रहे हैं...</>
                  ) : (
                    <>Connecting your<br/>digital services...</>
                  )}
                </h3>
              </div>
            </div>
          </div>
        </div>
        {/* END: DevicePreviewShowcase */}

        {/* Quick workspace jump button */}
        <div className="flex justify-center mt-12">
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('portal-workspace');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/80 hover:bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-sm transition-all hover:shadow"
          >
            <span>{t.exploreWorkspace || 'Explore Workspace'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
          </button>
        </div>
      </main>
    </section>
  );
};

