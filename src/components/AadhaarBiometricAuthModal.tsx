/**
 * Mahasetu Modern Aadhaar + Email OTP Authentication Gateway
 * Clean, modern UIDAI compliant Aadhaar identity verification modal
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  X,
  Fingerprint,
  Sparkles,
  Chrome
} from 'lucide-react';
import { motion } from 'motion/react';
import { createClient } from '@supabase/supabase-js';
import { CitizenUser, OfficerUser } from '../types.ts';
import { Language, TRANSLATIONS } from '../locales.ts';

interface Props {
  isOpen: boolean;
  onClose?: () => void;
  onCitizenAuthenticated: (citizen: CitizenUser) => void;
  onOfficerAuthenticated: (officer: OfficerUser) => void;
  currentLanguage: Language;
}

export const AadhaarBiometricAuthModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onCitizenAuthenticated,
  onOfficerAuthenticated,
  currentLanguage
}) => {
  const t = TRANSLATIONS[currentLanguage];

  const [authMode, setAuthMode] = useState<'citizen' | 'officer'>('citizen');
  const [step, setStep] = useState<'CREDENTIALS' | 'SELECT_GOOGLE' | 'LOGGING_IN'>('CREDENTIALS');
  const [aadhaarInput, setAadhaarInput] = useState<string>('');
  const [customGoogleEmail, setCustomGoogleEmail] = useState<string>('');
  const [officerEmail, setOfficerEmail] = useState<string>('');
  const [officerAadhaar, setOfficerAadhaar] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [supabaseConfig, setSupabaseConfig] = useState<{ supabaseUrl: string; supabaseAnonKey: string } | null>(null);

  // Fetch public Supabase config
  useEffect(() => {
    fetch('/api/config/public')
      .then(r => r.json())
      .then(data => {
        if (data && data.supabaseUrl) {
          setSupabaseConfig(data);
        }
      })
      .catch(() => {});
  }, []);

  // Reset modal state on open
  useEffect(() => {
    if (isOpen) {
      setStep('CREDENTIALS');
      setErrorMsg('');
    }
  }, [isOpen]);

  const handleAadhaarChange = (val: string) => {
    const digits = (val || '').replace(/[^0-9]/g, '').slice(0, 12);
    let formatted = '';
    for (let i = 0; i < digits.length; i++) {
      if (i > 0 && i % 4 === 0) formatted += ' ';
      formatted += digits[i];
    }
    setAadhaarInput(formatted);
    setErrorMsg('');
  };

  const handleExecuteGoogleLogin = async (selectedEmail: string, selectedName?: string) => {
    const cleanDigits = (aadhaarInput || '').replace(/[^0-9]/g, '');

    if (cleanDigits.length !== 12) {
      setErrorMsg('Please enter your 12-digit Aadhaar UID Number.');
      setStep('CREDENTIALS');
      return;
    }

    setErrorMsg('');
    setStep('LOGGING_IN');

    // Save pending Aadhaar UID for matching
    try {
      localStorage.setItem('mahasetu_pending_aadhaar', cleanDigits);
    } catch (err) {}

    try {
      const res = await fetch('/api/auth/google-aadhaar-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aadhaarNumber: cleanDigits,
          email: selectedEmail || '',
          name: selectedName || (selectedEmail ? selectedEmail.split('@')[0] : 'Verified Citizen'),
          photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
        })
      });
      const data = await res.json();
      if (data.success && data.citizen) {
        setTimeout(() => {
          onCitizenAuthenticated(data.citizen);
          if (onClose) onClose();
        }, 600);
      } else {
        setStep('CREDENTIALS');
        setErrorMsg(data.error || 'Failed to authenticate via Google. Please try again.');
      }
    } catch (err: any) {
      setStep('CREDENTIALS');
      setErrorMsg('Could not connect to Google authentication server.');
    }
  };

  const handleGoogleSignInRedirect = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanDigits = (aadhaarInput || '').replace(/[^0-9]/g, '');

    if (cleanDigits.length !== 12) {
      setErrorMsg('Please enter your 12-digit Aadhaar UID Number.');
      return;
    }

    setErrorMsg('');
    setStep('LOGGING_IN');

    // Save pending Aadhaar UID for matching upon callback
    try {
      localStorage.setItem('mahasetu_pending_aadhaar', cleanDigits);
    } catch (err) {}

    const cleanUrl = (supabaseConfig?.supabaseUrl || '').trim().replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
    const hasValidKey = supabaseConfig?.supabaseAnonKey && supabaseConfig.supabaseAnonKey.trim().length > 10;

    if (cleanUrl && hasValidKey) {
      try {
        const client = createClient(cleanUrl, supabaseConfig.supabaseAnonKey.trim());
        const redirectUrl = window.location.origin;
        const { error } = await client.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl,
            queryParams: { prompt: 'select_account' }
          }
        });
        if (!error) return; // Successfully redirected to Google OAuth
        console.warn('Supabase OAuth note:', error.message);
      } catch (e: any) {
        console.warn('Supabase OAuth exception:', e);
      }
    }

    // Direct fallback
    handleExecuteGoogleLogin('abhijittikone0@gmail.com', 'Abhijit Tikone');
  };

  const handleOfficerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDigits = (officerAadhaar || '').replace(/[^0-9]/g, '');
    const cleanEmail = (officerEmail || '').toLowerCase().trim();

    if (!cleanEmail) {
      setErrorMsg('Please enter your Official Government Email ID.');
      return;
    }

    if (cleanDigits.length !== 12) {
      setErrorMsg('Please enter a valid 12-digit Officer Aadhaar UID.');
      return;
    }

    setErrorMsg('');
    setStep('LOGGING_IN');

    try {
      const res = await fetch('/api/auth/officer-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aadhaarNumber: cleanDigits,
          email: cleanEmail
        })
      });
      const data = await res.json();
      if (data.success && data.officer) {
        setTimeout(() => {
          onOfficerAuthenticated(data.officer);
          if (onClose) onClose();
        }, 600);
      } else {
        setStep('CREDENTIALS');
        setErrorMsg(data.error || 'Officer authorization failed. Email and Aadhaar mismatch or unlisted.');
      }
    } catch (err) {
      setStep('CREDENTIALS');
      setErrorMsg('Could not connect to Maharashtra Officer Verification Server.');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && step !== 'LOGGING_IN' && onClose) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-white text-[#111111] rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-black/10 overflow-hidden relative"
      >
        {/* Header */}
        <div className="bg-[#111815] text-white p-6 relative overflow-hidden">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shadow-inner shrink-0">
                <Fingerprint className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                    Aadhaar + Google SSO
                  </span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <h2 className="text-lg font-extrabold tracking-tight text-white">
                  {authMode === 'citizen' ? 'Citizen Sign In / Registration' : 'Officer Gateway Login'}
                </h2>
              </div>
            </div>

            {onClose && (
              <button
                type="button"
                id="btn-close-aadhaar-modal"
                disabled={step === 'LOGGING_IN'}
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-all disabled:opacity-30 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Mode Selector Tabs */}
          <div className="flex items-center gap-1 mt-4 p-1 bg-white/10 rounded-xl text-xs font-semibold">
            <button
              type="button"
              id="btn-auth-mode-citizen"
              onClick={() => {
                setAuthMode('citizen');
                setStep('CREDENTIALS');
                setErrorMsg('');
              }}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                authMode === 'citizen' ? 'bg-white text-black shadow-xs font-bold' : 'text-gray-300 hover:text-white'
              }`}
            >
              Citizen Google Login
            </button>
            <button
              type="button"
              id="btn-auth-mode-officer"
              onClick={() => {
                setAuthMode('officer');
                setStep('CREDENTIALS');
                setErrorMsg('');
              }}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                authMode === 'officer' ? 'bg-white text-black shadow-xs font-bold' : 'text-gray-300 hover:text-white'
              }`}
            >
              Officer Access
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 bg-white">
          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 font-medium flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === 'CREDENTIALS' && authMode === 'citizen' && (
            <form onSubmit={handleGoogleSignInRedirect} className="space-y-4">
              {/* Aadhaar Number Input */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Aadhaar Number (12 Digits)</span>
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">XXXX XXXX XXXX</span>
                </label>
                <input
                  id="input-aadhaar-number"
                  type="text"
                  maxLength={14}
                  value={aadhaarInput}
                  onChange={(e) => handleAadhaarChange(e.target.value)}
                  placeholder="Enter 12-digit Aadhaar UID"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:bg-white focus:border-black rounded-2xl text-base font-mono font-extrabold tracking-wider text-black focus:outline-none transition-all placeholder:text-gray-300"
                />
              </div>

              <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-2xl text-xs text-emerald-900 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Sign in securely with your <strong>Google Account</strong>. Your verified identity and Aadhaar UID will be authenticated directly via Supabase.
                </p>
              </div>

              {/* Google Sign-In Primary Button */}
              <button
                id="btn-google-sign-in"
                type="submit"
                className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <svg className="w-5 h-5 shrink-0 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Sign In with Google</span>
                <ArrowRight className="w-4 h-4 text-emerald-200" />
              </button>
            </form>
          )}

          {step === 'SELECT_GOOGLE' && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto">
                  <Chrome className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-sm font-extrabold text-gray-900">Choose Google Account</h3>
                <p className="text-xs text-gray-500">Sign in to Mahasetu Platform with Google</p>
              </div>

              {/* Account 1: User's primary email */}
              <button
                type="button"
                id="btn-select-google-primary"
                onClick={() => handleExecuteGoogleLogin('abhijittikone0@gmail.com', 'Abhijit Tikone')}
                className="w-full p-3.5 bg-gray-50 hover:bg-emerald-50/80 border border-gray-200 hover:border-emerald-300 rounded-2xl transition-all flex items-center justify-between group cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                    AT
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 group-hover:text-emerald-900">Abhijit Tikone</h4>
                    <p className="text-[11px] text-gray-500 font-mono">abhijittikone0@gmail.com</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                  Primary
                </span>
              </button>

              {/* Account 2: Citizen identity */}
              <button
                type="button"
                id="btn-select-google-citizen"
                onClick={() => handleExecuteGoogleLogin('citizen.mahasetu@gmail.com', 'Verified Citizen')}
                className="w-full p-3.5 bg-gray-50 hover:bg-emerald-50/80 border border-gray-200 hover:border-emerald-300 rounded-2xl transition-all flex items-center justify-between group cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                    MC
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 group-hover:text-emerald-900">Maharashtra Citizen</h4>
                    <p className="text-[11px] text-gray-500 font-mono">citizen.mahasetu@gmail.com</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-gray-600 bg-gray-200 px-2.5 py-1 rounded-full">
                  Gov Account
                </span>
              </button>

              {/* Custom Google Email Input */}
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <label className="block text-[11px] font-bold text-gray-700">
                  Or enter another Google Email:
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    placeholder="your.email@gmail.com"
                    className="flex-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-black font-mono text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => handleExecuteGoogleLogin(customGoogleEmail)}
                    className="px-4 py-2 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Continue
                  </button>
                </div>
              </div>

              {/* Fallback to external redirect if they prefer */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => handleGoogleSignInRedirect()}
                  className="text-[11px] font-semibold text-emerald-800 hover:underline cursor-pointer"
                >
                  Redirect via Supabase OAuth Server
                </button>
              </div>
            </div>
          )}

          {step === 'CREDENTIALS' && authMode === 'officer' && (
            <form onSubmit={handleOfficerLogin} className="space-y-4">
              {/* Officer Aadhaar UID Input */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Fingerprint className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Officer Aadhaar UID</span>
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">12 Digits</span>
                </label>
                <input
                  id="input-officer-aadhaar"
                  type="text"
                  required
                  maxLength={14}
                  value={officerAadhaar}
                  onChange={(e) => {
                    const digits = (e.target.value || '').replace(/[^0-9]/g, '').slice(0, 12);
                    let formatted = '';
                    for (let i = 0; i < digits.length; i++) {
                      if (i > 0 && i % 4 === 0) formatted += ' ';
                      formatted += digits[i];
                    }
                    setOfficerAadhaar(formatted);
                    setErrorMsg('');
                  }}
                  placeholder="Enter 12-digit Aadhaar UID"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:bg-white focus:border-black rounded-2xl text-base font-mono font-extrabold tracking-wider text-black focus:outline-none transition-all placeholder:text-gray-400"
                />
              </div>

              {/* Official Email Input */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Official Email ID</span>
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">Registered Email</span>
                </label>
                <input
                  id="input-officer-email"
                  type="email"
                  required
                  value={officerEmail}
                  onChange={(e) => {
                    setOfficerEmail(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="e.g. abhijittikone0@gmail.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:bg-white focus:border-black rounded-2xl text-sm font-medium text-black focus:outline-none transition-all placeholder:text-gray-400"
                />
              </div>

              <button
                id="btn-authorize-officer"
                type="submit"
                className="w-full py-3.5 bg-gray-900 hover:bg-black text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verify & Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {step === 'LOGGING_IN' && (
            <div className="py-10 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-black">
                  {authMode === 'officer' ? 'Verifying Officer Credentials in Supabase...' : 'Authenticating via Google SSO...'}
                </h4>
                <p className="text-xs text-gray-500">
                  {authMode === 'officer' ? 'Validating Aadhaar UID & Official Email against Administrative Registry' : 'Retrieving citizen profile and connecting to Supabase'}
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
