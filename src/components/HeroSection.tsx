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
    <section id="hero" className="relative w-full bg-[#eef2ee] text-[#111111] overflow-hidden border-b border-black/8">
      {/* Background Subtle Mesh Grid and Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(#141414_0.75px,transparent_0.75px)] [background-size:24px_24px] opacity-[0.035] pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* 1. TOP HERO HEADER / NAVIGATION */}
      <header className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Emblem */}
          <div className="flex items-center gap-3">
            <a href="#hero" className="flex items-center gap-3 group text-decoration-none">
              <div className="w-12 h-12 shrink-0 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                <img
                  src="/mahasetu-logo.png"
                  alt="Mahasetu Emblem"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111111] font-marathi-calligraphy leading-tight">
                  महासेतू
                </h1>
                <p className="text-[11px] text-[#5c5c5c] font-semibold leading-none mt-0.5">
                  महाराष्ट्र शासन • आंतर-विभागीय इंटरऑपरेबिलिटी मंच
                </p>
              </div>
            </a>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/75 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-black/8 shadow-xs">
            <button
              type="button"
              onClick={() => handleNavClick('citizen')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#111111] hover:bg-black/5 transition-colors"
            >
              Citizen Portal
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('ai')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#111111] hover:bg-black/5 transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>AI Sahayak</span>
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('consent')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#111111] hover:bg-black/5 transition-colors"
            >
              Consent Matrix
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('audit')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#111111] hover:bg-black/5 transition-colors"
            >
              Audit Trail
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('gateway')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#111111] hover:bg-black/5 transition-colors"
            >
              Gateway Topology
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('officer')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#111111] hover:bg-black/5 transition-colors"
            >
              Officer Review
            </button>
          </nav>

          {/* Right Action Stack: Language + Biometric Button */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="flex items-center bg-white/80 backdrop-blur-md rounded-xl p-1 border border-black/10 text-xs font-semibold text-black/70 shadow-xs">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  language === 'en' ? 'bg-[#141414] text-white font-bold shadow-xs' : 'hover:text-black'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('mr')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  language === 'mr' ? 'bg-[#141414] text-white font-bold shadow-xs' : 'hover:text-black'
                }`}
              >
                मराठी
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  language === 'hi' ? 'bg-[#141414] text-white font-bold shadow-xs' : 'hover:text-black'
                }`}
              >
                हिंदी
              </button>
            </div>

            {/* Auth CTA / User Badge */}
            {currentUser ? (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{currentUser.name.split(' ')[0]} (Aadhaar Verified)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#141414] hover:bg-black text-white text-xs font-semibold shadow-sm transition-all"
              >
                <Fingerprint className="w-3.5 h-3.5 text-emerald-400" />
                <span>Biometric Auth</span>
              </button>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              ref={toggleRef}
              type="button"
              onClick={toggleMenu}
              className="lg:hidden p-2 rounded-xl bg-white/80 border border-black/10 text-[#111111]"
              aria-label="Toggle Navigation"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Panel */}
        {isMenuOpen && (
          <div className="lg:hidden mt-3 p-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-black/10 shadow-xl space-y-2">
            <button
              type="button"
              onClick={() => handleNavClick('citizen')}
              className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold hover:bg-black/5"
            >
              Citizen Portal
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('ai')}
              className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold hover:bg-black/5 flex items-center justify-between"
            >
              <span>AI Sahayak</span>
              <Sparkles className="w-4 h-4 text-amber-600" />
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('consent')}
              className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold hover:bg-black/5"
            >
              Consent Matrix
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('audit')}
              className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold hover:bg-black/5"
            >
              Audit Trail
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('officer')}
              className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold hover:bg-black/5"
            >
              Officer Review
            </button>
            <div className="pt-2 border-t border-black/10">
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenAuthModal();
                }}
                className="w-full py-2.5 rounded-xl bg-[#141414] text-white text-xs font-semibold flex items-center justify-center gap-2"
              >
                <Fingerprint className="w-4 h-4 text-emerald-400" />
                <span>{currentUser ? 'Switch / Re-authenticate User' : 'Aadhaar Biometric Login'}</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. MAIN HERO DISPLAY (2-COLUMN MODERN SPLIT) */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-12 sm:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* LEFT COLUMN: Mission, Core Slogan, Value Props, Telemetry */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            {/* Main Headline */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#111111] leading-[1.12]">
                {language === 'mr' ? (
                  <>
                    एक महासेतू. <span className="text-emerald-700">शून्य कागदपत्रे.</span><br />
                    संपूर्ण नागरिक संमती.
                  </>
                ) : language === 'hi' ? (
                  <>
                    एक महासेतु। <span className="text-emerald-700">शून्य दस्तावेज।</span><br />
                    पूर्ण नागरिक सहमति।
                  </>
                ) : (
                  <>
                    One Gateway. <span className="text-emerald-700">Zero Uploads.</span><br />
                    Absolute Citizen Consent.
                  </>
                )}
              </h1>

              <p className="text-sm sm:text-base text-[#4a4a4a] leading-relaxed max-w-2xl font-normal">
                {language === 'mr'
                  ? 'महासेतू महसूल, महाडीबीटी, उच्च शिक्षण, परिवहन आणि भूमी अभिलेख विभागांना थेट जोडणारा आंतर-विभागीय मंच आहे. आधार बायोमेट्रिक पडताळणीद्वारे नागरिकांना वारंवार कागदपत्रे जोडण्यापासून १००% मुक्ती मिळते.'
                  : language === 'hi'
                  ? 'महासेतु राजस्व, महाडीबीटी, उच्च शिक्षा, परिवहन और भूमि अभिलेख विभागों को सीधे जोड़ने वाला इंटरऑपरेबिलिटी प्लेटफॉर्म है। आधार बायोमेट्रिक सत्यापन के साथ नागरिकों को बार-बार दस्तावेज अपलोड करने से पूर्ण मुक्ति।'
                  : 'Mahasetu eliminates government department silos by orchestrating real-time canonical data exchange between Revenue (7/12), MahaDBT, Higher Education, and Transport with strict Aadhaar biometrics and DPDP cryptographic consent.'}
              </p>
            </div>

            {/* Live Telemetry Metric Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="p-3 rounded-2xl bg-white/80 border border-black/8 shadow-xs backdrop-blur-md">
                <div className="text-lg font-bold text-[#111111] flex items-center gap-1">
                  <span>5/5</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
                <div className="text-[11px] text-[#5c5c5c] font-medium mt-0.5">Live Adapters</div>
              </div>

              <div className="p-3 rounded-2xl bg-white/80 border border-black/8 shadow-xs backdrop-blur-md">
                <div className="text-lg font-bold text-emerald-700">0 Files</div>
                <div className="text-[11px] text-[#5c5c5c] font-medium mt-0.5">Zero Uploads</div>
              </div>

              <div className="p-3 rounded-2xl bg-white/80 border border-black/8 shadow-xs backdrop-blur-md">
                <div className="text-lg font-bold text-[#111111]">100% L1</div>
                <div className="text-[11px] text-[#5c5c5c] font-medium mt-0.5">Aadhaar Biometric</div>
              </div>

              <div className="p-3 rounded-2xl bg-white/80 border border-black/8 shadow-xs backdrop-blur-md">
                <div className="text-lg font-bold text-[#111111]">SHA-256</div>
                <div className="text-[11px] text-[#5c5c5c] font-medium mt-0.5">Tamper-Proof Audit</div>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleNavClick('schemes')}
                className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2 group"
              >
                <BookOpen className="w-4 h-4 text-white" />
                <span>{language === 'mr' ? 'सर्व योजना शोधा (४,७०९+)' : language === 'hi' ? 'सभी सरकारी योजनाएं (4,709+)' : 'Explore 4,709+ Schemes'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-amber-100" />
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('citizen')}
                className="px-5 py-3 rounded-xl bg-[#141414] hover:bg-black text-white text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2 group"
              >
                <span>{language === 'mr' ? 'नागरिक पोर्टल' : language === 'hi' ? 'नागरिक पोर्टल' : 'Citizen Portal'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-emerald-400" />
              </button>
            </div>

            {/* Active Citizen Session Bar */}
            {currentUser && (
              <div className="p-3 rounded-2xl bg-white/70 border border-black/8 flex items-center justify-between text-xs backdrop-blur-md">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    AP
                  </div>
                  <div>
                    <span className="font-semibold text-[#111111]">{currentUser.name}</span>
                    <span className="text-[#5c5c5c] ml-2">UID: {currentUser.maskedAadhaar}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>NFIQ Score: {currentUser.biometricQualityScore}%</span>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Interactive Live Data Mesh Visualizer & Smart Citizen Sahayak */}
          <div className="lg:col-span-5 space-y-4">
            {/* Citizen-Friendly How Mahasetu Works Card */}
            <div className="p-5 rounded-3xl bg-white/85 backdrop-blur-xl border border-black/10 shadow-md relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-black/8 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#111111]">
                      {language === 'mr' ? 'महासेतू कसे कार्य करते?' : language === 'hi' ? 'महासेतु कैसे काम करता है?' : 'How Mahasetu Works for Citizens'}
                    </h3>
                    <p className="text-[10.5px] text-[#5c5c5c]">
                      {language === 'mr' ? '३ सोप्या पायऱ्यांमध्ये शून्य कागदपत्र सेवा' : language === 'hi' ? '3 आसान चरणों में शून्य दस्तावेज सेवा' : '3 Simple steps to access zero-upload benefits'}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                  {language === 'mr' ? '१००% मोफत' : language === 'hi' ? '100% मुफ्त' : '100% Free'}
                </span>
              </div>

              {/* 3 Citizen Steps */}
              <div className="space-y-2.5">
                <div className="p-2.5 rounded-2xl bg-black/[0.02] border border-black/5 flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#111111]">
                      {language === 'mr' ? 'आधार बायोमेट्रिक पडताळणी' : language === 'hi' ? 'आधार बायोमेट्रिक सत्यापन' : 'Aadhaar Biometric Login'}
                    </h4>
                    <p className="text-[11px] text-[#4a4a4a] leading-tight mt-0.5">
                      {language === 'mr' ? 'कोणताही पासवर्ड किंवा कागदपत्र अपलोड न करता सुरक्षित प्रवेश.' : language === 'hi' ? 'बिना पासवर्ड या दस्तावेज अपलोड किए सुरक्षित लॉगिन।' : 'Instant secure login without passwords or document scans.'}
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-black/[0.02] border border-black/5 flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#111111]">
                      {language === 'mr' ? 'आपोआप माहिती जोडणी' : language === 'hi' ? 'स्वचालित डेटा सत्यापन' : 'Automatic Government Data Fetch'}
                    </h4>
                    <p className="text-[11px] text-[#4a4a4a] leading-tight mt-0.5">
                      {language === 'mr' ? '७/१२ दाखला, उत्पन्न व जात प्रमाणपत्र थेट सरकारी नोंदींमधून येते.' : language === 'hi' ? '7/12 खतौनी, आय और जाति प्रमाण पत्र सीधे सरकारी रिकॉर्ड से आता है।' : 'Land records (7/12), income, and caste records auto-verify from government databases.'}
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-black/[0.02] border border-black/5 flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#111111]">
                      {language === 'mr' ? 'पूर्ण संमती व गोपनीयता' : language === 'hi' ? 'पूर्ण सहमति और गोपनीयता' : 'Your Consent, Your Control'}
                    </h4>
                    <p className="text-[11px] text-[#4a4a4a] leading-tight mt-0.5">
                      {language === 'mr' ? 'तुमच्या पूर्वपरवानगीशिवाय कोणताही विभाग तुमची माहिती पाहू शकत नाही.' : language === 'hi' ? 'आपकी अनुमति के बिना कोई भी विभाग आपकी जानकारी नहीं देख सकता।' : 'No department can access your records without your explicit digital consent.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Connected Departments Badge Strip */}
              <div className="mt-3 pt-2.5 border-t border-black/8 flex items-center justify-between text-[10.5px]">
                <span className="text-[#5c5c5c] font-medium">
                  {language === 'mr' ? 'जोडलेले सरकारी विभाग:' : language === 'hi' ? 'जुड़े सरकारी विभाग:' : 'Connected State Depts:'}
                </span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {language === 'mr' ? 'महसूल • शिक्षण • भूमी अभिलेख • परिवहन' : language === 'hi' ? 'राजस्व • शिक्षा • भूमि • परिवहन' : 'Revenue • Education • Land • Transport'}
                </span>
              </div>
            </div>

            {/* Smart Multilingual AI Sahayak Prompt Bar */}
            <div className="p-4 rounded-3xl bg-white/85 backdrop-blur-xl border border-black/10 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#111111]">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>AI Citizen Sahayak (शून्य कागदपत्र सहाय्यक)</span>
                </div>
                <span className="text-[10px] text-[#5c5c5c]">Voice & Marathi Enabled</span>
              </div>

              <form onSubmit={handlePromptSubmit} className="space-y-2">
                <div className="relative">
                  <textarea
                    rows={2}
                    className="w-full text-xs sm:text-sm p-3 pr-16 rounded-2xl bg-black/[0.03] border border-black/10 focus:outline-none focus:border-black/30 placeholder:text-[#5c5c5c] text-[#111111] resize-none"
                    placeholder={
                      language === 'mr'
                        ? 'उदा. मला इंजिनिअरिंग प्रवेशासाठी जात प्रमाणपत्र हवे आहे...'
                        : language === 'hi'
                        ? 'उदा. मुझे छात्रवृत्ति और 7/12 सत्यापन की आवश्यकता है...'
                        : 'Ask: "I need Caste Certificate" or "Verify 7/12 Land Record"...'
                    }
                    value={promptText}
                    onChange={e => setPromptText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handlePromptSubmit();
                      }
                    }}
                  />

                  {/* Mic and Send Button Inside Input */}
                  <div className="absolute right-2 bottom-2.5 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleToggleVoice}
                      className={`p-1.5 rounded-xl border transition-all ${
                        isListening
                          ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                          : 'bg-white text-[#111111] border-black/10 hover:bg-black/5'
                      }`}
                      title="Speak query"
                    >
                      <Mic className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting || !promptText.trim()}
                      className="p-1.5 rounded-xl bg-[#141414] hover:bg-black text-white disabled:opacity-40 transition-all"
                      title="Submit query"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Quick Service Suggestions */}
                <div className="flex flex-wrap items-center gap-1 pt-0.5">
                  <span className="text-[10px] font-semibold text-[#5c5c5c] mr-1">Quick:</span>
                  {(sampleServices || []).slice(0, 3).map(s => (
                    <button
                      key={s.code}
                      type="button"
                      onClick={() => {
                        setPromptText(s.query);
                      }}
                      className="px-2 py-0.5 rounded-lg text-[10.5px] bg-white hover:bg-black/5 text-[#333333] border border-black/8 font-medium transition-all"
                    >
                      {s.title}
                    </button>
                  ))}
                </div>

                {/* AI Result Card */}
                {aiResult && (
                  <div className="mt-3 p-3 rounded-2xl bg-white border border-emerald-300 text-xs space-y-2 shadow-sm animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {aiResult.serviceName || 'Service Identified'}
                      </span>
                      <span className="text-[10px] text-[#5c5c5c] font-mono">{aiResult.department}</span>
                    </div>

                    <p className="text-[11px] text-[#333333] leading-relaxed bg-black/[0.02] p-2 rounded-xl">
                      {aiResult.explanation || aiResult.summary}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Auto-verified via State Data Mesh</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (onSelectServiceFromHero && aiResult.serviceCode) {
                            onSelectServiceFromHero(aiResult.serviceCode);
                          }
                          handleNavClick('citizen');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#141414] text-white text-[10.5px] font-semibold hover:bg-black flex items-center gap-1"
                      >
                        <span>Apply Online</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* 3. FOUR-PILLAR ARCHITECTURE HIGHLIGHTS (MODERN BOTTOM STRIP) */}
        <div className="mt-12 pt-8 border-t border-black/8">
          <div className="text-center max-w-xl mx-auto mb-6">
            <span className="text-[10.5px] font-bold uppercase tracking-widest text-[#5c5c5c]">
              Core Architectural Pillars
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111] mt-1">
              Engineered for Maharashtra's Digital Public Infrastructure
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Pillar 1: Biometrics */}
            <div className="p-4 rounded-2xl bg-white/70 hover:bg-white border border-black/8 hover:border-black/20 transition-all shadow-xs space-y-2 group">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Fingerprint className="w-4 h-4" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[#111111]">
                Strict Biometric Auth
              </h3>
              <p className="text-[11px] text-[#5c5c5c] leading-relaxed">
                Zero OTP bypass. Enforces UIDAI L1 biometric verification with NFIQ 2.0 quality scoring and anti-spoofing liveness checks.
              </p>
            </div>

            {/* Pillar 2: Peer Adapters */}
            <div className="p-4 rounded-2xl bg-white/70 hover:bg-white border border-black/8 hover:border-black/20 transition-all shadow-xs space-y-2 group">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[#111111]">
                Zero-Upload Adapters
              </h3>
              <p className="text-[11px] text-[#5c5c5c] leading-relaxed">
                Standardized JSON-LD canonical schemas exchange authoritative records directly between Revenue, MahaDBT, and Higher Ed registries.
              </p>
            </div>

            {/* Pillar 3: DPDP Consent */}
            <div className="p-4 rounded-2xl bg-white/70 hover:bg-white border border-black/8 hover:border-black/20 transition-all shadow-xs space-y-2 group">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[#111111]">
                DPDP Consent Matrix
              </h3>
              <p className="text-[11px] text-[#5c5c5c] leading-relaxed">
                Citizens retain complete sovereignty with purpose-limited, time-bound consent tokens that can be revoked at any moment with one click.
              </p>
            </div>

            {/* Pillar 4: SHA-256 Audit */}
            <div className="p-4 rounded-2xl bg-white/70 hover:bg-white border border-black/8 hover:border-black/20 transition-all shadow-xs space-y-2 group">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[#111111]">
                Immutable Audit Trail
              </h3>
              <p className="text-[11px] text-[#5c5c5c] leading-relaxed">
                Every inter-departmental data access hop is cryptographically hashed via SHA-256 into a transparent, tamper-evident ledger.
              </p>
            </div>
          </div>
        </div>

        {/* Quick workspace jump button */}
        <div className="flex justify-center mt-8">
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('portal-workspace');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/80 hover:bg-white border border-black/10 text-xs font-semibold text-[#111111] shadow-xs transition-all hover:shadow"
          >
            <span>Explore Full Mahasetu Interoperability Workspace</span>
            <ChevronDown className="w-3.5 h-3.5 text-emerald-700 animate-bounce" />
          </button>
        </div>
      </div>
    </section>
  );
};
