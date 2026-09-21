/**
 * Mahasetu AI Citizen Sahayak
 * Powered by Google Gemini API (@google/genai)
 * Grounded in the Mahasetu Official Domain Knowledge Base & 4,709+ Welfare Schemes Dataset
 * 
 * Capabilities:
 * 1. Strict Domain Guardrail: Rejects out-of-context requests (weather, code generation, general trivia)
 * 2. Citizen Unified Profile Integration: Analyzes user credentials (income, category, gender, land holding)
 * 3. Cross-Departmental Routing: Maps queries directly to official departments and schemes
 * 4. Zero-Upload Explanations: Explains peer-to-peer verification through state adapters
 */

import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  MessageSquare,
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  Building2,
  Clock,
  UserCheck,
  ExternalLink,
  BookOpen,
  Send,
  HelpCircle
} from 'lucide-react';
import { CitizenUser, WelfareScheme } from '../types.ts';
import { Language, TRANSLATIONS } from '../locales.ts';
import { getLocalizedScheme } from '../utils/schemeLocalization.ts';

interface Props {
  language: Language;
  currentUser?: CitizenUser | null;
  onApplyForService: (serviceCode: string) => void;
  onNavigateToSchemes?: (category?: string, search?: string) => void;
}

export const AISahayak: React.FC<Props> = ({
  language,
  currentUser,
  onApplyForService,
  onNavigateToSchemes
}) => {
  const t = TRANSLATIONS[language];
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<any | null>(null);
  const [poolStatus, setPoolStatus] = useState<{
    totalConfiguredKeys: number;
    activeKeys: number;
    coolingDownKeys: number;
    poolRedundancyEnabled: boolean;
  } | null>(null);

  React.useEffect(() => {
    if (!isLoading) {
      setLoadingStep(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev + 1) % 4);
    }, 1600);
    return () => clearInterval(interval);
  }, [isLoading]);

  React.useEffect(() => {
    fetch('/api/ai/pool-status')
      .then(res => res.json())
      .then(data => setPoolStatus(data))
      .catch(() => {});
  }, []);

  const isMr = language === 'mr';
  const isHi = language === 'hi';

  const samplePrompts = [
    {
      category: 'profile',
      label: isMr ? 'माझ्या प्रोफाइलसाठी योजना' : isHi ? 'मेरी प्रोफाइल हेतु योजनाएं' : 'Schemes for My Profile',
      text: isMr
        ? 'माझ्या प्रोफाइलनुसार मला कोणत्या शासकीय योजना व अनुदानाचा लाभ मिळू शकतो?'
        : isHi
        ? 'मेरी प्रोफाइल के अनुसार मुझे कौन-सी सरकारी योजनाओं का लाभ मिल सकता है?'
        : 'Based on my unified citizen profile, which government welfare schemes am I eligible for?'
    },
    {
      category: 'ladki-bahin',
      label: isMr ? 'माझी लाडकी बहीण योजना' : isHi ? 'लाड़की बहिन योजना' : 'Ladki Bahin Yojana',
      text: isMr
        ? 'माझी लाडकी बहीण योजनेची पात्रता काय आहे आणि ₹१,५०० दरमहा मिळवण्यासाठी काय करावे लागेल?'
        : isHi
        ? 'मुख्यमंत्री माझी लाड़की बहिन योजना की पात्रता क्या है और प्रतिमाह ₹1,500 कैसे मिलेंगे?'
        : 'What is the eligibility for Mukhyamantri Majhi Ladki Bahin Yojana and how to receive ₹1,500 monthly?'
    },
    {
      category: 'farmer',
      label: isMr ? 'शेतकरी सन्मान व ७/१२' : isHi ? 'किसान सम्मान एवं 7/12' : 'Farmer 7/12 & Subsidy',
      text: isMr
        ? 'नमो शेतकरी महासन्मान निधीसाठी ७/१२ उतारा आणि आधार कसा पडताळायचा?'
        : isHi
        ? 'नमो शेतकरी महासम्मान निधि के लिए 7/12 भूमि रिकॉर्ड और आधार कैसे सत्यापित होगा?'
        : 'How does Mahasetu verify 7/12 land extract and Aadhaar for Namo Shetkari Sanman Nidhi without physical visits?'
    },
    {
      category: 'scholarship',
      label: isMr ? 'उच्च शिक्षण शिष्यवृत्ती' : isHi ? 'उच्च शिक्षा छात्रवृत्ति' : 'Higher Ed Scholarship',
      text: isMr
        ? 'मला इंजिनीअरिंग / मेडिकल कॉलेजसाठी महाडीबीटी छत्रपती शाहू महाराज शिष्यवृत्ती हवी आहे.'
        : isHi
        ? 'मुझे इंजीनियरिंग/मेडिकल कॉलेज हेतु महाडीबीटी छात्रवृत्ति के नियम व दस्तावेज जानने हैं।'
        : 'I need Rajarshi Chhatrapati Shahu Maharaj Merit Scholarship for engineering college.'
    },
    {
      category: 'transport',
      label: isMr ? 'लर्नर ड्रायव्हिंग लायसन्स' : isHi ? 'लर्नर ड्राइविंग लाइसेंस' : 'Learner Driving License',
      text: isMr
        ? 'मला शिकाऊ वाहन चालक परवाना (Learner Driving License) आरटीओ कार्यालयात न जाता कसा काढता येईल?'
        : isHi
        ? 'मुझे आरटीओ कार्यालय जाए बिना लर्नर ड्राइविंग लाइसेंस कैसे मिलेगा?'
        : 'How can I get a Learner Driving License without visiting the RTO office?'
    },
    {
      category: 'civil',
      label: isMr ? 'उत्पन्न व EWS दाखला' : isHi ? 'आय एवं EWS प्रमाण पत्र' : 'Income & EWS Certificate',
      text: isMr
        ? 'माझे वार्षिक कौटुंबिक उत्पन्न ८ लाखांपेक्षा कमी आहे, EWS व उत्पन्न दाखला कसा मिळेल?'
        : isHi
        ? 'मेरी वार्षिक पारिवारिक आय 8 लाख से कम है, EWS और आय प्रमाण पत्र कैसे प्राप्त करें?'
        : 'My family income is under 8 lakhs. How can I get an EWS and Income Certificate through Mahasetu?'
    }
  ];

  const handleAskAI = async (textToAsk?: string) => {
    const q = textToAsk || query;
    if (!q.trim()) return;

    setIsLoading(true);
    setResult(null);

    const payload: any = {
      query: q,
      language: language === 'mr' ? 'Marathi' : language === 'hi' ? 'Hindi' : 'English'
    };

    if (currentUser) {
      payload.citizenProfile = {
        id: currentUser.id,
        name: currentUser.name,
        gender: currentUser.gender,
        annualIncome: currentUser.annualIncome,
        category: currentUser.category,
        rationCardType: currentUser.rationCardType,
        address: currentUser.address,
        landHolding: currentUser.landHolding
      };
    }

    try {
      const res = await fetch('/api/ai/navigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.warn('AI navigation network fallback:', e);
      setResult({
        serviceCode: 'SRV_MAHADBT_SCHOLARSHIP',
        serviceName: isMr
          ? 'राजर्षी छत्रपती शाहू महाराज गुणवत्ता शिष्यवृत्ती'
          : isHi
          ? 'राजर्षि छत्रपति शाहू महाराज मेरिट छात्रवृत्ति'
          : 'Rajarshi Chhatrapati Shahu Maharaj Merit Scholarship',
        department: isMr
          ? 'उच्च व तंत्र शिक्षण विभाग (महाडीबीटी)'
          : isHi
          ? 'उच्च एवं तकनीकी शिक्षा विभाग (महाडीबीटी)'
          : 'Higher & Technical Education Department',
        explanation: isMr
          ? 'आपल्या विचारणेशी संबंधित शासकीय सेवा महासेतू आंतर-विभागीय पडताळणीद्वारे उपलब्ध आहेत.'
          : isHi
          ? 'आपके अनुरोध से संबंधित सरकारी सेवाएं महासेतु अंतर-विभागीय सत्यापन द्वारा उपलब्ध हैं।'
          : 'Identified Maharashtra public service. All proofs are verified peer-to-peer with zero paper scans.',
        requiredDocuments: isMr
          ? ['सक्षम प्राधिकाऱ्याचा उत्पन्न दाखला', 'महाराष्ट्र अधिवास प्रमाणपत्र']
          : isHi
          ? ['आय प्रमाण पत्र (राजस्व विभाग)', 'महाराष्ट्र अधिवास प्रमाण पत्र']
          : ['Income Certificate (Revenue)', 'Maharashtra Domicile Certificate'],
        availableInMesh: isMr
          ? ['सक्षम प्राधिकाऱ्याचा उत्पन्न दाखला', 'महाराष्ट्र अधिवास प्रमाणपत्र']
          : isHi
          ? ['आय प्रमाण पत्र (राजस्व विभाग)', 'महाराष्ट्र अधिवास प्रमाण पत्र']
          : ['Income Certificate (Revenue)', 'Maharashtra Domicile Certificate'],
        confidence: 0.95
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white/80 backdrop-blur-xl border border-black/8 rounded-3xl p-6 sm:p-7 shadow-[0_18px_44px_-26px_rgba(0,0,0,0.10)] relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-13 h-13 rounded-2xl bg-black/5 border border-black/10 text-[#141414] flex items-center justify-center font-bold text-xl shrink-0 shadow-xs mt-1">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {isMr ? 'अधिकृत DPI साहाय्यक' : isHi ? 'आधिकारिक DPI सहायक' : 'Official DPI Sahayak'}
                </span>
                <span className="text-[10px] font-semibold text-[#5c5c5c] bg-black/5 px-2.5 py-0.5 rounded-full border border-black/5">
                  {isMr ? '४,७०९+ योजना संच व माहिती' : isHi ? '4,709+ योजना भंडार एवं डेटा' : 'Knowledge Base & 4,709+ Schemes'}
                </span>
                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  मराठी • हिंदी • English
                </span>
                {poolStatus && poolStatus.totalConfiguredKeys > 0 && (
                  <span
                    id="badge-key-pool-status"
                    className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-full flex items-center gap-1"
                    title={`${poolStatus.totalConfiguredKeys} Gemini API key(s) in pool. Auto-failover active.`}
                  >
                    <ShieldCheck className="w-3 h-3 text-indigo-600" />
                    {poolStatus.totalConfiguredKeys > 1
                      ? `${poolStatus.totalConfiguredKeys}x Key Pool Failover`
                      : (isMr ? 'AI प्रणाली सज्ज' : isHi ? 'AI इंजन सक्रिय' : 'AI Engine Ready')}
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#111111] mt-1.5">
                {t.navAiSahayak}
              </h2>
              <p className="text-xs text-[#5c5c5c] mt-1 max-w-2xl leading-relaxed">
                {isMr
                  ? 'महासेतू अधिकृत एआय साहाय्यक: महाराष्ट्र शासन व केंद्र सरकारच्या जनकल्याणकारी योजना, दाखले (७/१२, जात, उत्पन्न, अधिवास), शेतकरी अनुदान व शिष्यवृत्ती या विषयांवर अधिकृत मार्गदर्शन. असंबंधित प्रश्न आपोआप वगळले जातात.'
                  : isHi
                  ? 'महासेतु आधिकारिक एआई सहायक: महाराष्ट्र सरकार एवं केंद्र सरकार की कल्याणकारी योजनाओं, प्रमाण पत्रों, किसान सब्सिडी एवं छात्रवृत्ति हेतु अधिकृत मार्गदर्शन। असंबंधित प्रश्न स्वतः अस्वीकृत होते हैं।'
                  : 'Official Mahasetu AI Citizen Assistant: Authorized guidance for Maharashtra and Central Government welfare schemes, civil certificates (7/12, caste, income, domicile), farmer subsidies, and scholarships. Unrelated queries are strictly guarded.'}
              </p>
            </div>
          </div>

          {/* Citizen Unified Profile Context Status */}
          <div className="md:text-right shrink-0">
            {currentUser ? (
              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-left md:text-right">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 justify-start md:justify-end">
                  <UserCheck className="w-4 h-4 text-emerald-700" />
                  <span>{currentUser.name}</span>
                </div>
                <div className="text-[11px] text-emerald-800 mt-0.5 space-x-1 font-medium">
                  <span>{currentUser.gender || 'Citizen'}</span>
                  <span>•</span>
                  <span>{currentUser.category || 'General'}</span>
                  <span>•</span>
                  <span>₹{(currentUser.annualIncome || 0).toLocaleString('en-IN')}/{isMr ? 'वर्ष' : isHi ? 'वर्ष' : 'yr'}</span>
                </div>
                <div className="text-[10px] text-emerald-700 mt-1 font-medium">
                  {isMr ? '✓ प्रोफाइल आधारित पात्रता सक्रिय' : isHi ? '✓ प्रोफाइल आधारित पात्रता सक्रिय' : '✓ Profile-aware eligibility active'}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-black/5 border border-black/8 rounded-2xl text-left md:text-right">
                <span className="text-xs font-semibold text-[#5c5c5c] block">
                  {isMr ? 'अतिथी नागरिक' : isHi ? 'अतिथि नागरिक' : 'Guest Citizen'}
                </span>
                <span className="text-[11px] text-[#777777] block mt-0.5">
                  {isMr
                    ? 'बायोमेट्रिक लॉगिन केल्यास प्रोफाइल जुळवणी होईल'
                    : isHi
                    ? 'बायोमेट्रिक लॉगिन करने पर व्यक्तिगत पात्रता प्राप्त होगी'
                    : 'Log in via Aadhaar for personalized qualification'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Query Box & Sample Prompts */}
      <div className="bg-white/80 backdrop-blur-xl border border-black/8 rounded-3xl p-6 sm:p-7 shadow-[0_18px_44px_-26px_rgba(0,0,0,0.10)] space-y-5">
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-[#5c5c5c] block mb-2">
            {isMr
              ? 'शासकीय सेवा, योजना किंवा दाखल्याविषयी विचारा:'
              : isHi
              ? 'सरकारी सेवा, योजना अथवा प्रमाण पत्र के बारे में पूछें:'
              : 'Ask about any Maharashtra government service, certificate, or welfare scheme:'}
          </label>
          <div className="relative">
            <textarea
              id="input-ai-sahayak-query"
              rows={3}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAskAI();
                }
              }}
              placeholder={
                isMr
                  ? 'उदा. मला इंजिनीअरिंगसाठी शिष्यवृत्ती हवी आहे, माझी लाडकी बहीण योजनेची पात्रता काय आहे, किंवा ७/१२ उतारा कसा काढायचा...'
                  : isHi
                  ? 'उदा. मुझे लाड़की बहिन योजना की पात्रता जाननी है, 7/12 भूमि रिकॉर्ड कैसे प्राप्त करें, या ड्राइविंग लाइसेंस कैसे बनेगा...'
                  : 'E.g., Which schemes match my profile, what is the eligibility for Ladki Bahin Yojana, or how to get a 7/12 land extract...'
              }
              className="w-full p-4 pr-32 bg-white/70 border border-black/10 rounded-2xl text-sm font-medium text-[#111111] placeholder:text-[#8c8c8c] focus:outline-none focus:border-black focus:ring-1 focus:ring-black resize-none transition-all shadow-inner"
            />
            <button
              id="btn-ask-gemini-sahayak"
              type="button"
              disabled={isLoading || !query.trim()}
              onClick={() => handleAskAI()}
              className="absolute right-3.5 bottom-4 px-4 py-2.5 bg-[#141414] hover:bg-black text-white rounded-xl text-xs font-semibold tracking-wide shadow-sm hover:shadow transition-all flex items-center gap-1.5 disabled:opacity-40"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{isMr ? 'विश्लेषण सुरू आहे...' : isHi ? 'विश्लेषण जारी है...' : 'Analyzing...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.aiQueryBtn}</span>
                </>
              )}
            </button>
          </div>
          <div className="text-[11px] text-[#777777] mt-1.5 flex items-center justify-between">
            <span>
              {isMr
                ? '💡 टीप: केवळ महाराष्ट्र शासन व केंद्र सरकारच्या योजनांशी संबंधित प्रश्न विचारा.'
                : isHi
                ? '💡 नोट: केवल सरकारी योजनाओं, प्रमाण पत्रों और नागरिक सेवाओं के संबंध में पूछें।'
                : '💡 Note: Strictly limited to government welfare schemes, civil certificates, and public services.'}
            </span>
            <span className="hidden sm:inline text-[10px] text-[#888888]">Ctrl + Enter to send</span>
          </div>
        </div>

        {/* Quick sample prompt chips */}
        <div>
          <span className="text-[11px] font-semibold text-[#5c5c5c] uppercase tracking-wider block mb-2.5">
            {isMr
              ? 'नागरिकांचे वारंवार विचारले जाणारे अधिकृत प्रश्न:'
              : isHi
              ? 'नागरिकों द्वारा अक्सर पूछे जाने वाले आधिकारिक प्रश्न:'
              : 'Suggested Citizen Inquiries:'}
          </span>
          <div className="flex flex-wrap gap-2.5">
            {samplePrompts.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setQuery(p.text);
                  handleAskAI(p.text);
                }}
                className="text-xs bg-white/80 hover:bg-white text-[#111111] border border-black/8 hover:border-black/20 px-3.5 py-2 rounded-full font-medium transition-all text-left flex items-center gap-2 shadow-xs hover:shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#5c5c5c] shrink-0" />
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Skeleton Loading Animation & Processing State */}
      {isLoading && (
        <div id="ai-sahayak-loading-state" className="space-y-4">
          {/* Animated Processing Status Banner */}
          <div
            id="ai-processing-banner"
            className="bg-white/95 backdrop-blur-md border border-black/10 rounded-2xl p-4 sm:p-5 shadow-xs relative overflow-hidden"
          >
            {/* Top gradient pulse line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 animate-pulse" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      {isMr ? 'प्रक्रिया सुरू आहे' : isHi ? 'प्रक्रिया जारी है' : 'Processing'}
                    </span>
                    <span className="text-xs font-semibold text-[#111111]">
                      {isMr
                        ? 'महासेतू एआय साहाय्यक'
                        : isHi
                        ? 'महासेतु एआई सहायक'
                        : 'Mahasetu AI Citizen Sahayak'}
                    </span>
                  </div>
                  <p className="text-xs text-[#555555] mt-1 font-medium transition-all duration-300">
                    {loadingStep === 0 && (
                      isMr
                        ? 'विचारणा स्वीकारली... महासेतू एआय द्वारे विश्लेषण सुरू आहे...'
                        : isHi
                        ? 'अनुरोध प्राप्त हुआ... महासेतु एआई द्वारा विश्लेषण जारी है...'
                        : 'Inquiry received. Analyzing with Mahasetu AI Sahayak...'
                    )}
                    {loadingStep === 1 && (
                      isMr
                        ? 'नागरिक युनिफाइड प्रोफाइल, उत्पन्न व शेतजमीन निकष तपासले जात आहेत...'
                        : isHi
                        ? 'नागरिक एकीकृत प्रोफाइल, आय एवं भूमि रिकॉर्ड की जांच की जा रही है...'
                        : 'Evaluating citizen profile credentials, income ceiling & land holding...'
                    )}
                    {loadingStep === 2 && (
                      isMr
                        ? '४,७०९+ महाराष्ट्र शासकीय योजना व विभागांशी संदर्भ जुळवला जात आहे...'
                        : isHi
                        ? '4,709+ महाराष्ट्र सरकारी योजनाओं एवं विभागों से संदर्भ मिलान किया जा रहा है...'
                        : 'Cross-referencing 4,709+ Maharashtra Welfare Schemes & departmental registries...'
                    )}
                    {loadingStep === 3 && (
                      isMr
                        ? 'शून्य-कागदपत्र पडताळणी मार्ग व शिफारसी तयार केल्या जात आहेत...'
                        : isHi
                        ? 'शून्य-कागजी सत्यापन व अधिकृत अनुशंसाएं तैयार की जा रही हैं...'
                        : 'Formulating Zero-Upload guidance & verified service pathways...'
                    )}
                  </p>
                </div>
              </div>

              {/* Progress step dots */}
              <div className="flex items-center gap-1.5 self-start sm:self-center bg-black/5 px-3 py-1.5 rounded-full">
                {[0, 1, 2, 3].map(step => (
                  <span
                    key={step}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      loadingStep === step
                        ? 'w-6 bg-emerald-600'
                        : loadingStep > step
                        ? 'w-2 bg-emerald-400'
                        : 'w-2 bg-black/20'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Skeleton Result Card mirroring the real structure */}
          <div
            id="ai-skeleton-result-card"
            className="bg-white/80 backdrop-blur-xl border border-black/10 rounded-3xl p-6 sm:p-7 shadow-[0_18px_44px_-26px_rgba(0,0,0,0.12)] space-y-6 animate-pulse"
          >
            {/* Header row skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-black/8 pb-4">
              <div className="space-y-2.5 w-full sm:w-2/3">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-36 bg-emerald-100/60 rounded-full" />
                  <div className="h-5 w-28 bg-black/5 rounded-full" />
                </div>
                <div className="h-7 w-3/4 max-w-md bg-black/10 rounded-xl" />
                <div className="flex items-center gap-2 pt-1">
                  <div className="h-4 w-32 bg-black/5 rounded-md" />
                  <div className="h-4 w-20 bg-black/5 rounded-md" />
                  <div className="h-4 w-16 bg-emerald-100/70 rounded-md" />
                </div>
              </div>
              <div className="h-7 w-24 bg-emerald-100/70 rounded-full self-start" />
            </div>

            {/* Profile eligibility banner skeleton */}
            <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-200/70 shrink-0 mt-0.5" />
              <div className="space-y-2 flex-1">
                <div className="h-3.5 w-48 bg-emerald-200/60 rounded" />
                <div className="h-3 w-5/6 bg-emerald-200/40 rounded" />
              </div>
            </div>

            {/* Guidance / Explanation text skeleton */}
            <div className="p-4 bg-black/[0.03] border border-black/5 rounded-2xl space-y-2.5">
              <div className="h-3.5 w-32 bg-black/15 rounded" />
              <div className="h-3.5 w-full bg-black/10 rounded" />
              <div className="h-3.5 w-11/12 bg-black/10 rounded" />
              <div className="h-3.5 w-4/5 bg-black/10 rounded" />
              <div className="h-3 w-2/3 bg-black/5 rounded pt-1" />
            </div>

            {/* Required proofs grid skeleton */}
            <div className="space-y-2.5">
              <div className="h-3 w-64 bg-black/10 rounded" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[1, 2, 3, 4].map(idx => (
                  <div
                    key={idx}
                    className="p-3 bg-white/70 rounded-xl border border-black/8 flex items-center gap-2.5"
                  >
                    <div className="w-4 h-4 rounded-full bg-emerald-200/70 shrink-0" />
                    <div className="h-3.5 w-3/4 bg-black/10 rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Matched schemes preview skeleton */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between">
                <div className="h-3.5 w-56 bg-black/10 rounded" />
                <div className="h-3.5 w-24 bg-black/5 rounded" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[1, 2].map(idx => (
                  <div
                    key={idx}
                    className="p-4 bg-white border border-black/8 rounded-2xl space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-3 w-20 bg-emerald-100/70 rounded-full" />
                      <div className="h-3 w-16 bg-black/5 rounded-full" />
                    </div>
                    <div className="h-4 w-4/5 bg-black/10 rounded" />
                    <div className="h-3 w-full bg-black/5 rounded" />
                    <div className="h-3 w-2/3 bg-black/5 rounded" />
                    <div className="pt-2 border-t border-black/5 flex items-center justify-between">
                      <div className="h-3.5 w-20 bg-emerald-200/60 rounded" />
                      <div className="h-3.5 w-24 bg-black/10 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Structured Response Card */}
      {result && (
        <div className="space-y-4">
          {/* CASE 1: OUT OF SCOPE STRICT REFUSAL */}
          {result.isOutOfScope ? (
            <div
              id="ai-out-of-scope-card"
              className="bg-amber-50/80 border-2 border-amber-300 rounded-3xl p-6 sm:p-7 shadow-[0_18px_44px_-26px_rgba(217,119,6,0.20)] space-y-4 relative overflow-hidden"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full">
                      {isMr
                        ? 'विषयाशी असंबंधित विचारणा (Out of Scope)'
                        : isHi
                        ? 'विषय से बाहर का अनुरोध (Out of Scope)'
                        : 'Request Out of Context'}
                    </span>
                    <span className="text-[11px] font-semibold text-amber-800">
                      {isMr ? 'महासेतू नागरिक नियंत्रण' : isHi ? 'महासेतु नागरिक नियंत्रण' : 'Mahasetu Citizen Guardrail'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-amber-950 mt-1">
                    {result.serviceName || (isMr ? 'हा प्रश्न महासेतूच्या कक्षेबाहेरचा आहे' : isHi ? 'यह प्रश्न महासेतु के दायरे से बाहर है' : 'Your request is out of context for Mahasetu')}
                  </h3>
                  <p className="text-xs text-amber-900 mt-2 leading-relaxed font-medium">
                    {result.explanation}
                  </p>
                  {result.advice && (
                    <div className="mt-3 p-3.5 bg-white/70 border border-amber-200 rounded-xl text-xs text-amber-950 leading-relaxed">
                      <span className="font-bold block mb-1">
                        {isMr ? 'मार्गदर्शक सूचना:' : isHi ? 'मार्गदर्शक सूचना:' : 'Advisory Note:'}
                      </span>
                      {result.advice}
                    </div>
                  )}
                </div>
              </div>

              {/* Recommended on-topic suggestions */}
              <div className="pt-3 border-t border-amber-200/80">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block mb-2">
                  {isMr
                    ? 'कृपया यापैकी कोणत्याही शासकीय सेवेबद्दल विचारा:'
                    : isHi
                    ? 'कृपया इनमें से किसी सरकारी सेवा के बारे में पूछें:'
                    : 'Please ask about official government services:'}
                </span>
                <div className="flex flex-wrap gap-2">
                  {(result.suggestedTopics || (isMr ? [
                    'माझी लाडकी बहीण योजना',
                    '७/१२ डिजिटल उतारा',
                    'महाडीबीटी शिष्यवृत्ती',
                    'शिकाऊ वाहन परवाना',
                    'जात व उत्पन्न दाखला'
                  ] : isHi ? [
                    'लाड़की बहिन योजना',
                    '7/12 भूमि रिकॉर्ड',
                    'महाडीबीटी छात्रवृत्ति',
                    'लर्नर ड्राइविंग लाइसेंस',
                    'जाति एवं आय प्रमाण पत्र'
                  ] : [
                    'Majhi Ladki Bahin Yojana',
                    '7/12 Land Record',
                    'MahaDBT Scholarship',
                    'Learner Driving License',
                    'Caste & Income Certificate'
                  ])).map((topic: string, idx: number) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        const newQ = isMr
                          ? `${topic} विषयी मला संपूर्ण माहिती व अर्ज प्रक्रिया सांगा.`
                          : isHi
                          ? `${topic} के बारे में मुझे पूरी जानकारी एवं आवेदन प्रक्रिया बताएं।`
                          : `Tell me the eligibility and application process for ${topic}.`;
                        setQuery(newQ);
                        handleAskAI(newQ);
                      }}
                      className="text-xs bg-white text-amber-950 hover:bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-xl font-medium transition-all shadow-xs"
                    >
                      <span>{topic}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* CASE 2: GENUINE GOVERNMENT SERVICE OR GREETING */
            <div
              id="ai-on-topic-result-card"
              className="bg-white/85 backdrop-blur-xl border border-black/10 rounded-3xl p-6 sm:p-7 shadow-[0_18px_44px_-26px_rgba(0,0,0,0.12)] space-y-6 relative overflow-hidden"
            >
              {/* Header result row */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-black/8 pb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      {result.isGreeting
                        ? (isMr ? 'महासेतू स्वागत व शोध' : isHi ? 'महासेतु स्वागत एवं खोज' : 'Welcome & Discovery')
                        : (isMr ? 'अधिकृत शासकीय सेवा निश्चिती' : isHi ? 'अधिकृत सरकारी सेवा सत्यापन' : 'Government Service Identified')}
                    </span>
                    <span className="text-[10px] font-semibold text-[#5c5c5c] bg-black/5 border border-black/5 px-2 py-0.5 rounded-full">
                      {result.source === 'gemini' ? (isMr ? 'जेमिनी एआय विश्लेषण' : isHi ? 'जेमिनी एआई विश्लेषण' : 'Google Gemini Analysis') : (isMr ? 'महासेतू ज्ञान संच' : isHi ? 'महासेतु ज्ञान संच' : 'Mahasetu Knowledge Base')}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-[#111111] mt-2">
                    {result.serviceName || (isMr ? 'महाराष्ट्र सार्वजनिक सेवा' : isHi ? 'महाराष्ट्र सार्वजनिक सेवा' : 'Maharashtra Public Service')}
                  </h3>
                  <div className="text-xs text-[#5c5c5c] mt-1 font-medium flex flex-wrap items-center gap-2">
                    <span>
                      {isMr ? 'संबंधित विभाग:' : isHi ? 'संबंधित विभाग:' : 'Department:'} <span className="font-semibold text-[#111111]">{result.department}</span>
                    </span>
                    {result.slaDays && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-neutral-700">
                          <Clock className="w-3 h-3 text-neutral-500" />
                          SLA: {result.slaDays} {isMr ? 'दिवस' : isHi ? 'दिन' : 'Days'}
                        </span>
                      </>
                    )}
                    {typeof result.feeInr === 'number' && (
                      <>
                        <span>•</span>
                        <span className="font-semibold text-emerald-700">
                          {result.feeInr === 0 ? (isMr ? 'विनामूल्य (₹०)' : isHi ? 'निःशुल्क (₹0)' : 'Free (₹0)') : `₹${result.feeInr}`}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {result.confidence && (
                  <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full self-start">
                    {isMr ? 'अचूकता:' : isHi ? 'सटीकता:' : 'MATCH:'} {Math.round(result.confidence * 100)}%
                  </span>
                )}
              </div>

              {/* Citizen Unified Profile Evaluation (if available) */}
              {result.profileEligibilityNote && (
                <div className="p-4 bg-emerald-50/90 border border-emerald-200 rounded-2xl flex items-start gap-3">
                  <UserCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-950 leading-relaxed">
                    <span className="font-bold text-emerald-900 block mb-0.5">
                      {isMr
                        ? 'आपल्या नागरिक प्रोफाइलनुसार पात्रता पडताळणी:'
                        : isHi
                        ? 'आपकी नागरिक प्रोफाइल के अनुसार पात्रता मूल्यांकन:'
                        : 'Citizen Profile Eligibility Assessment:'}
                    </span>
                    <p>{result.profileEligibilityNote}</p>
                  </div>
                </div>
              )}

              {/* Citizen guidance advice & explanation */}
              <div className="p-4 bg-black/5 border border-black/5 rounded-2xl text-xs text-[#111111] leading-relaxed space-y-2">
                <div>
                  <span className="font-bold text-[#111111] block mb-1">
                    {result.greeting || (isMr ? 'मार्गदर्शन व माहिती:' : isHi ? 'मार्गदर्शन एवं जानकारी:' : 'Guidance & Advice:')}
                  </span>
                  <p className="text-[#222222] font-medium">{result.explanation}</p>
                </div>
                {result.advice && (
                  <p className="text-[#444444] pt-2 border-t border-black/5">{result.advice}</p>
                )}
                {result.summary && (
                  <p className="text-[11px] text-[#555555] italic">{result.summary}</p>
                )}
              </div>

              {/* Required Documents / Proofs Handled Automatically */}
              {result.requiredDocuments && result.requiredDocuments.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#5c5c5c] block mb-2.5">
                    {isMr
                      ? 'महासेतू आंतर-विभागीय प्रणालीद्वारे विना-कागदपत्र तपासले जाणारे पुरावे:'
                      : isHi
                      ? 'महासेतु अंतर-विभागीय प्रणाली द्वारा बिना-कागजी स्वतः सत्यापित होने वाले प्रमाण:'
                      : 'Authoritative Proofs Automatically Verified via Mahasetu Interoperability:'}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {result.requiredDocuments.map((doc: string, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 bg-white/90 rounded-xl border border-black/8 text-xs flex items-center gap-2.5 text-[#111111] shadow-xs"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-medium text-[#111111]">{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Schemes List (from 4,709+ database) */}
              {result.matchedSchemes && result.matchedSchemes.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#5c5c5c]">
                      {isMr
                        ? '४,७०९+ योजना संचामधून जुळणाऱ्या योजना:'
                        : isHi
                        ? '4,709+ योजना भंडार से संबंधित योजनाएं:'
                        : 'Relevant Welfare & DBT Schemes from 4,709+ Repository:'}
                    </span>
                    {onNavigateToSchemes && (
                      <button
                        type="button"
                        onClick={() => onNavigateToSchemes(undefined, query)}
                        className="text-xs text-emerald-800 hover:text-emerald-950 font-semibold flex items-center gap-1"
                      >
                        <span>{isMr ? 'सर्व योजना पहा' : isHi ? 'सभी योजनाएं देखें' : 'View all in catalogue'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {result.matchedSchemes.slice(0, 4).map((rawScheme: WelfareScheme) => {
                      const scheme = getLocalizedScheme(rawScheme, language);
                      return (
                        <div
                          key={scheme.id}
                          className="p-4 bg-white border border-black/8 rounded-2xl shadow-xs hover:border-black/20 transition-all flex flex-col justify-between space-y-2.5"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                                {scheme.category}
                              </span>
                              <span className="text-[10px] text-[#777777] font-medium">
                                {scheme.state}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-[#111111] mt-1.5 line-clamp-2">
                              {scheme.name}
                            </h4>
                            <p className="text-[11px] text-[#555555] mt-1 line-clamp-2 leading-relaxed">
                              {scheme.benefitSummary}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-black/5 flex items-center justify-between text-xs">
                            <span className="text-[11px] font-bold text-emerald-700">
                              {scheme.benefitValue || (isMr ? 'थेट डीबीटी लाभ' : isHi ? 'प्रत्यक्ष डीबीटी लाभ' : 'Direct DBT Benefit')}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                if (onNavigateToSchemes) {
                                  onNavigateToSchemes(scheme.category, scheme.name);
                                } else {
                                  onApplyForService(scheme.id);
                                }
                              }}
                              className="text-[11px] font-semibold text-black hover:underline flex items-center gap-1"
                            >
                              <span>{isMr ? 'तपशील व अर्ज' : isHi ? 'विवरण एवं आवेदन' : 'Details & Apply'}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons Footer */}
              <div className="pt-4 border-t border-black/8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-[#5c5c5c] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {isMr
                      ? 'कागदपत्र स्कॅन करण्याची गरज नाही • महासेतू आंतर-विभागीय पडताळणी'
                      : isHi
                      ? 'दस्तावेज स्कैन की आवश्यकता नहीं • महासेतु अंतर-विभागीय सत्यापन'
                      : 'Zero physical uploads required • Peer-to-peer verification through Mahasetu'}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 self-end sm:self-auto">
                  {onNavigateToSchemes && (
                    <button
                      type="button"
                      onClick={() => onNavigateToSchemes(undefined, query)}
                      className="px-4 py-2.5 bg-white hover:bg-neutral-100 text-[#111111] border border-black/10 rounded-xl text-xs font-semibold tracking-wide transition-all"
                    >
                      {isMr ? 'योजना सूची शोधा' : isHi ? 'योजना सूची देखें' : 'Browse Schemes'}
                    </button>
                  )}

                  {!result.isGreeting && (
                    <button
                      id="btn-apply-from-ai"
                      type="button"
                      onClick={() => onApplyForService(result.serviceCode || 'SRV_MAHADBT_SCHOLARSHIP')}
                      className="px-5 py-2.5 bg-[#141414] text-white hover:bg-black rounded-xl text-xs font-semibold tracking-wide shadow-sm hover:shadow transition-all flex items-center gap-2"
                    >
                      <span>{t.applyNow} ({isMr ? '१-क्लिक पडताळणी' : isHi ? '1-क्लिक सत्यापन' : '1-Click Verification'})</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
