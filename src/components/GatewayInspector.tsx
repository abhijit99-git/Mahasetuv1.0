/**
 * Mahasetu Interoperability Gateway & AI Schema Mapper
 * Shows the live adapters, legacy vs canonical JSON transformations, and AI-driven schema mapping.
 */

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Sparkles,
  ArrowRight,
  Database,
  Cpu,
  RefreshCw,
  CheckCircle2,
  Code2,
  Send,
  Zap
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../locales.ts';

interface Props {
  language: Language;
}

export const GatewayInspector: React.FC<Props> = ({ language }) => {
  const t = TRANSLATIONS[language];
  const [departments, setDepartments] = useState<any[]>([]);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [selectedAdapter, setSelectedAdapter] = useState('REVENUE');

  // AI Schema Mapper State
  const [legacyInputJson, setLegacyInputJson] = useState(`{
  "applicant_nm": "Suresh Maruti Patil",
  "ration_card_no": "RC-MH-99812",
  "monthly_earnings": 12500,
  "crop_damage_claim_inr": 45000,
  "district_code": 27,
  "is_active_flag": 1
}`);
  const [aiMappingResult, setAiMappingResult] = useState<any | null>(null);
  const [isMappingAi, setIsMappingAi] = useState(false);

  useEffect(() => {
    fetch('/api/departments')
      .then(res => res.json())
      .then(data => setDepartments(data))
      .catch(console.error);
  }, []);

  const handleRunAdapterTest = async (deptCode: string) => {
    setIsTesting(true);
    setSelectedAdapter(deptCode);
    setTestResult(null);

    let url = '/api/adapters/revenue/income-certificate/INC-MH-2026-10382';
    if (deptCode === 'DISTRICT_ADMIN') url = '/api/adapters/district/domicile/DOM-MH-2024-88491';
    if (deptCode === 'TRANSPORT_RTO') url = '/api/adapters/rto/license/MH-12-2022-0049182';
    if (deptCode === 'PUBLIC_HEALTH') url = '/api/adapters/health/medical-fitness/MED-MH-2026-90412';

    try {
      const res = await fetch(url);
      const data = await res.json();
      setTestResult(data);
    } catch (e) {
      console.error('Adapter test error', e);
    } finally {
      setIsTesting(false);
    }
  };

  const handleGenerateAiMapping = async () => {
    setIsMappingAi(true);
    setAiMappingResult(null);

    try {
      const parsed = JSON.parse(legacyInputJson);
      const res = await fetch('/api/ai/schema-mapper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceDepartment: 'Agriculture & Relief Registry',
          legacySchema: parsed
        })
      });
      const data = await res.json();
      setAiMappingResult(data);
    } catch (e) {
      alert('Invalid JSON input for Schema Mapper.');
    } finally {
      setIsMappingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white/75 backdrop-blur-xl border border-black/8 rounded-3xl p-6 sm:p-7 shadow-[0_18px_44px_-26px_rgba(0,0,0,0.10)] relative overflow-hidden">
        <div className="flex items-start gap-4 relative z-10">
          <div className="w-13 h-13 rounded-2xl bg-black/5 border border-black/10 text-[#141414] flex items-center justify-center font-bold text-xl shrink-0 shadow-xs">
            <Layers className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5c5c5c] bg-black/5 border border-black/5 px-2.5 py-0.5 rounded-full">
                Non-Invasive Department Adapters
              </span>
              <span className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold">
                5 Active Bridges
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#111111] mt-1.5">
              Mahasetu Interoperability Gateway & Adapters
            </h2>
            <p className="text-xs text-[#5c5c5c] max-w-3xl mt-1 leading-relaxed">
              Mahasetu does NOT force departments to rebuild their core legacy databases. Instead, lightweight canonical adapters translate disparate Oracle, PostgreSQL, and MySQL databases into the standardized Mahasetu Schema in real time.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Adapter Test Harness */}
      <div className="bg-white/80 backdrop-blur-xl border border-black/8 rounded-3xl p-6 sm:p-7 shadow-[0_18px_44px_-26px_rgba(0,0,0,0.10)]">
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-black/8">
          <div>
            <h3 className="text-xl font-bold text-[#111111]">
              Live Department Adapter Test Bench
            </h3>
            <p className="text-xs text-[#5c5c5c] mt-0.5">
              Trigger a live hop to observe raw legacy response translation into Mahasetu Canonical JSON
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 mb-5">
          {departments.map(d => (
            <button
              key={d.code}
              type="button"
              onClick={() => handleRunAdapterTest(d.code)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 ${
                selectedAdapter === d.code
                  ? 'bg-[#141414] text-white shadow-xs'
                  : 'bg-white text-[#5c5c5c] hover:text-[#111111] hover:bg-black/5 border border-black/8'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{d.code}</span>
            </button>
          ))}
        </div>

        {/* Side-by-Side Comparison: Legacy vs Canonical */}
        {isTesting ? (
          <div className="py-12 text-center text-xs text-[#5c5c5c] flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#111111]" />
            <span>Executing adapter hop and canonical transformation...</span>
          </div>
        ) : testResult ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-[#fcfdfc] text-[#111111] rounded-2xl p-5 font-mono text-xs overflow-x-auto border border-black/10 shadow-xs">
              <div className="flex items-center justify-between text-[11px] text-amber-700 font-bold mb-3 pb-2.5 border-b border-black/8">
                <span>RAW LEGACY SYSTEM RESPONSE</span>
                <span className="text-[10px] text-[#7a7a7a]">Latency: ~12ms</span>
              </div>
              <pre className="text-[#333333]">{JSON.stringify(testResult.rawLegacy || testResult, null, 2)}</pre>
            </div>

            <div className="bg-[#fcfdfc] text-[#111111] rounded-2xl p-5 font-mono text-xs overflow-x-auto border border-black/10 shadow-xs">
              <div className="flex items-center justify-between text-[11px] text-emerald-800 font-bold mb-3 pb-2.5 border-b border-black/8">
                <span>MAHASETU CANONICAL JSON CONTRACT</span>
                <span className="text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded text-[10px]">STANDARDIZED</span>
              </div>
              <pre className="text-[#141414]">{JSON.stringify(testResult.canonical || testResult, null, 2)}</pre>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-xs text-[#5c5c5c] bg-black/5 rounded-2xl border border-dashed border-black/10">
            Click any department above (e.g. REVENUE, DISTRICT_ADMIN, TRANSPORT_RTO) to run a live test hop.
          </div>
        )}
      </div>

      {/* AI Canonical Schema Mapper */}
      <div className="bg-white/80 backdrop-blur-xl border border-black/8 rounded-3xl p-6 sm:p-7 shadow-[0_18px_44px_-26px_rgba(0,0,0,0.10)]">
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-black/8">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-[#111111]">
                AI Canonical Schema Mapper
              </h3>
              <span className="text-[10px] font-semibold text-[#141414] bg-black/5 px-2.5 py-0.5 rounded-full border border-black/10 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#141414]" />
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-[#5c5c5c] mt-1">
              Paste arbitrary legacy department JSON to automatically synthesize Mahasetu canonical field mapping rules
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <textarea
            rows={6}
            value={legacyInputJson}
            onChange={e => setLegacyInputJson(e.target.value)}
            className="w-full p-4 bg-white text-[#111111] font-mono text-xs rounded-2xl border border-black/10 focus:outline-none focus:border-black shadow-xs"
          />

          <div className="flex justify-end">
            <button
              id="btn-run-ai-mapper"
              type="button"
              disabled={isMappingAi}
              onClick={handleGenerateAiMapping}
              className="px-6 py-3 bg-[#141414] text-white hover:bg-black font-semibold uppercase tracking-wider rounded-xl text-xs shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isMappingAi ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Schema Mappings...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Canonical Mapping</span>
                </>
              )}
            </button>
          </div>
        </div>

        {aiMappingResult && (
          <div className="mt-5 p-5 bg-black/5 border border-black/10 rounded-2xl space-y-4 text-xs">
            <span className="font-semibold text-[#111111] block uppercase tracking-wider text-[11px]">AI Generated Transformation Rules:</span>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-semibold text-[#5c5c5c] block mb-2 text-[10px] uppercase">Field Level Mapping Table:</span>
                <div className="bg-white p-4 rounded-xl border border-black/10 font-mono text-[11px] space-y-1.5 shadow-xs">
                  {aiMappingResult.mappings ? (
                    Object.entries(aiMappingResult.mappings).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between border-b border-black/5 pb-1 last:border-0 last:pb-0">
                        <span className="text-[#5c5c5c]">{k}</span>
                        <span className="text-[#111111] font-bold inline-flex items-center gap-1">
                          <ArrowRight className="w-3 h-3 text-[#5c5c5c]" />
                          <span>{String(v)}</span>
                        </span>
                      </div>
                    ))
                  ) : (
                    <pre className="text-[#111111]">{JSON.stringify(aiMappingResult, null, 2)}</pre>
                  )}
                </div>
              </div>

              <div>
                <span className="font-semibold text-[#5c5c5c] block mb-2 text-[10px] uppercase">Proposed Canonical Document Spec:</span>
                <pre className="bg-white text-[#111111] p-4 rounded-xl border border-black/10 font-mono text-[11px] overflow-x-auto max-h-48 shadow-xs">
                  {JSON.stringify(aiMappingResult.canonicalSpec || aiMappingResult, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
