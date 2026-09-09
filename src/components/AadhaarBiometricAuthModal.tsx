/**
 * Mahasetu Modern Aadhaar + Email OTP Authentication Gateway
 * Clean, modern UIDAI compliant Aadhaar identity verification modal
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  Fingerprint,
  Building2,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
  const [step, setStep] = useState<'CREDENTIALS' | 'SENDING' | 'OTP' | 'VERIFYING'>('CREDENTIALS');
  const [aadhaarInput, setAadhaarInput] = useState<string>('');
  const [emailInput, setEmailInput] = useState<string>('');
  const [otpInput, setOtpInput] = useState<string>('');
  const [txnId, setTxnId] = useState<string>('');
  const [demoOtpCode, setDemoOtpCode] = useState<string>('');
  const [isEmailSent, setIsEmailSent] = useState<boolean>(true);
  const [unconfiguredOtp, setUnconfiguredOtp] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Reset modal state on open
  useEffect(() => {
    if (isOpen) {
      setStep('CREDENTIALS');
      setErrorMsg('');
      setSuccessMsg('');
      setOtpInput('');
    }
  }, [isOpen]);

  // Periodic background check if user verified via Supabase link
  useEffect(() => {
    let interval: any = null;
    if (isOpen && step === 'OTP' && emailInput) {
      interval = setInterval(async () => {
        try {
          const res = await fetch('/api/auth/verify-supabase-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: emailInput,
              aadhaarNumber: aadhaarInput
            })
          });
          const data = await res.json();
          if (data.success && data.citizen && data.citizen.isProfileComplete !== false) {
            clearInterval(interval);
            onCitizenAuthenticated(data.citizen);
          }
        } catch (e) {
          // silent background check
        }
      }, 3500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, step, emailInput, aadhaarInput, onCitizenAuthenticated]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && step !== 'SENDING' && step !== 'VERIFYING' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, step, onClose]);

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

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanDigits = aadhaarInput.replace(/[^0-9]/g, '');

    if (cleanDigits.length !== 12) {
      setErrorMsg('Please enter a valid 12-digit Aadhaar UID Number.');
      return;
    }

    if (!emailInput || !emailInput.includes('@')) {
      setErrorMsg('Please enter a valid Email Address linked to your Aadhaar.');
      return;
    }

    setErrorMsg('');
    setStep('SENDING');

    try {
      const res = await fetch('/api/auth/send-aadhaar-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aadhaarNumber: aadhaarInput,
          email: emailInput
        })
      });
      
      let data: any = {};
      try {
        data = await res.json();
      } catch (jsonErr) {
        data = { success: false, error: `Server error (${res.status} ${res.statusText})` };
      }

      setTimeout(() => {
        if (res.ok && data.success) {
          setTxnId(data.txnId || `UIDAI-OTP-${Date.now()}`);
          setDemoOtpCode(data.demoOtp || '');
          setIsEmailSent(!!data.emailSent);
          setUnconfiguredOtp(data.unconfiguredOtpCode || '');
          setOtpInput(''); // Keep blank so user must enter OTP manually
          if (data.emailSent) {
            setSuccessMsg(`📩 Verification link dispatched to ${emailInput}! Open your inbox and click "Verify Email & Log In" to enter automatically.`);
          } else if (data.resendNotice) {
            setSuccessMsg(`Resend Free-Tier Notice: Resend key is registered to monkeyydlufyy3121@gmail.com.`);
          } else if (data.supabaseError && data.supabaseError.toLowerCase().includes('error sending')) {
            setSuccessMsg(`Supabase Notice: ${data.supabaseError}. Check your email inbox for verification link.`);
          } else if (data.supabaseError) {
            setSuccessMsg(`Supabase Auth Notice: ${data.supabaseError}`);
          } else {
            setSuccessMsg(`Verification email dispatched to ${emailInput}.`);
          }
          setStep('OTP');
        } else {
          setStep('CREDENTIALS');
          setErrorMsg(data.error || `Server returned error status (${res.status}). Please try again.`);
        }
      }, 900);
    } catch (err: any) {
      setStep('CREDENTIALS');
      setErrorMsg(err?.message ? `Gateway Error: ${err.message}` : 'Communication error with Mahasetu Auth Gateway. Please retry.');
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!otpInput || otpInput.trim().length !== 6) {
      setErrorMsg('Please enter the 6-digit OTP code sent to your email.');
      return;
    }

    setErrorMsg('');
    setStep('VERIFYING');

    try {
      if (authMode === 'citizen') {
        const res = await fetch('/api/auth/verify-aadhaar-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            aadhaarNumber: aadhaarInput,
            email: emailInput,
            otp: otpInput,
            txnId
          })
        });
        
        let data: any = {};
        try {
          data = await res.json();
        } catch (jErr) {
          data = { success: false, error: `Server response error (${res.status})` };
        }

        setTimeout(() => {
          if (res.ok && data.success && data.citizen) {
            onCitizenAuthenticated(data.citizen);
            if (onClose) onClose();
          } else {
            setStep('OTP');
            setErrorMsg(data.error || 'Aadhaar OTP verification failed. Please check the code.');
          }
        }, 1100);
      } else {
        // Officer Login
        const res = await fetch('/api/auth/officer-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            aadhaarNumber: aadhaarInput,
            officerId: 'off-101'
          })
        });
        const data = await res.json();

        setTimeout(() => {
          if (data.success && data.officer) {
            onOfficerAuthenticated(data.officer);
            if (onClose) onClose();
          } else {
            setStep('OTP');
            setErrorMsg(data.error || 'Officer authorization failed.');
          }
        }, 1100);
      }
    } catch (err) {
      setStep('OTP');
      setErrorMsg('Verification server timeout. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && step !== 'SENDING' && step !== 'VERIFYING' && onClose) {
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
                    Aadhaar Gateway
                  </span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <h2 className="text-lg font-extrabold tracking-tight text-white">
                  {authMode === 'citizen' ? 'Citizen Aadhaar Authentication' : 'Officer Gateway Login'}
                </h2>
              </div>
            </div>

            {onClose && (
              <button
                type="button"
                id="btn-close-aadhaar-modal"
                disabled={step === 'SENDING' || step === 'VERIFYING'}
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-all disabled:opacity-30"
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
              className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                authMode === 'citizen' ? 'bg-white text-black shadow-xs font-bold' : 'text-gray-300 hover:text-white'
              }`}
            >
              Citizen Sign In / Sign Up
            </button>
            <button
              type="button"
              id="btn-auth-mode-officer"
              onClick={() => {
                setAuthMode('officer');
                setStep('CREDENTIALS');
                setErrorMsg('');
              }}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
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

          {/* Success Banner */}
          {successMsg && step === 'OTP' && (
            <div className={`p-3.5 border rounded-2xl text-xs font-medium flex items-start gap-2.5 ${
              isEmailSent ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              {isEmailSent ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-bold block">{successMsg}</span>
                {isEmailSent ? (
                  <span className="text-[11px] text-emerald-800">
                    Check your email inbox and click the verification link or enter the 6-digit OTP code below.
                  </span>
                ) : (
                  <span className="text-[11px] text-amber-800 leading-normal block mt-0.5">
                    For instant verification, enter active code: <strong className="font-mono text-amber-950 font-extrabold text-xs px-1.5 py-0.5 bg-amber-200/80 rounded border border-amber-300">{unconfiguredOtp}</strong> or check your Supabase Auth project Email settings.
                  </span>
                )}
              </div>
            </div>
          )}

          {/* STEP 1: Enter Credentials */}
          {step === 'CREDENTIALS' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              {/* Aadhaar Number Input */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Aadhaar Number (12 Digits) *</span>
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">XXXX XXXX XXXX</span>
                </label>
                <input
                  id="input-aadhaar-number"
                  type="text"
                  required
                  maxLength={14}
                  value={aadhaarInput}
                  onChange={(e) => handleAadhaarChange(e.target.value)}
                  placeholder="0000 0000 0000"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:bg-white focus:border-black rounded-2xl text-base font-mono font-extrabold tracking-wider text-black focus:outline-none transition-all placeholder:text-gray-300"
                />
              </div>

              {/* Email Address Input */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Aadhaar Linked Email Address *</span>
                  </span>
                </label>
                <input
                  id="input-aadhaar-email"
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:bg-white focus:border-black rounded-2xl text-xs font-medium text-black focus:outline-none transition-all placeholder:text-gray-400"
                />
              </div>

              <p className="text-[11px] text-gray-500 leading-relaxed">
                A secure verification link will be sent to your email to verify identity ownership.
              </p>

              <button
                id="btn-send-aadhaar-otp"
                type="submit"
                className="w-full py-3.5 bg-[#141414] hover:bg-black text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>Send Verification Link to Email</span>
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </button>
            </form>
          )}

          {/* STEP: Sending OTP Processing State */}
          {step === 'SENDING' && (
            <div className="py-10 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Fingerprint className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-black">Connecting to UIDAI Gateway...</h4>
                <p className="text-xs text-gray-500">Dispatching verification code to {emailInput}</p>
              </div>
            </div>
          )}

          {/* STEP 2: Waiting for Email Verification */}
          {step === 'OTP' && (
            <div className="py-6 space-y-5 text-center">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-75" />
                <div className="relative w-16 h-16 bg-emerald-700 rounded-full flex items-center justify-center text-white shadow-lg mx-auto">
                  <Mail className="w-8 h-8" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-extrabold text-gray-900">Check Your Email Inbox</h3>
                <p className="text-xs text-gray-600 leading-relaxed px-4">
                  We have sent a 1-click verification link to:
                  <br />
                  <strong className="text-emerald-800 font-mono text-sm block mt-1 bg-emerald-50 py-1 px-2 rounded-lg border border-emerald-200">{emailInput}</strong>
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs text-left space-y-2.5">
                <div className="flex items-center gap-2 font-bold text-gray-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Next Steps:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-gray-600 pl-1 text-[11px] leading-relaxed">
                  <li>Open your email inbox in a new tab or phone.</li>
                  <li>Click on the <strong>"Verify Email & Log In to Mahasetu"</strong> link.</li>
                  <li>You will be logged in automatically!</li>
                </ol>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setStep('CREDENTIALS')}
                  className="text-gray-500 hover:text-black font-medium flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change Email / Aadhaar</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-emerald-700 hover:underline font-bold cursor-pointer"
                >
                  Resend Verification Email
                </button>
              </div>
            </div>
          )}

          {/* STEP: Verifying OTP Processing State */}
          {step === 'VERIFYING' && (
            <div className="py-10 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-black">Verifying Aadhaar Identity...</h4>
                <p className="text-xs text-gray-500">Checking database and loading user profile</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
