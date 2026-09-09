/**
 * Mahasetu Welcome Greeting Animation Overlay
 * Plays on initial site load to greet citizens and introduce the Mahasetu Interoperability Platform
 */

import React from 'react';
import { ShieldCheck, Fingerprint, Sparkles, ArrowRight, Building2, Lock, Layers, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, TRANSLATIONS } from '../locales.ts';

interface Props {
  isOpen: boolean;
  onProceedToAadhaar: () => void;
  language: Language;
}

export const WelcomeGreetingModal: React.FC<Props> = ({
  isOpen,
  onProceedToAadhaar,
  language
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#0a0f0d]/80 backdrop-blur-xl"
          onClick={onProceedToAadhaar}
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl bg-white rounded-3xl border border-black/10 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.35)] overflow-hidden z-10"
        >
          {/* Header Banner with Gov Emblem */}
          <div className="bg-linear-to-r from-[#111815] via-[#1a2622] to-[#111815] text-white p-6 sm:p-8 relative overflow-hidden text-center border-b border-white/10">
            {/* Subtle glow orb */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Emblem / Badge */}
            <div className="flex justify-center items-center gap-3 mb-3">
              <div className="w-24 h-24 flex items-center justify-center overflow-hidden">
                <img
                  src="/mahasetu-logo.png"
                  alt="Mahasetu Golden Emblem"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-semibold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Government of Maharashtra Digital Portal</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mt-1 flex items-center justify-center gap-2">
              <span>Welcome to</span>
              <span className="text-amber-400 font-marathi-calligraphy text-3xl sm:text-5xl">महासेतू</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto mt-2 leading-relaxed">
              Unified Digital Interoperability & Identity Gateway for Maharashtra Citizens
            </p>
          </div>

          {/* Features Grid */}
          <div className="p-6 sm:p-8 space-y-6 bg-slate-50/50">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-black/8 shadow-xs space-y-1">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Fingerprint className="w-4 h-4 text-emerald-800" />
                </div>
                <h4 className="text-xs font-bold text-gray-900 mt-2">1. Aadhaar Identity</h4>
                <p className="text-[11px] text-gray-500 leading-snug">
                  One verified Aadhaar login connects all your state government welfare schemes.
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-black/8 shadow-xs space-y-1">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Zap className="w-4 h-4 text-emerald-800" />
                </div>
                <h4 className="text-xs font-bold text-gray-900 mt-2">2. Zero Bureaucracy</h4>
                <p className="text-[11px] text-gray-500 leading-snug">
                  Land 7/12, Income, and Caste certificates are auto-verified inter-departmentally.
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-black/8 shadow-xs space-y-1">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Lock className="w-4 h-4 text-emerald-800" />
                </div>
                <h4 className="text-xs font-bold text-gray-900 mt-2">3. DPDP Consent</h4>
                <p className="text-[11px] text-gray-500 leading-snug">
                  Strict consent controls give you 100% control over who views your data.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                id="btn-proceed-aadhaar-welcome"
                type="button"
                onClick={onProceedToAadhaar}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#141414] hover:bg-black text-white font-semibold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Fingerprint className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>Proceed to Aadhaar Authentication</span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
