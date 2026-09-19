import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Sparkles,
  Filter,
  Landmark,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Building2,
  GraduationCap,
  Sprout,
  HeartPulse,
  Home,
  Briefcase,
  Baby,
  Accessibility,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  Send,
  Bot,
  Zap,
  Info,
  SlidersHorizontal,
  Check
} from 'lucide-react';
import { WelfareScheme, SchemeStats } from '../types';

interface SchemesCatalogueProps {
  onSelectSchemeForApplication?: (scheme: WelfareScheme) => void;
  language?: 'mr' | 'en' | 'hi';
}

/**
 * Resolves the genuine official portal URL and department name for all 4,709+ schemes
 */
export function resolveOfficialSchemeUrl(scheme: WelfareScheme): {
  url: string;
  portalName: string;
  isDirect: boolean;
  departmentNote: string;
} {
  if (scheme.officialUrl && scheme.officialUrl.startsWith('http') && !scheme.officialUrl.includes('example.com')) {
    let domain = 'Official Government Portal';
    try {
      domain = new URL(scheme.officialUrl).hostname.replace(/^www\./, '');
    } catch {
      // ignore
    }
    return {
      url: scheme.officialUrl,
      portalName: domain,
      isDirect: true,
      departmentNote: scheme.issuingAuthority || 'Official Department Portal'
    };
  }

  const id = (scheme.id || '').toLowerCase();
  const name = (scheme.name || '').toLowerCase();
  const nameMr = (scheme.nameMr || '').toLowerCase();
  const cat = (scheme.category || '').toLowerCase();
  const isMh = scheme.isMaharashtra || scheme.state === 'Maharashtra';

  // 1. Maharashtra State Flagships
  if (id.includes('ladki') || name.includes('ladki bahin') || nameMr.includes('लाडकी बहीण')) {
    return {
      url: 'https://ladakibahin.maharashtra.gov.in/',
      portalName: 'ladakibahin.maharashtra.gov.in',
      isDirect: true,
      departmentNote: 'महिला व बाल विकास विभाग (WCD), महाराष्ट्र शासन'
    };
  }
  if (id.includes('shetkari') || name.includes('namo shetkari') || nameMr.includes('नमो शेतकरी')) {
    return {
      url: 'https://krishi.maharashtra.gov.in/',
      portalName: 'krishi.maharashtra.gov.in',
      isDirect: true,
      departmentNote: 'कृषी विभाग, महाराष्ट्र शासन'
    };
  }
  if (id.includes('shahu') || id.includes('swadhar') || name.includes('shahu maharaj') || name.includes('scholarship') || nameMr.includes('शिष्यवृत्ती') || (isMh && cat.includes('education'))) {
    return {
      url: 'https://mahadbt.maharashtra.gov.in/',
      portalName: 'mahadbt.maharashtra.gov.in',
      isDirect: true,
      departmentNote: 'MahaDBT शिष्यवृत्ती व थेट लाभ पोर्टल, महाराष्ट्र शासन'
    };
  }
  if (id.includes('sanjay-gandhi') || id.includes('shravanbal') || name.includes('sanjay gandhi') || name.includes('shravan bal') || nameMr.includes('संजय गांधी') || nameMr.includes('श्रावणबाळ')) {
    return {
      url: 'https://sjsa.maharashtra.gov.in/',
      portalName: 'sjsa.maharashtra.gov.in',
      isDirect: true,
      departmentNote: 'सामाजिक न्याय व विशेष सहाय्य विभाग, महाराष्ट्र शासन'
    };
  }
  if (id.includes('mjpjay') || name.includes('jyotirao phule') || name.includes('jan arogya') || nameMr.includes('ज्योतिराव फुले')) {
    return {
      url: 'https://www.jeevandayee.gov.in/',
      portalName: 'jeevandayee.gov.in',
      isDirect: true,
      departmentNote: 'राज्य आरोग्य हमी सोसायटी (MJPJAY), महाराष्ट्र शासन'
    };
  }
  if (id.includes('annasaheb') || name.includes('annasaheb patil') || nameMr.includes('अण्णासाहेब')) {
    return {
      url: 'https://aprdc.maharashtra.gov.in/',
      portalName: 'aprdc.maharashtra.gov.in',
      isDirect: true,
      departmentNote: 'अण्णासाहेब पाटील आर्थिक मागास विकास महामंडळ'
    };
  }
  if (name.includes('lek ladki') || nameMr.includes('लेक लाडकी')) {
    return {
      url: 'https://womenchild.maharashtra.gov.in/',
      portalName: 'womenchild.maharashtra.gov.in',
      isDirect: true,
      departmentNote: 'महिला व बाल विकास विभाग'
    };
  }
  if (name.includes('vayoshri') || nameMr.includes('वयोश्री')) {
    return {
      url: 'https://sjsa.maharashtra.gov.in/',
      portalName: 'sjsa.maharashtra.gov.in',
      isDirect: true,
      departmentNote: 'सामाजिक न्याय व विशेष सहाय्य विभाग'
    };
  }
  if (name.includes('yuva karya') || name.includes('ladka bhau') || nameMr.includes('युवा कार्य')) {
    return {
      url: 'https://rojgar.mahaswayam.gov.in/',
      portalName: 'rojgar.mahaswayam.gov.in',
      isDirect: true,
      departmentNote: 'कौशल्य विकास, रोजगार व उद्योजकता विभाग (Mahaswayam)'
    };
  }
  if (isMh) {
    return {
      url: 'https://aaplesarkar.mahaonline.gov.in/',
      portalName: 'aaplesarkar.mahaonline.gov.in',
      isDirect: true,
      departmentNote: 'आपले सरकार - महाराष्ट्र शासन अधिकृत नागरिक सेवा पोर्टल'
    };
  }

  // 2. Central Government Flagship Schemes
  if (name.includes('pm kisan') || name.includes('pm-kisan') || id.includes('kisan')) {
    return {
      url: 'https://pmkisan.gov.in/',
      portalName: 'pmkisan.gov.in',
      isDirect: true,
      departmentNote: 'Ministry of Agriculture & Farmers Welfare, Govt. of India'
    };
  }
  if (name.includes('awas') || name.includes('pmay') || id.includes('pmay')) {
    return {
      url: 'https://pmaymis.gov.in/',
      portalName: 'pmaymis.gov.in',
      isDirect: true,
      departmentNote: 'Ministry of Housing and Urban Affairs, Govt. of India'
    };
  }
  if (name.includes('ujjwala') || name.includes('pmuy')) {
    return {
      url: 'https://www.pmuy.gov.in/',
      portalName: 'pmuy.gov.in',
      isDirect: true,
      departmentNote: 'Ministry of Petroleum and Natural Gas, Govt. of India'
    };
  }
  if (name.includes('mudra') || id.includes('mudra')) {
    return {
      url: 'https://www.mudra.org.in/',
      portalName: 'mudra.org.in',
      isDirect: true,
      departmentNote: 'Micro Units Development & Refinance Agency Ltd.'
    };
  }
  if (name.includes('svanidhi') || name.includes('street vendor')) {
    return {
      url: 'https://pmsvanidhi.mohua.gov.in/',
      portalName: 'pmsvanidhi.mohua.gov.in',
      isDirect: true,
      departmentNote: 'Ministry of Housing and Urban Affairs (MoHUA)'
    };
  }
  if (name.includes('vishwakarma')) {
    return {
      url: 'https://pmvishwakarma.gov.in/',
      portalName: 'pmvishwakarma.gov.in',
      isDirect: true,
      departmentNote: 'Ministry of Micro, Small & Medium Enterprises (MSME)'
    };
  }
  if (name.includes('ayushman') || name.includes('pmjay') || name.includes('pm-jay')) {
    return {
      url: 'https://pmjay.gov.in/',
      portalName: 'pmjay.gov.in',
      isDirect: true,
      departmentNote: 'National Health Authority (NHA), Govt. of India'
    };
  }
  if (name.includes('sukanya') || name.includes('samriddhi')) {
    return {
      url: 'https://www.indiapost.gov.in/Financial/pages/content/ssy.aspx',
      portalName: 'indiapost.gov.in',
      isDirect: true,
      departmentNote: 'Department of Posts, Ministry of Communications'
    };
  }
  if (name.includes('atal pension') || name.includes('apy')) {
    return {
      url: 'https://www.npscra.nsdl.co.in/scheme-details.php',
      portalName: 'npscra.nsdl.co.in',
      isDirect: true,
      departmentNote: 'Pension Fund Regulatory and Development Authority (PFRDA)'
    };
  }
  if (name.includes('stand up india') || name.includes('standup')) {
    return {
      url: 'https://www.standupmitra.in/',
      portalName: 'standupmitra.in',
      isDirect: true,
      departmentNote: 'Department of Financial Services (DFS), Ministry of Finance'
    };
  }
  if (name.includes('startup india')) {
    return {
      url: 'https://www.startupindia.gov.in/',
      portalName: 'startupindia.gov.in',
      isDirect: true,
      departmentNote: 'DPIIT, Ministry of Commerce and Industry'
    };
  }

  // 3. National myscheme.gov.in direct search
  const queryParam = encodeURIComponent(scheme.name);
  return {
    url: `https://www.myscheme.gov.in/search?q=${queryParam}`,
    portalName: 'myscheme.gov.in',
    isDirect: false,
    departmentNote: `${scheme.issuingAuthority || 'Government of India / State Ministry'} (MyScheme Portal)`
  };
}

export const SchemesCatalogue: React.FC<SchemesCatalogueProps> = ({
  onSelectSchemeForApplication,
  language = 'mr'
}) => {
  // State
  const [schemes, setSchemes] = useState<WelfareScheme[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<SchemeStats | null>(null);
  const [selectedScheme, setSelectedScheme] = useState<WelfareScheme | null>(null);
  const [applyModalScheme, setApplyModalScheme] = useState<WelfareScheme | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [onlyMaharashtra, setOnlyMaharashtra] = useState<boolean>(false);
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [occupationFilter, setOccupationFilter] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  // AI Assistant State
  const [aiQuery, setAiQuery] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<{
    greeting: string;
    advice: string;
    keyBenefitsSummary: string;
    matchedSchemes: WelfareScheme[];
    eligibilityChecklist: string[];
    zeroUploadVerificationDetails: string;
  } | null>(null);

  // Categories list
  const categories = [
    { id: 'ALL', label: 'All Schemes (सर्व योजना)', icon: Landmark },
    { id: 'Agriculture & Farming', label: 'Agriculture & Farming (कृषी व शेतकरी)', icon: Sprout },
    { id: 'Education & Scholarships', label: 'Education & Scholarships (शिक्षण व शिष्यवृत्ती)', icon: GraduationCap },
    { id: 'Women & Child Welfare', label: 'Women & Child (महिला व बालविकास)', icon: Baby },
    { id: 'Social Welfare & Pensions', label: 'Social Welfare & Pensions (सामाजिक न्याय व पेन्शन)', icon: ShieldCheck },
    { id: 'Healthcare & Medical', label: 'Healthcare & Medical (आरोग्य व उपचार)', icon: HeartPulse },
    { id: 'Employment & Skills', label: 'Employment & MSME (रोजगार व स्वयंरोजगार)', icon: Briefcase },
    { id: 'Housing & Urban Development', label: 'Housing (गृहनिर्माण)', icon: Home },
    { id: 'Banking & Financial Inclusion', label: 'Banking & Financial (आर्थिक समावेशन)', icon: Building2 },
    { id: 'Divyangjan & Disability Support', label: 'Divyangjan (दिव्यांग सहाय्य)', icon: Accessibility },
  ];

  // Fetch Stats once
  useEffect(() => {
    fetch('/api/schemes/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Failed to load scheme stats:', err));
  }, []);

  // Prevent background website scrolling when apply or detail modal is open
  useEffect(() => {
    if (applyModalScheme || selectedScheme) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [applyModalScheme, selectedScheme]);

  // Fetch Schemes when filters change
  const fetchSchemes = async (pageNum = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(pageNum),
        limit: '18',
        search: searchQuery,
        category: selectedCategory,
        onlyMaharashtra: String(onlyMaharashtra),
        gender: genderFilter,
        occupation: occupationFilter
      });

      const res = await fetch(`/api/schemes?${params.toString()}`);
      const data = await res.json();
      if (data && data.schemes) {
        setSchemes(data.schemes);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || 0);
        setPage(data.page || 1);
      }
    } catch (err) {
      console.error('Failed to fetch schemes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSchemes(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, onlyMaharashtra, genderFilter, occupationFilter]);

  // AI Scheme Advisor handler
  const handleAiAdvice = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiQuery.trim()) return;

    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/scheme-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: aiQuery,
          language: language === 'mr' ? 'Marathi' : language === 'hi' ? 'Hindi' : 'English'
        })
      });
      const data = await res.json();
      if (data && data.advice) {
        setAiResult(data);
      }
    } catch (err) {
      console.error('AI Scheme Advisor failed:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Agriculture & Farming': return <Sprout className="w-4 h-4 text-emerald-600" />;
      case 'Education & Scholarships': return <GraduationCap className="w-4 h-4 text-blue-600" />;
      case 'Women & Child Welfare': return <Baby className="w-4 h-4 text-pink-600" />;
      case 'Healthcare & Medical': return <HeartPulse className="w-4 h-4 text-red-600" />;
      case 'Employment & Skills': return <Briefcase className="w-4 h-4 text-amber-600" />;
      case 'Housing & Urban Development': return <Home className="w-4 h-4 text-indigo-600" />;
      case 'Social Welfare & Pensions': return <ShieldCheck className="w-4 h-4 text-purple-600" />;
      case 'Divyangjan & Disability Support': return <Accessibility className="w-4 h-4 text-teal-600" />;
      default: return <Landmark className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner & Overview */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-indigo-900/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/30">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Kaggle 4,709+ Verified Government Welfare Schemes + Maharashtra Flagships</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
            शासकीय कल्याणकारी योजना निर्देशिका
            <span className="block text-indigo-300 font-normal text-lg sm:text-xl mt-1">
              All Indian Government & Maharashtra State DBT Schemes Repository
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Explore 4,709+ verified state and national welfare schemes. With Mahasetu's federated interoperability engine, citizens can check eligibility and apply with <strong className="text-amber-300 font-medium">zero manual document uploads</strong>—all proofs (7/12 land records, caste, income, domicile, driving license) are fetched directly from departmental peer adapters.
          </p>

          {/* Metric Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3.5">
              <div className="text-xs text-slate-400 font-medium">Total Schemes</div>
              <div className="text-2xl font-bold text-white mt-0.5">{stats?.totalSchemes || '4,709+'}</div>
              <div className="text-[11px] text-emerald-400 mt-0.5 flex items-center gap-1">
                <Check className="w-3 h-3" /> 100% Verified
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3.5">
              <div className="text-xs text-slate-400 font-medium">Maharashtra State</div>
              <div className="text-2xl font-bold text-amber-300 mt-0.5">{stats?.maharashtraSchemes || '90+'}</div>
              <div className="text-[11px] text-slate-300 mt-0.5">Flagships & State DBT</div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3.5">
              <div className="text-xs text-slate-400 font-medium">Central / National</div>
              <div className="text-2xl font-bold text-indigo-300 mt-0.5">{stats?.nationalSchemes || '697+'}</div>
              <div className="text-[11px] text-slate-300 mt-0.5">All India Coverage</div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3.5">
              <div className="text-xs text-slate-400 font-medium">Zero-Upload Mesh</div>
              <div className="text-2xl font-bold text-emerald-300 mt-0.5">Active</div>
              <div className="text-[11px] text-emerald-300 mt-0.5">6 Peer Adapters</div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Scheme Advisor Card */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-indigo-500/10 border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-600 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2">
                <span>AI योजना सहाय्यक (AI Scheme Advisor)</span>
                <span className="text-xs font-normal px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full border border-amber-300">
                  Powered by Gemini & Kaggle Schemes
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Describe your requirement or situation in Marathi, Hindi, or English (e.g. <em>"माझ्याकडे २ एकर जमीन आहे, शेततळे योजना मिळेल का?"</em>, <em>"Scholarships for OBC engineering students"</em>, <em>"Ladki Bahin scheme"</em>).
              </p>
            </div>

            <form onSubmit={handleAiAdvice} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="उदा: शेतकरी कर्जमाफी, लाडकी बहीण योजना, उच्च शिक्षण शिष्यवृत्ती, अपंग निवृत्तीवेतन..."
                  className="w-full pl-4 pr-10 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 shadow-sm"
                />
                {aiQuery && (
                  <button
                    type="button"
                    onClick={() => setAiQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={aiLoading || !aiQuery.trim()}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white text-sm font-medium rounded-xl shadow-sm transition-all shrink-0"
              >
                {aiLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing 4,709 Schemes...</span>
                  </>
                ) : (
                  <>
                    <Bot className="w-4 h-4" />
                    <span>Ask AI Sahayak</span>
                  </>
                )}
              </button>
            </form>

            {/* AI Advisor Response */}
            <AnimatePresence>
              {aiResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-4 p-4 rounded-xl bg-white border border-amber-200 shadow-md space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-amber-100 pb-2.5">
                    <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>{aiResult.greeting}</span>
                    </div>
                    <button
                      onClick={() => setAiResult(null)}
                      className="text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                    {aiResult.advice}
                  </div>

                  {aiResult.keyBenefitsSummary && (
                    <div className="p-3 bg-amber-50/80 rounded-lg border border-amber-200/60 text-xs text-amber-900">
                      <strong>Key Scheme Benefits:</strong> {aiResult.keyBenefitsSummary}
                    </div>
                  )}

                  {aiResult.eligibilityChecklist && aiResult.eligibilityChecklist.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-xs font-semibold text-slate-700">पात्रता निकष (Eligibility Checklist):</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {aiResult.eligibilityChecklist.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiResult.matchedSchemes && aiResult.matchedSchemes.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="text-xs font-semibold text-slate-700">शिफारस केलेल्या योजना (Recommended Matching Schemes):</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {aiResult.matchedSchemes.map((s) => (
                          <div
                            key={s.id}
                            className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50/50 hover:border-amber-300 transition-all flex flex-col justify-between"
                          >
                            <div>
                              <div className="text-xs font-bold text-slate-900 line-clamp-1">{s.name}</div>
                              {s.nameMr && <div className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">{s.nameMr}</div>}
                              <div className="text-xs text-emerald-700 font-semibold mt-1.5">{s.benefitValue}</div>
                            </div>
                            <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-200/60">
                              <button
                                onClick={() => setSelectedScheme(s)}
                                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium"
                              >
                                तपशील (Details)
                              </button>
                              <button
                                onClick={() => setApplyModalScheme(s)}
                                className="inline-flex items-center gap-1 text-[11px] bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded-lg font-medium shadow-xs hover:shadow transition-all"
                              >
                                <span>Apply</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        {/* Main Search Input & Toggle */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="योजना, विभाग, लाभ किंवा कीवर्ड शोधा (Search 4,709+ schemes by name, department, category, benefit)..."
              className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setOnlyMaharashtra(!onlyMaharashtra)}
              className={`px-3.5 py-2.5 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 shrink-0 ${
                onlyMaharashtra
                  ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>Maharashtra Only (महाराष्ट्र योजना)</span>
            </button>

            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`p-2.5 text-xs font-medium rounded-xl border transition-all flex items-center gap-1.5 ${
                showAdvancedFilters || genderFilter !== 'all' || occupationFilter !== 'all'
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        </div>

        {/* Category Horizontal Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Collapsible Advanced Filters */}
        <AnimatePresence>
          {showAdvancedFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 overflow-hidden text-xs"
            >
              <div>
                <label className="block text-slate-600 font-medium mb-1">Gender Restriction (लिंग)</label>
                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">All Genders (सर्व)</option>
                  <option value="female">Women / Female Only (महिला)</option>
                  <option value="male">Male Only (पुरुष)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Occupation / Target Group (व्यवसाय)</label>
                <select
                  value={occupationFilter}
                  onChange={(e) => setOccupationFilter(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">All Occupations (सर्व)</option>
                  <option value="farmer">Farmers / Agriculture (शेतकरी)</option>
                  <option value="student">Students & Scholars (विद्यार्थी)</option>
                  <option value="entrepreneur">Entrepreneurs / MSME (उद्योजक)</option>
                  <option value="unemployed">Unemployed / Destitute (बेरोजगार / निराधार)</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('ALL');
                    setOnlyMaharashtra(false);
                    setGenderFilter('all');
                    setOccupationFilter('all');
                  }}
                  className="w-full p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results Header & Counter */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <div>
          Showing <span className="font-semibold text-slate-900">{schemes.length}</span> of{' '}
          <span className="font-semibold text-slate-900">{totalCount.toLocaleString()}</span> schemes
          {selectedCategory !== 'ALL' && <span className="ml-1 text-indigo-600">in {selectedCategory}</span>}
          {onlyMaharashtra && <span className="ml-1 text-amber-600">(Maharashtra Priority)</span>}
        </div>
        <div className="text-[11px] text-slate-400">
          Page {page} of {totalPages}
        </div>
      </div>

      {/* Schemes Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-sm font-medium">Loading government welfare schemes database...</p>
        </div>
      ) : schemes.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
          <Landmark className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-semibold text-slate-900">कोणतीही योजना सापडली नाही (No schemes found)</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your search terms, changing the category filter, or clearing the Maharashtra restriction to view all 4,709+ national schemes.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
              setOnlyMaharashtra(false);
            }}
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {schemes.map((scheme) => {
            const isMh = scheme.isMaharashtra;
            return (
              <motion.div
                key={scheme.id}
                layout
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 hover:shadow-lg transition-all duration-200 p-5 flex flex-col justify-between group relative overflow-hidden"
              >
                {/* State Tag Top Accent */}
                {isMh && (
                  <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-3 py-0.5 rounded-bl-lg shadow-sm">
                    Maharashtra State
                  </div>
                )}

                <div className="space-y-3">
                  {/* Category Chip */}
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                      {getCategoryIcon(scheme.category)}
                    </div>
                    <span className="text-xs font-medium text-slate-600 line-clamp-1">{scheme.category}</span>
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {scheme.name}
                    </h3>
                    {scheme.nameMr && (
                      <div className="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">
                        {scheme.nameMr}
                      </div>
                    )}
                  </div>

                  {/* Issuing Authority */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Building2 className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span className="line-clamp-1">{scheme.issuingAuthority}</span>
                  </div>

                  {/* Benefit Callout */}
                  <div className="bg-emerald-50/80 border border-emerald-200/70 rounded-xl p-2.5">
                    <div className="text-[11px] text-emerald-800 font-medium">Estimated Direct Benefit:</div>
                    <div className="text-sm font-bold text-emerald-900 mt-0.5">{scheme.benefitValue}</div>
                    <p className="text-xs text-emerald-700/90 line-clamp-2 mt-1">
                      {scheme.benefitSummary}
                    </p>
                  </div>

                  {/* Interoperability Adapters Tag */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-indigo-500" />
                      <span>Mahasetu Zero-Upload Adapters:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(scheme.adapters || ['UIDAI-L1']).map((ad, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 text-[10px] font-semibold rounded bg-indigo-50 text-indigo-700 border border-indigo-100"
                        >
                          {ad}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedScheme(scheme)}
                    className="text-xs text-slate-600 hover:text-slate-900 font-medium py-1.5 px-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => setApplyModalScheme(scheme)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs hover:shadow transition-all"
                  >
                    <span>Apply</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => {
              if (page > 1) {
                setPage(page - 1);
                fetchSchemes(page - 1);
              }
            }}
            disabled={page <= 1}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="text-xs font-medium text-slate-700 px-3 py-2 bg-white rounded-xl border border-slate-200">
            Page <span className="font-bold text-slate-900">{page}</span> of {totalPages}
          </div>

          <button
            onClick={() => {
              if (page < totalPages) {
                setPage(page + 1);
                fetchSchemes(page + 1);
              }
            }}
            disabled={page >= totalPages}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Detailed Scheme View Modal */}
      <AnimatePresence>
        {selectedScheme && (
          <div
            onClick={e => {
              if (e.target === e.currentTarget) setSelectedScheme(null);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedScheme(null)}
                className="absolute right-5 top-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="space-y-2 pr-8">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                    {selectedScheme.category}
                  </span>
                  {selectedScheme.isMaharashtra && (
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                      Maharashtra Flagship
                    </span>
                  )}
                  {selectedScheme.isNational && (
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      Central DBT
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {selectedScheme.name}
                </h2>
                {selectedScheme.nameMr && (
                  <p className="text-sm font-medium text-slate-600">{selectedScheme.nameMr}</p>
                )}
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedScheme.issuingAuthority}</span>
                </div>
              </div>

              {/* Direct Benefit Value Box */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4">
                <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Direct Scheme Benefit:</div>
                <div className="text-xl font-bold text-emerald-950 mt-1">{selectedScheme.benefitValue}</div>
                <p className="text-xs text-emerald-800 mt-1 leading-relaxed">{selectedScheme.benefitSummary}</p>
              </div>

              {/* Eligibility Criteria */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">पात्रता निकष (Eligibility Rules):</h4>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                  {selectedScheme.eligibility}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
                  {selectedScheme.maxAnnualIncome && (
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">Income Limit:</span>
                      <span className="font-semibold text-slate-800">₹{selectedScheme.maxAnnualIncome}</span>
                    </div>
                  )}
                  {selectedScheme.minAge && (
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">Min Age:</span>
                      <span className="font-semibold text-slate-800">{selectedScheme.minAge} Years</span>
                    </div>
                  )}
                  {selectedScheme.gender && selectedScheme.gender !== 'any' && (
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">Gender:</span>
                      <span className="font-semibold text-slate-800 capitalize">{selectedScheme.gender}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Zero-Upload Peer Adapters */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Mahasetu Interoperability Flow (शून्य कागदपत्रे):</span>
                </h4>
                <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 space-y-2">
                  <p>
                    When applying through Mahasetu, our sovereign federated peer adapters automatically fetch and verify your proofs from official government registries:
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(selectedScheme.adapters || ['UIDAI-L1']).map((ad, i) => (
                      <span key={i} className="px-2.5 py-1 bg-white border border-indigo-200 text-indigo-800 font-semibold rounded-lg text-xs shadow-xs">
                        {ad}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              {(() => {
                const officialInfo = resolveOfficialSchemeUrl(selectedScheme);
                return (
                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <a
                      href={officialInfo.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-indigo-700 hover:text-indigo-900 font-medium flex items-center gap-1.5 order-2 sm:order-1 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
                    >
                      <Landmark className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Open Official Portal ({officialInfo.portalName})</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-0.5 text-slate-400" />
                    </a>

                    <div className="flex items-center gap-2 w-full sm:w-auto order-1 sm:order-2">
                      <button
                        onClick={() => setSelectedScheme(null)}
                        className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => {
                          const s = selectedScheme;
                          setSelectedScheme(null);
                          setApplyModalScheme(s);
                        }}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all"
                      >
                        <span>Apply</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interactive Apply Selection Modal (Choose: via Mahasetu vs. Official Department Portal) */}
      <AnimatePresence>
        {applyModalScheme && (
          <div
            onClick={e => {
              if (e.target === e.currentTarget) setApplyModalScheme(null);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 8 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-5 sm:p-6 space-y-4 relative border border-slate-100 my-auto"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setApplyModalScheme(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                title="Close modal"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Scheme Context Header */}
              <div className="space-y-1.5 pr-8">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700">
                    {applyModalScheme.category || 'Education & Scholarships'}
                  </span>
                  {applyModalScheme.isMaharashtra && (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                      Maharashtra Flagship
                    </span>
                  )}
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                  {applyModalScheme.name}
                </h3>
                {applyModalScheme.nameMr && (
                  <p className="text-xs text-slate-500 font-medium">{applyModalScheme.nameMr}</p>
                )}

                {/* Benefit Badge */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50/90 border border-emerald-200 text-emerald-800 text-xs font-semibold mt-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>लाभ: {applyModalScheme.benefitValue || 'Direct Benefit Transfer (DBT)'}</span>
                </div>
              </div>

              {/* Option 1: Apply via Mahasetu Mesh (Zero-Upload Paperless) - NO recommended tag */}
              <div className="border-2 border-indigo-600 rounded-2xl p-4 bg-white space-y-3 relative">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm sm:text-base font-bold text-slate-900">Apply via Mahasetu</h4>
                      <span className="px-1.5 py-0.5 text-[9.5px] font-bold rounded bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                        ZERO UPLOADS
                      </span>
                    </div>
                    <p className="text-xs text-indigo-900/90 font-medium mt-0.5">
                      शून्य कागदपत्रे • 1-Click Federated Verification
                    </p>
                  </div>
                </div>

                {/* Verified Points Box */}
                <div className="space-y-1.5 bg-slate-50/90 p-3 rounded-xl border border-slate-100/80 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>7/12 Land, Income & Caste verified via registry</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>No document scanning or certificate uploads needed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Citizen consent verified with immutable ledger</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const s = applyModalScheme;
                    setApplyModalScheme(null);
                    if (onSelectSchemeForApplication && s) {
                      onSelectSchemeForApplication(s);
                    }
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>Continue via Mahasetu (शून्य कागदपत्रे)</span>
                  <ArrowRight className="w-4 h-4 text-indigo-200" />
                </button>
              </div>

              {/* Option 2: Go to Official Government Portal */}
              {(() => {
                const officialInfo = resolveOfficialSchemeUrl(applyModalScheme);
                let officialDomain = 'mahadbt.maharashtra.gov.in';
                try {
                  if (officialInfo.url && officialInfo.url.startsWith('http')) {
                    officialDomain = new URL(officialInfo.url).hostname.replace(/^www\./, '');
                  } else if (officialInfo.portalName) {
                    officialDomain = officialInfo.portalName;
                  }
                } catch {
                  officialDomain = officialInfo.portalName || 'mahadbt.maharashtra.gov.in';
                }

                return (
                  <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Landmark className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm sm:text-base font-bold text-slate-900">Go to Official Government Portal</h4>
                          <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                            External
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          शासकीय अधिकृत संकेतस्थळावर अर्ज करा
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50/90 rounded-xl border border-slate-100/80 text-xs space-y-1">
                      <div className="text-slate-600">
                        Destination:{' '}
                        <a
                          href={officialInfo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-indigo-600 hover:underline inline-flex items-center gap-1 ml-1"
                        >
                          <span>{officialDomain}</span>
                          <ExternalLink className="w-3 h-3 text-indigo-500" />
                        </a>
                      </div>
                      <p className="text-[11px] text-slate-500 italic">
                        * Note: Requires manual account registration & scanned PDF document uploads.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        window.open(officialInfo.url, '_blank', 'noopener,noreferrer');
                        setApplyModalScheme(null);
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <Landmark className="w-4 h-4 text-amber-400" />
                      <span>Open Official Portal (अधिकृत संकेतस्थळ)</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>
                );
              })()}

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-2 text-xs">
                <div className="flex items-center gap-2 text-slate-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>महाराष्ट्र शासन डिजिटल महासेतू</span>
                </div>
                <button
                  type="button"
                  onClick={() => setApplyModalScheme(null)}
                  className="text-slate-600 hover:text-slate-900 font-semibold transition-colors"
                >
                  Cancel / मागे जा
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
