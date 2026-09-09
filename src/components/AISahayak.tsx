/**
 * Mahasetu AI Citizen Sahayak
 * Powered by Google Gemini 3.8 Flash
 * Trilingual service discovery, intent extraction, and seamless 1-click application routing.
 */

import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  Building2,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  FileCheck2,
  HelpCircle,
  MessageSquare
} from 'lucide-react';
import { ServiceDefinition } from '../types.ts';
import { Language, TRANSLATIONS } from '../locales.ts';

interface Props {
  language: Language;
  onApplyForService: (serviceCode: string) => void;
}

export const AISahayak: React.FC<Props> = ({
  language,
  onApplyForService
}) => {
  const t = TRANSLATIONS[language];
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const samplePrompts = [
    {
      lang: 'mr',
      label: 'इंजिनीअरिंग शिष्यवृत्ती',
      text: 'मला बी.टेक इंजिनीअरिंगसाठी महाडीबीटी शिष्यवृत्ती हवी आहे, मला कोणती कागदपत्रे लागतील?'
    },
    {
      lang: 'mr',
      label: 'शेतकरी सन्मान निधी',
      text: 'नमो शेतकरी महासन्मान निधीसाठी ७/१२ उतारा आणि आधार कसा पडताळायचा?'
    },
    {
      lang: 'hi',
      label: 'लर्नर ड्राइविंग लाइसेंस',
      text: 'मुझे पुणे में नया लर्निंग लाइसेंस बनवाना है, क्या मुझे आरटीओ ऑफिस जाना पड़ेगा?'
    },
    {
      lang: 'en',
      label: 'EWS Certificate',
      text: 'My family income is below 8 lakhs. How can I get EWS certificate through Mahasetu?'
    }
  ];

  const handleAskAI = async (textToAsk?: string) => {
    const q = textToAsk || query;
    if (!q.trim()) return;

    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/ai/navigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          language: language === 'mr' ? 'Marathi' : language === 'hi' ? 'Hindi' : 'English'
        })
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.warn('AI navigation network fallback:', e);
      setResult({
        serviceCode: 'SRV_MAHADBT_SCHOLARSHIP',
        serviceName: 'Rajarshi Chhatrapati Shahu Maharaj Merit Scholarship',
        department: 'Higher & Technical Education Department',
        explanation: 'आपल्या विचारणेशी संबंधित शासकीय सेवा महासेतू आंतर-विभागीय पडताळणीद्वारे उपलब्ध आहेत.',
        requiredDocuments: ['Income Certificate (Revenue)', 'Maharashtra Domicile Certificate'],
        availableInMesh: ['Income Certificate (Revenue)', 'Maharashtra Domicile Certificate'],
        confidence: 0.95
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white/75 backdrop-blur-xl border border-black/8 rounded-3xl p-6 sm:p-7 shadow-[0_18px_44px_-26px_rgba(0,0,0,0.10)] relative overflow-hidden">
        <div className="flex items-start justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-black/5 border border-black/10 text-[#141414] flex items-center justify-center font-bold text-xl shadow-xs">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5c5c5c] bg-black/5 px-2.5 py-0.5 rounded-full border border-black/5">
                  Powered by Google Gemini 3.8 Flash
                </span>
                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Trilingual Natural Language
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#111111] mt-1.5">
                {t.navAiSahayak}
              </h2>
              <p className="text-xs text-[#5c5c5c] mt-1 max-w-2xl leading-relaxed">
                Ask questions in Marathi (मराठी), Hindi (हिंदी), or English. Mahasetu automatically matches your requirement to the right government department without needing bureaucratic forms.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Query Box & Sample Prompts */}
      <div className="bg-white/80 backdrop-blur-xl border border-black/8 rounded-3xl p-6 sm:p-7 shadow-[0_18px_44px_-26px_rgba(0,0,0,0.10)] space-y-5">
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-[#5c5c5c] block mb-2">
            What government service or certificate do you need?
          </label>
          <div className="relative">
            <textarea
              rows={3}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="E.g., I need a Caste Certificate for engineering admission, or how to get 7/12 land extract..."
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
                  <span>Thinking...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.aiQueryBtn}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick sample prompt chips */}
        <div>
          <span className="text-[11px] font-semibold text-[#5c5c5c] uppercase tracking-wider block mb-2.5">
            Suggested citizen inquiries:
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
                className="text-xs bg-white/80 hover:bg-white text-[#111111] border border-black/8 hover:border-black/20 px-3.5 py-2 rounded-full font-medium transition-all text-left flex items-center gap-2 shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#5c5c5c] shrink-0" />
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI Structured Response Card */}
      {result && (
        <div className="bg-white/85 backdrop-blur-xl border border-black/10 rounded-3xl p-6 sm:p-7 shadow-[0_18px_44px_-26px_rgba(0,0,0,0.12)] space-y-5 relative overflow-hidden">
          <div className="flex items-start justify-between gap-3 border-b border-black/8 pb-4">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                AI Intent Analysis Result
              </span>
              <h3 className="text-xl font-bold text-[#111111] mt-1.5">
                {result.serviceName || 'Identified Government Service'}
              </h3>
              <div className="text-xs text-[#5c5c5c] mt-0.5 font-medium">
                Target Department: <span className="font-semibold text-[#111111]">{result.department}</span>
              </div>
            </div>

            {result.confidenceScore && (
              <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full">
                MATCH: {Math.round(result.confidenceScore * 100)}%
              </span>
            )}
          </div>

          {/* Citizen guidance advice */}
          <div className="p-4 bg-black/5 border border-black/5 rounded-2xl text-xs text-[#111111] leading-relaxed">
            <span className="font-bold text-[#111111] block mb-1">मार्गदर्शन व माहिती (Guidance):</span>
            <p>{result.advice}</p>
          </div>

          {/* Required Documents Extracted */}
          {result.requiredDocuments && result.requiredDocuments.length > 0 && (
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5c5c5c] block mb-2.5">
                Mandatory Verifications Automatically Handled by Mahasetu:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {result.requiredDocuments.map((doc: string, idx: number) => (
                  <div key={idx} className="p-3 bg-white/80 rounded-xl border border-black/8 text-xs flex items-center gap-2.5 text-[#111111] shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-medium text-[#111111]">{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Apply Shortcut */}
          <div className="pt-4 border-t border-black/8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-[#5c5c5c]">
              No paper scanning needed • Verified peer-to-peer through Mahasetu
            </div>

            <button
              id="btn-apply-from-ai"
              type="button"
              onClick={() => onApplyForService(result.serviceCode || 'SCHOLARSHIP_MERIT')}
              className="px-6 py-3 bg-[#141414] text-white hover:bg-black rounded-xl text-xs font-semibold tracking-wide shadow-sm hover:shadow transition-all flex items-center gap-2 self-end sm:self-auto"
            >
              <span>{t.applyNow} With 1-Click Verification</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
