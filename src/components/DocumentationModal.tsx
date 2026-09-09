import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Search,
  BookOpen,
  ShieldCheck,
  Lock,
  FileText,
  Layers,
  Cpu,
  HelpCircle,
  Activity,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Printer,
  Copy,
  Check,
  Fingerprint,
  Database,
  ScrollText,
  Share2,
  FileCode2,
  Users,
  Building2,
  Clock,
  KeyRound
} from 'lucide-react';

export type DocTopicId =
  | 'working'
  | 'security'
  | 'dpdp'
  | 'aadhaar'
  | 'audit'
  | 'architecture'
  | 'api'
  | 'helpdesk'
  | 'privacy'
  | 'terms'
  | 'status';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: DocTopicId;
  onNavigateTab?: (tab: 'citizen' | 'consent' | 'audit' | 'ai' | 'officer' | 'gateway' | 'supabase') => void;
}

interface DocArticle {
  id: DocTopicId;
  category: 'Platform' | 'Security' | 'Developers' | 'Legal & Help';
  title: string;
  titleMr: string;
  subtitle: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  readTime: string;
  content: React.ReactNode;
}

export function DocumentationModal({
  isOpen,
  onClose,
  initialTopic = 'working',
  onNavigateTab
}: DocumentationModalProps) {
  const [activeTopicId, setActiveTopicId] = useState<DocTopicId>(initialTopic);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialTopic) {
      setActiveTopicId(initialTopic);
    }
  }, [initialTopic]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + '#' + activeTopicId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const articles: DocArticle[] = [
    {
      id: 'working',
      category: 'Platform',
      title: 'How Mahasetu Works: The Zero-Upload System',
      titleMr: 'महासेतू कार्यप्रणाली: शून्य कागदपत्र अपलोड',
      subtitle: 'How citizens get government services instantly without photocopies, physical queues, or manual verification.',
      badge: 'Core Workflow',
      icon: BookOpen,
      readTime: '4 min read',
      content: (
        <div className="space-y-6 text-sm text-[#333333] leading-relaxed">
          <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl">
            <h4 className="font-bold text-[#111111] text-base mb-1.5 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              The Core Problem Solved by Mahasetu
            </h4>
            <p className="text-[#333333] text-xs sm:text-sm">
              In the traditional system, a student in Pune applying for an engineering scholarship must obtain a <strong>7/12 Land Record</strong> from the Revenue Department, an <strong>Income Certificate</strong> from the Tahsildar, and a <strong>Caste Certificate</strong> from the District Welfare office. The citizen had to stand in 3 separate queues, spend ₹300-₹500 on photocopies, and wait 15-45 days while officers manually cross-verified paper documents.
            </p>
          </div>

          <div>
            <h4 className="text-base font-bold text-[#111111] mb-3">
              The 4-Step Mahasetu Digital Bridge
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-white border border-black/8 rounded-2xl shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-black/5 text-[#111111] flex items-center justify-center font-bold text-xs mb-2">
                  01
                </div>
                <h5 className="font-semibold text-[#111111] mb-1">Aadhaar Biometric Sign-in</h5>
                <p className="text-xs text-[#5c5c5c]">
                  The citizen scans their fingerprint or iris via UIDAI 2.5 Auth. No password or OTP to be intercepted, providing zero-trust identity verification.
                </p>
              </div>

              <div className="p-4 bg-white border border-black/8 rounded-2xl shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-black/5 text-[#111111] flex items-center justify-center font-bold text-xs mb-2">
                  02
                </div>
                <h5 className="font-semibold text-[#111111] mb-1">Automated Proof Discovery</h5>
                <p className="text-xs text-[#5c5c5c]">
                  Selecting a service triggers Mahasetu to discover which state departments hold the authoritative records (e.g., MahaBhulekh for land, Aaple Sarkar for caste).
                </p>
              </div>

              <div className="p-4 bg-white border border-black/8 rounded-2xl shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-black/5 text-[#111111] flex items-center justify-center font-bold text-xs mb-2">
                  03
                </div>
                <h5 className="font-semibold text-[#111111] mb-1">Granular DPDP Consent</h5>
                <p className="text-xs text-[#5c5c5c]">
                  The citizen reviews exactly which fields will be queried, for what specific purpose, and for how long. The citizen clicks &quot;Authorize Verification&quot;.
                </p>
              </div>

              <div className="p-4 bg-white border border-black/8 rounded-2xl shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-black/5 text-[#111111] flex items-center justify-center font-bold text-xs mb-2">
                  04
                </div>
                <h5 className="font-semibold text-[#111111] mb-1">Direct State-to-State Fetch</h5>
                <p className="text-xs text-[#5c5c5c]">
                  Mahasetu canonical adapters query source departments in under 400ms. The application is pre-verified with state cryptographic signatures. Zero scans uploaded!
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-black/5 rounded-2xl border border-black/5 space-y-2">
            <h5 className="font-bold text-[#111111] text-xs uppercase tracking-wider">
              Key Benefit for Citizens &amp; State:
            </h5>
            <ul className="text-xs text-[#4a4a4a] space-y-1.5 list-disc pl-4">
              <li><strong>Zero Document Uploads:</strong> Citizens never need to upload PDF scans or paper xeroxes.</li>
              <li><strong>Zero Fraud:</strong> Eliminates forged, tampered, or expired certificates because data is sourced directly from the issuing authority.</li>
              <li><strong>Sub-Second Processing:</strong> Applications that used to take 2 weeks can be adjudicated in minutes by desk officers.</li>
              <li><strong>Automatic Audit:</strong> Every query generates an immutable cryptographic receipt in the citizen&apos;s ledger.</li>
            </ul>
          </div>

          {onNavigateTab && (
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => { onClose(); onNavigateTab('citizen'); }}
                className="px-4 py-2 bg-[#141414] text-white rounded-xl text-xs font-semibold hover:bg-black transition-all flex items-center gap-1.5 shadow-xs"
              >
                <span>Try Live in Citizen Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => { onClose(); onNavigateTab('gateway'); }}
                className="px-4 py-2 bg-white text-[#111111] border border-black/10 rounded-xl text-xs font-semibold hover:bg-black/5 transition-all flex items-center gap-1.5"
              >
                <span>Inspect Gateway Adapters</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'security',
      category: 'Security',
      title: 'Citizen Security: What You Should Know',
      titleMr: 'नागरिक सुरक्षा: महत्त्वाच्या सुरक्षा मार्गदर्शक सूचना',
      subtitle: 'How Mahasetu protects your identity, biometrics, and personal data from unauthorized access, fraud, and theft.',
      badge: 'Security Essential',
      icon: ShieldCheck,
      readTime: '3 min read',
      content: (
        <div className="space-y-6 text-sm text-[#333333] leading-relaxed">
          <div className="p-5 bg-sky-50 border border-sky-200 rounded-2xl">
            <h4 className="font-bold text-[#111111] text-base mb-1.5 flex items-center gap-2">
              <Lock className="w-5 h-5 text-sky-700 shrink-0" />
              Our 5 Irrevocable Security Guarantees
            </h4>
            <p className="text-[#333333] text-xs sm:text-sm">
              As a citizen using Mahasetu, your data sovereignty is protected by mathematical cryptography and statutory legislation under the DPDP Act 2023.
            </p>
          </div>

          <div className="space-y-3.5">
            <div className="p-4 bg-white border border-black/8 rounded-2xl shadow-xs">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">1</span>
                <h5 className="font-bold text-[#111111] text-sm">We Never Store Your Biometrics</h5>
              </div>
              <p className="text-xs text-[#5c5c5c] pl-8">
                Your fingerprint or iris scan is encrypted immediately on the physical scanner using UIDAI&apos;s 2048-bit public key. It is transmitted directly to UIDAI KUA servers for yes/no confirmation and instantaneously destroyed in memory. Mahasetu never writes your fingerprint to disk or any database.
              </p>
            </div>

            <div className="p-4 bg-white border border-black/8 rounded-2xl shadow-xs">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">2</span>
                <h5 className="font-bold text-[#111111] text-sm">No Passwords to be Stolen or Phished</h5>
              </div>
              <p className="text-xs text-[#5c5c5c] pl-8">
                Phishing emails, fake SMS links, and database leaks cannot compromise your account because Mahasetu does not use passwords. Only your physical biometric presence or registered Aadhaar credential can unlock services.
              </p>
            </div>

            <div className="p-4 bg-white border border-black/8 rounded-2xl shadow-xs">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">3</span>
                <h5 className="font-bold text-[#111111] text-sm">Strict Data Minimization</h5>
              </div>
              <p className="text-xs text-[#5c5c5c] pl-8">
                When a department needs to know if you are eligible for an income-based scheme, they receive only a verified boolean or category check (e.g. &quot;Income &lt; ₹8 Lakhs: TRUE&quot;). They do not get your entire tax breakdown or bank transaction logs.
              </p>
            </div>

            <div className="p-4 bg-white border border-black/8 rounded-2xl shadow-xs">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">4</span>
                <h5 className="font-bold text-[#111111] text-sm">You Hold the Kill Switch (Consent Revocation)</h5>
              </div>
              <p className="text-xs text-[#5c5c5c] pl-8">
                Every consent granted to any department has an expiry date and can be revoked by you at any time with one click in the <strong>Consent Center</strong>. Once revoked, no officer can query your records.
              </p>
            </div>

            <div className="p-4 bg-white border border-black/8 rounded-2xl shadow-xs">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">5</span>
                <h5 className="font-bold text-[#111111] text-sm">Immutable Cryptographic Audit Trail</h5>
              </div>
              <p className="text-xs text-[#5c5c5c] pl-8">
                Every single query by any officer, system, or citizen is recorded in our SHA-256 blockchain-style ledger. If an officer views your record, you receive a timestamped entry with the officer&apos;s ID. No record can be silently deleted or altered.
              </p>
            </div>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900">
              <strong className="block font-semibold mb-0.5">Citizen Advisory:</strong>
              Never share your Aadhaar OTP or allow unauthorized agents to capture your biometrics outside of designated government Aaple Sarkar Seva Kendras.
            </div>
          </div>

          {onNavigateTab && (
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => { onClose(); onNavigateTab('consent'); }}
                className="px-4 py-2 bg-[#141414] text-white rounded-xl text-xs font-semibold hover:bg-black transition-all flex items-center gap-1.5 shadow-xs"
              >
                <span>Manage Consent in Consent Center</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => { onClose(); onNavigateTab('audit'); }}
                className="px-4 py-2 bg-white text-[#111111] border border-black/10 rounded-xl text-xs font-semibold hover:bg-black/5 transition-all flex items-center gap-1.5"
              >
                <span>View My Audit Ledger</span>
                <ScrollText className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'dpdp',
      category: 'Security',
      title: 'DPDP Act 2023 Compliance & Citizen Rights',
      titleMr: 'डिजिटल वैयक्तिक डेटा संरक्षण कायदा २०२३',
      subtitle: 'India’s landmark privacy statute and how Mahasetu guarantees citizen data fiduciary rights.',
      badge: 'Statutory Compliance',
      icon: KeyRound,
      readTime: '3 min read',
      content: (
        <div className="space-y-6 text-sm text-[#333333] leading-relaxed">
          <p>
            The <strong>Digital Personal Data Protection Act (DPDP), 2023</strong> establishes strict obligations on government bodies collecting or processing citizen data. Mahasetu was architected from the ground up to embody DPDP principles as native code constraints:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white border border-black/8 rounded-2xl">
              <h5 className="font-bold text-[#111111] mb-1 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                Section 6: Clear &amp; Specific Notice
              </h5>
              <p className="text-xs text-[#5c5c5c]">
                Before any data is accessed, citizens are provided with an unconditional notice in Marathi, Hindi, or English detailing the exact fields being queried and the specific public service purpose.
              </p>
            </div>

            <div className="p-4 bg-white border border-black/8 rounded-2xl">
              <h5 className="font-bold text-[#111111] mb-1 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                Section 7: Purpose Limitation
              </h5>
              <p className="text-xs text-[#5c5c5c]">
                Data authorized for a scholarship application cannot be transferred or accessed for revenue collection, traffic challans, or any secondary department without separate explicit consent.
              </p>
            </div>

            <div className="p-4 bg-white border border-black/8 rounded-2xl">
              <h5 className="font-bold text-[#111111] mb-1 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                Section 11: Right to Access &amp; Summary
              </h5>
              <p className="text-xs text-[#5c5c5c]">
                Citizens have the legal right to view a complete summary of all personal data being processed, which entities have requested it, and the operational status of all active consents.
              </p>
            </div>

            <div className="p-4 bg-white border border-black/8 rounded-2xl">
              <h5 className="font-bold text-[#111111] mb-1 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                Section 12: Right of Correction &amp; Erasure
              </h5>
              <p className="text-xs text-[#5c5c5c]">
                If a department holds an erroneous or outdated record, citizens can initiate a direct correction ticket through the integrated AI Sahayak or Citizen Helpdesk.
              </p>
            </div>
          </div>

          <div className="p-4 bg-black/5 rounded-2xl border border-black/8 text-xs text-[#4a4a4a]">
            <strong>Statutory Data Protection Officer:</strong> Mahasetu adheres to state data sovereignty guidelines. Grievances under DPDP 2023 must be addressed within 72 hours through our dedicated portal.
          </div>
        </div>
      )
    },
    {
      id: 'aadhaar',
      category: 'Security',
      title: 'Aadhaar Biometric & UIDAI 2.5 Security',
      titleMr: 'आधार बायोमेट्रिक व UIDAI २.५ सुरक्षा प्रणाली',
      subtitle: 'Technical specifications of our biometric authentication engine and hardware-level isolation.',
      badge: 'Technical Specs',
      icon: Fingerprint,
      readTime: '3 min read',
      content: (
        <div className="space-y-5 text-sm text-[#333333] leading-relaxed">
          <p>
            Mahasetu exclusively uses <strong>UIDAI Authentication 2.5</strong> standards. We support both <strong>Fingerprint Minutiae Record (FMR)</strong> and <strong>Iris Image Record (IIR)</strong> modalities under ISO/IEC international specifications.
          </p>

          <div className="p-4 bg-white border border-black/8 rounded-2xl space-y-3 font-mono text-xs">
            <div className="flex justify-between border-b border-black/5 pb-2">
              <span className="text-[#5c5c5c]">Auth API Specification:</span>
              <span className="font-bold text-[#111111]">UIDAI Auth API 2.5</span>
            </div>
            <div className="flex justify-between border-b border-black/5 pb-2">
              <span className="text-[#5c5c5c]">Fingerprint Standard:</span>
              <span className="font-bold text-[#111111]">ISO/IEC 19794-2 (FMR)</span>
            </div>
            <div className="flex justify-between border-b border-black/5 pb-2">
              <span className="text-[#5c5c5c]">Iris Standard:</span>
              <span className="font-bold text-[#111111]">ISO/IEC 19794-6 (IIR)</span>
            </div>
            <div className="flex justify-between border-b border-black/5 pb-2">
              <span className="text-[#5c5c5c]">PID Block Encryption:</span>
              <span className="font-bold text-emerald-700">RSA 2048-bit + AES-256 GCM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5c5c5c]">Device Classification:</span>
              <span className="font-bold text-[#111111]">L1 Registered Device (RD Service)</span>
            </div>
          </div>

          <div className="p-4 bg-black/5 rounded-2xl text-xs space-y-2 text-[#4a4a4a]">
            <h5 className="font-bold text-[#111111] uppercase tracking-wider">Why L1 Registered Devices Matter:</h5>
            <p>
              In L1 devices, biometric capture, template extraction, and PID block encryption occur <strong>inside the secure cryptographic hardware enclave of the scanner itself</strong>. The raw biometric image never touches the operating system, USB bus, or memory where spyware could intercept it.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'audit',
      category: 'Security',
      title: 'Cryptographic Audit Ledger (SHA-256)',
      titleMr: 'क्रिप्टोग्राफिक ऑडिट लेजर (SHA-२५६)',
      subtitle: 'How immutable blockchain-style hash linking guarantees zero tampering and total transparency.',
      badge: 'Tamper-Proof',
      icon: ScrollText,
      readTime: '3 min read',
      content: (
        <div className="space-y-5 text-sm text-[#333333] leading-relaxed">
          <p>
            Trust in government platforms requires verifiable proof. Mahasetu implements an immutable audit log where every transaction block is mathematically linked to its predecessor:
          </p>

          <div className="p-4 bg-[#fcfdfc] border border-black/10 rounded-2xl font-mono text-xs text-[#111111] shadow-xs">
            <div className="text-[#5c5c5c] mb-1">// Cryptographic Linkage Formula:</div>
            <div className="font-bold text-[#141414] overflow-x-auto py-1">
              H(n) = SHA-256( H(n-1) || Actor_UID || Action || Timestamp || Payload_Digest )
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-white border border-black/8 rounded-xl text-center">
              <div className="text-xl font-bold text-emerald-700">100%</div>
              <div className="text-[11px] text-[#5c5c5c] mt-0.5">Chain Integrity</div>
            </div>
            <div className="p-3.5 bg-white border border-black/8 rounded-xl text-center">
              <div className="text-xl font-bold text-[#111111]">SHA-256</div>
              <div className="text-[11px] text-[#5c5c5c] mt-0.5">FIPS 180-4 Standard</div>
            </div>
            <div className="p-3.5 bg-white border border-black/8 rounded-xl text-center">
              <div className="text-xl font-bold text-[#111111]">Real-time</div>
              <div className="text-[11px] text-[#5c5c5c] mt-0.5">Instant Verification</div>
            </div>
          </div>

          <p className="text-xs text-[#5c5c5c]">
            If any malicious actor or corrupt administrator modifies even a single comma or timestamp in a historical record, the SHA-256 checksum fails completely across all succeeding blocks, immediately triggering a security lockdown.
          </p>
        </div>
      )
    },
    {
      id: 'architecture',
      category: 'Platform',
      title: 'Platform Architecture & Data Pipeline',
      titleMr: 'प्लॅटफॉर्म आर्किटेक्चर आणि डेटा पाइपलाइन',
      subtitle: 'Non-invasive interoperability layer connecting legacy state silos into a unified digital mesh.',
      badge: 'System Design',
      icon: Layers,
      readTime: '4 min read',
      content: (
        <div className="space-y-6 text-sm text-[#333333] leading-relaxed">
          <p>
            Government departments cannot simply discard their mission-critical legacy databases. Mahasetu uses a <strong>non-invasive adapter mesh</strong> that standardizes data in-flight without demanding schema migrations from department IT teams:
          </p>

          <div className="space-y-3">
            <div className="p-4 bg-white border border-black/8 rounded-2xl shadow-xs">
              <h5 className="font-bold text-[#111111] text-xs uppercase tracking-wider mb-1">
                1. Presentation &amp; Citizen Consent Tier
              </h5>
              <p className="text-xs text-[#5c5c5c]">
                Next-generation accessible frontend built in React, Vite, and Tailwind with trilingual support (Marathi, Hindi, English). Strictly enforces Aadhaar biometric session token lifecycle.
              </p>
            </div>

            <div className="p-4 bg-white border border-black/8 rounded-2xl shadow-xs">
              <h5 className="font-bold text-[#111111] text-xs uppercase tracking-wider mb-1">
                2. Mahasetu Canonical Gateway &amp; Broker
              </h5>
              <p className="text-xs text-[#5c5c5c]">
                Routes queries, checks cryptographic token authenticity, verifies active DPDP consent licenses, and distributes requests to relevant department adapters in parallel.
              </p>
            </div>

            <div className="p-4 bg-white border border-black/8 rounded-2xl shadow-xs">
              <h5 className="font-bold text-[#111111] text-xs uppercase tracking-wider mb-1">
                3. Department Canonical Adapters (5 Active Bridges)
              </h5>
              <p className="text-xs text-[#5c5c5c]">
                Lightweight micro-adapters translating diverse departmental backends (Oracle for Revenue, PostgreSQL for Aaple Sarkar, MS SQL for Transport RTO, MySQL for Welfare) into unified Mahasetu JSON.
              </p>
            </div>

            <div className="p-4 bg-white border border-black/8 rounded-2xl shadow-xs">
              <h5 className="font-bold text-[#111111] text-xs uppercase tracking-wider mb-1">
                4. Cryptographic Storage &amp; Cloud Ledger Tier
              </h5>
              <p className="text-xs text-[#5c5c5c]">
                Hosted on Government of Maharashtra MeghRaj cloud infrastructure / Supabase PostgreSQL with strict Row Level Security (RLS) and SHA-256 hash chains.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'api',
      category: 'Developers',
      title: 'Department Adapter & API Specifications',
      titleMr: 'डिपार्टमेंट ॲडॉप्टर आणि API तपशील',
      subtitle: 'REST endpoints and canonical schema specifications for state engineering teams.',
      badge: 'Developer Docs',
      icon: FileCode2,
      readTime: '3 min read',
      content: (
        <div className="space-y-5 text-sm text-[#333333] leading-relaxed">
          <p>
            Any state or central department can integrate into Mahasetu by exposing a lightweight canonical adapter endpoint that fulfills the Mahasetu Interoperability Contract:
          </p>

          <div className="space-y-3">
            <div className="p-4 bg-[#fcfdfc] border border-black/10 rounded-2xl font-mono text-xs">
              <div className="text-emerald-700 font-bold mb-1">POST /api/departments/query</div>
              <div className="text-[#5c5c5c] text-[11px] mb-2">Query authoritative field proof using citizen Aadhaar hash and Consent ID</div>
              <pre className="text-[#141414] overflow-x-auto bg-black/5 p-3 rounded-xl text-[11px]">
{`{
  "targetDepartment": "REVENUE",
  "fieldCode": "LAND_RECORD_7_12",
  "citizenAadhaar": "548912048923",
  "consentId": "cns_982301_rev"
}`}
              </pre>
            </div>

            <div className="p-4 bg-[#fcfdfc] border border-black/10 rounded-2xl font-mono text-xs">
              <div className="text-sky-700 font-bold mb-1">POST /api/consent/create</div>
              <div className="text-[#5c5c5c] text-[11px] mb-2">Mint a new DPDP-compliant time-bound consent grant</div>
              <pre className="text-[#141414] overflow-x-auto bg-black/5 p-3 rounded-xl text-[11px]">
{`{
  "citizenId": "c1111111-2222-3333-4444-555555555501",
  "requestingDept": "HIGHER_EDU",
  "sourceDept": "REVENUE",
  "requestedFields": ["SURVEY_NUMBER", "LAND_HOLDING_ACRES"],
  "validityDays": 30
}`}
              </pre>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'helpdesk',
      category: 'Legal & Help',
      title: 'Citizen Helpdesk & Grievance Redressal',
      titleMr: 'नागरिक मदत केंद्र व तक्रार निवारण',
      subtitle: 'Multi-channel support, Aaple Sarkar Seva Kendras, and statutory grievance escalation.',
      badge: '24x7 Support',
      icon: HelpCircle,
      readTime: '2 min read',
      content: (
        <div className="space-y-5 text-sm text-[#333333] leading-relaxed">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
            <h5 className="font-bold text-[#111111] text-sm mb-1">
              Toll-Free Citizen Helpline: 1800-220-MAHA (1800-220-6242)
            </h5>
            <p className="text-xs text-[#333333]">
              Available Monday to Saturday from 8:00 AM to 8:00 PM IST in Marathi, Hindi, and English.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 bg-white border border-black/8 rounded-2xl">
              <h5 className="font-bold text-[#111111] mb-1">WhatsApp AI Assistant</h5>
              <p className="text-xs text-[#5c5c5c]">
                Send &quot;Namaskar&quot; to <strong>+91 91520 89201</strong> for voice-guided scheme eligibility checks and instant application status tracking.
              </p>
            </div>

            <div className="p-4 bg-white border border-black/8 rounded-2xl">
              <h5 className="font-bold text-[#111111] mb-1">MahaGrievance Portal</h5>
              <p className="text-xs text-[#5c5c5c]">
                File official complaints under the Maharashtra Right to Public Services Act. All tickets carry an automatic 72-hour statutory officer escalation clock.
              </p>
            </div>
          </div>

          <div className="p-4 bg-black/5 rounded-2xl text-xs text-[#4a4a4a]">
            <strong>In-Person Assistance:</strong> Visit any of Maharashtra&apos;s 28,000+ Aaple Sarkar Seva Kendras located in every Gram Panchayat and Municipal Ward for assisted biometric verification.
          </div>
        </div>
      )
    },
    {
      id: 'privacy',
      category: 'Legal & Help',
      title: 'Privacy Policy & Data Fiduciary Guarantee',
      titleMr: 'गोपनीयता धोरण आणि डेटा फिड्युशियरी हमी',
      subtitle: 'Government of Maharashtra undertaking on citizen personal data sovereignty and non-disclosure.',
      badge: 'Legal Policy',
      icon: FileText,
      readTime: '3 min read',
      content: (
        <div className="space-y-4 text-sm text-[#333333] leading-relaxed">
          <p>
            The Government of Maharashtra operates Mahasetu as a sovereign digital public good. We hold your personal data in trust as a <strong>Data Fiduciary</strong> under Indian Law.
          </p>

          <div className="space-y-2.5 text-xs text-[#4a4a4a]">
            <div className="p-3 bg-white border border-black/8 rounded-xl">
              <strong className="text-[#111111] block mb-0.5">1. Zero Commercialization</strong>
              We do not sell, license, lease, or commercially monetize citizen data under any circumstances.
            </div>
            <div className="p-3 bg-white border border-black/8 rounded-xl">
              <strong className="text-[#111111] block mb-0.5">2. No Cross-Profile Tracking</strong>
              Your activity on Mahasetu is never linked to third-party ad platforms, credit bureaus, or commercial trackers.
            </div>
            <div className="p-3 bg-white border border-black/8 rounded-xl">
              <strong className="text-[#111111] block mb-0.5">3. Strict Data Residency</strong>
              All servers, backups, and cryptographic keys reside physically within certified Tier-IV state data centers inside the state of Maharashtra, India.
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'terms',
      category: 'Legal & Help',
      title: 'Terms of Digital Service & RTS Act Entitlements',
      titleMr: 'सेवा अटी व सेवा हक्क कायदा',
      subtitle: 'Your legal rights under the Maharashtra Right to Public Services Act, 2015.',
      badge: 'Citizen Rights',
      icon: ScrollText,
      readTime: '3 min read',
      content: (
        <div className="space-y-4 text-sm text-[#333333] leading-relaxed">
          <p>
            Under the <strong>Maharashtra Right to Public Services Act, 2015</strong>, every citizen has a legal entitlement to transparent, accountable, and time-bound delivery of notified public services:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border border-black/10 rounded-xl overflow-hidden">
              <thead className="bg-black/5 font-semibold text-[#111111]">
                <tr>
                  <th className="p-3">Notified Service</th>
                  <th className="p-3">Standard RTS Timeline</th>
                  <th className="p-3">Mahasetu Digital Delivery</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                <tr className="bg-white">
                  <td className="p-3 font-medium">Income Certificate Verification</td>
                  <td className="p-3 text-[#5c5c5c]">15 Days</td>
                  <td className="p-3 font-bold text-emerald-700">Instantaneous (&lt; 2 seconds)</td>
                </tr>
                <tr className="bg-white">
                  <td className="p-3 font-medium">7/12 Land Record Extraction</td>
                  <td className="p-3 text-[#5c5c5c]">7 Days</td>
                  <td className="p-3 font-bold text-emerald-700">Instantaneous (&lt; 1 second)</td>
                </tr>
                <tr className="bg-white">
                  <td className="p-3 font-medium">Caste Certificate Cross-Check</td>
                  <td className="p-3 text-[#5c5c5c]">21 Days</td>
                  <td className="p-3 font-bold text-emerald-700">Instantaneous (&lt; 2 seconds)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )
    },
    {
      id: 'status',
      category: 'Platform',
      title: 'System Status & Department Cloud Health',
      titleMr: 'प्रणाली स्थिती आणि क्लाउड उपलब्धता',
      subtitle: 'Live operational metrics, latency benchmarks, and uptime guarantees for all state department bridges.',
      badge: 'Live Status: 99.98%',
      icon: Activity,
      readTime: '1 min read',
      content: (
        <div className="space-y-5 text-sm text-[#333333] leading-relaxed">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-600 animate-ping" />
              <div>
                <h5 className="font-bold text-emerald-950 text-sm">All Systems Operational</h5>
                <p className="text-xs text-emerald-800">State Data Center MeghRaj • Pune &amp; Mumbai Nodes Active</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
              99.98% UPTIME
            </span>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="p-3.5 bg-white border border-black/8 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-[#111111]">Revenue Dept (MahaBhulekh 7/12)</span>
              </div>
              <div className="flex items-center gap-4 text-[#5c5c5c]">
                <span>Latency: 18ms</span>
                <span className="text-emerald-700 font-bold">OPERATIONAL</span>
              </div>
            </div>

            <div className="p-3.5 bg-white border border-black/8 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-[#111111]">District Admin (Aaple Sarkar)</span>
              </div>
              <div className="flex items-center gap-4 text-[#5c5c5c]">
                <span>Latency: 24ms</span>
                <span className="text-emerald-700 font-bold">OPERATIONAL</span>
              </div>
            </div>

            <div className="p-3.5 bg-white border border-black/8 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-[#111111]">Transport Dept (Vahan / Sarathi RTO)</span>
              </div>
              <div className="flex items-center gap-4 text-[#5c5c5c]">
                <span>Latency: 32ms</span>
                <span className="text-emerald-700 font-bold">OPERATIONAL</span>
              </div>
            </div>

            <div className="p-3.5 bg-white border border-black/8 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-[#111111]">Higher Education (MahaDBT)</span>
              </div>
              <div className="flex items-center gap-4 text-[#5c5c5c]">
                <span>Latency: 29ms</span>
                <span className="text-emerald-700 font-bold">OPERATIONAL</span>
              </div>
            </div>

            <div className="p-3.5 bg-white border border-black/8 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-[#111111]">UIDAI Auth 2.5 KUA Gateway</span>
              </div>
              <div className="flex items-center gap-4 text-[#5c5c5c]">
                <span>Latency: 140ms</span>
                <span className="text-emerald-700 font-bold">OPERATIONAL</span>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const filteredArticles = articles.filter(
    art =>
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentArticle = articles.find(a => a.id === activeTopicId) || articles[0];

  const categories = ['All', 'Platform', 'Security', 'Developers', 'Legal & Help'];
  const [selectedCat, setSelectedCat] = useState<string>('All');

  const visibleArticles = filteredArticles.filter(
    a => selectedCat === 'All' || a.category === selectedCat
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-3 sm:p-5 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-5xl h-[90vh] max-h-[820px] bg-white text-[#111111] rounded-3xl shadow-[0_24px_60px_-15px_rgba(0,0,0,0.25)] border border-black/10 overflow-hidden flex flex-col relative"
      >
        {/* Top Dialog Bar */}
        <div className="px-6 py-4 border-b border-black/8 bg-white/80 backdrop-blur-xl flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black/5 border border-black/10 flex items-center justify-center font-bold text-lg text-[#141414] shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5c5c5c] bg-black/5 px-2 py-0.5 rounded-full">
                  Official Government Documentation
                </span>
                <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  DPDP 2023 Verified
                </span>
              </div>
              <h2 className="text-lg font-bold tracking-tight text-[#111111] mt-0.5">
                Mahasetu Knowledge &amp; Citizen Security Portal
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              title="Copy link to this article"
              className="p-2 text-[#5c5c5c] hover:text-[#111111] hover:bg-black/5 rounded-xl transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-[#5c5c5c] hover:text-[#111111] hover:bg-black/5 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Left Sidebar + Right Article Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Sidebar */}
          <div className="w-full md:w-80 border-r border-black/8 bg-[#fbfdfb] flex flex-col shrink-0 overflow-hidden">
            {/* Search within docs */}
            <div className="p-4 border-b border-black/8">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-[#8c8c8c]" />
                <input
                  type="text"
                  placeholder="Search working, security, DPDP..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-black/10 rounded-xl text-xs placeholder:text-[#8c8c8c] focus:outline-none focus:border-black shadow-2xs"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto mt-2.5 pb-1 no-scrollbar text-[11px]">
                {categories.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedCat(c)}
                    className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all ${
                      selectedCat === c
                        ? 'bg-[#141414] text-white shadow-2xs'
                        : 'bg-black/5 text-[#5c5c5c] hover:bg-black/10'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Articles List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {visibleArticles.map(art => {
                const Icon = art.icon;
                const isActive = art.id === activeTopicId;
                return (
                  <button
                    key={art.id}
                    type="button"
                    onClick={() => setActiveTopicId(art.id)}
                    className={`w-full text-left p-3 rounded-2xl transition-all border flex items-start gap-3 ${
                      isActive
                        ? 'bg-white border-black/20 shadow-xs ring-1 ring-black/5'
                        : 'border-transparent hover:bg-black/5 text-[#5c5c5c]'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isActive ? 'bg-[#141414] text-white' : 'bg-black/5 text-[#5c5c5c]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7a7a7a]">
                          {art.category}
                        </span>
                        <span className="text-[10px] text-[#8c8c8c]">{art.readTime}</span>
                      </div>
                      <h4
                        className={`text-xs font-semibold leading-snug line-clamp-1 ${
                          isActive ? 'text-[#111111]' : 'text-[#333333]'
                        }`}
                      >
                        {art.title}
                      </h4>
                      <p className="text-[11px] text-[#7a7a7a] line-clamp-1 mt-0.5">
                        {art.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}

              {visibleArticles.length === 0 && (
                <div className="p-6 text-center text-xs text-[#5c5c5c]">
                  No documentation found matching &quot;{searchQuery}&quot;.
                </div>
              )}
            </div>
          </div>

          {/* Right Main Article Reader */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white flex flex-col">
            <div className="max-w-3xl mx-auto w-full flex-1 space-y-6">
              {/* Article Header */}
              <div className="border-b border-black/8 pb-5">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#5c5c5c] bg-black/5 px-2.5 py-0.5 rounded-full">
                    {currentArticle.category}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {currentArticle.badge}
                  </span>
                  <span className="text-[11px] text-[#7a7a7a] ml-auto">
                    {currentArticle.readTime}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111]">
                  {currentArticle.title}
                </h1>
                <p className="text-xs sm:text-sm font-medium text-emerald-800 mt-1">
                  {currentArticle.titleMr}
                </p>
                <p className="text-xs sm:text-sm text-[#5c5c5c] mt-2 leading-relaxed">
                  {currentArticle.subtitle}
                </p>
              </div>

              {/* Article Content */}
              <div className="py-2">
                {currentArticle.content}
              </div>

              {/* Article Bottom Footer with Next/Prev Navigator */}
              <div className="pt-6 border-t border-black/8 flex items-center justify-between text-xs text-[#5c5c5c]">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#111111]">Official Release:</span>
                  <span>Government of Maharashtra Digital Public Infrastructure (DPI)</span>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 text-xs text-[#5c5c5c] hover:text-[#111111] hover:bg-black/5 rounded-lg border border-black/8 transition-all flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Guide</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
