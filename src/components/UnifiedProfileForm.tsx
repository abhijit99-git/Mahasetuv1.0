/**
 * Mahasetu Unified Digital Profile Builder
 * Form for first-time Aadhaar authenticated citizens to fill required socio-economic,
 * address, landholding, DBT bank, and document details.
 * Includes optional manual document submission toggles.
 */

import React, { useState, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  FileText,
  Building2,
  Landmark,
  CreditCard,
  MapPin,
  Upload,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Save,
  HelpCircle,
  FileCheck2,
  Layers,
  ChevronDown,
  Check,
  ArrowLeft,
  X
} from 'lucide-react';
import { CitizenUser, CitizenDocument } from '../types.ts';
import { Language, TRANSLATIONS } from '../locales.ts';

interface Props {
  citizen: CitizenUser;
  language: Language;
  onProfileSaved: (updatedCitizen: CitizenUser) => void;
  onCancel?: () => void;
}

export const UnifiedProfileForm: React.FC<Props> = ({
  citizen,
  language,
  onProfileSaved,
  onCancel
}) => {
  const t = TRANSLATIONS[language];
  const isExistingProfile = Boolean(citizen.isProfileComplete || citizen.name);

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState(citizen.name || '');
  const [fullNameMr, setFullNameMr] = useState(citizen.nameMr || '');
  const [dob, setDob] = useState(citizen.dob || '1995-05-20');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>(citizen.gender || 'MALE');
  const [phone, setPhone] = useState(citizen.phone || '+91 98220 12345');
  const [email, setEmail] = useState(citizen.email || 'citizen@mahashasan.gov.in');

  // Address
  const [street, setStreet] = useState(citizen.address?.street || 'Gat No. 101, Shetkari Nagar');
  const [village, setVillage] = useState(citizen.address?.villageOrCity || 'Haveli');
  const [taluka, setTaluka] = useState(citizen.address?.taluka || 'Haveli');
  const [district, setDistrict] = useState(citizen.address?.district || 'Pune');
  const [pincode, setPincode] = useState(citizen.address?.pincode || '411024');

  // Socio-Economic
  const [category, setCategory] = useState<'GENERAL' | 'OBC' | 'SC' | 'ST' | 'VJNT'>(citizen.category || 'OBC');
  const [annualIncome, setAnnualIncome] = useState<number>(citizen.annualIncome || 72000);
  const [rationCardType, setRationCardType] = useState<'YELLOW_BPL' | 'ORANGE' | 'WHITE'>(citizen.rationCardType || 'ORANGE');
  const [disabilityStatus, setDisabilityStatus] = useState<'NO' | 'YES'>(citizen.disabilityStatus || 'NO');

  // Land Details
  const [gatNumber, setGatNumber] = useState(citizen.landHolding?.gatNumber || 'MH-REV-712-GAT-101');
  const [areaInAcres, setAreaInAcres] = useState<number>(citizen.landHolding?.areaInAcres || 2.5);
  const [irrigationType, setIrrigationType] = useState<string>(citizen.landHolding?.irrigationType || 'Seasonal Rainfed');

  // DBT Bank Account
  const [bankName, setBankName] = useState(citizen.dbtBankDetails?.bankName || 'State Bank of India');
  const [accountNumber, setAccountNumber] = useState(citizen.dbtBankDetails?.accountNumber || '309981245512');
  const [ifscCode, setIfscCode] = useState(citizen.dbtBankDetails?.ifscCode || 'SBIN0001234');

  // Reset fields when citizen object changes
  useEffect(() => {
    setFullName(citizen.name || '');
    setFullNameMr(citizen.nameMr || '');
    setDob(citizen.dob || '1995-05-20');
    setGender(citizen.gender || 'MALE');
    setPhone(citizen.phone || '+91 98220 12345');
    setEmail(citizen.email || 'citizen@mahashasan.gov.in');
    setStreet(citizen.address?.street || 'Gat No. 101, Shetkari Nagar');
    setVillage(citizen.address?.villageOrCity || 'Haveli');
    setTaluka(citizen.address?.taluka || 'Haveli');
    setDistrict(citizen.address?.district || 'Pune');
    setPincode(citizen.address?.pincode || '411024');
    setCategory(citizen.category || 'OBC');
    setAnnualIncome(citizen.annualIncome || 72000);
    setRationCardType(citizen.rationCardType || 'ORANGE');
    setDisabilityStatus(citizen.disabilityStatus || 'NO');
    setGatNumber(citizen.landHolding?.gatNumber || 'MH-REV-712-GAT-101');
    setAreaInAcres(citizen.landHolding?.areaInAcres || 2.5);
    setIrrigationType(citizen.landHolding?.irrigationType || 'Seasonal Rainfed');
    setBankName(citizen.dbtBankDetails?.bankName || 'State Bank of India');
    setAccountNumber(citizen.dbtBankDetails?.accountNumber || '309981245512');
    setIfscCode(citizen.dbtBankDetails?.ifscCode || 'SBIN0001234');
  }, [citizen]);

  // Documents state with optional manual upload toggle
  const [documents, setDocuments] = useState<Array<{
    type: CitizenDocument['documentType'];
    title: string;
    file: File | null;
    status: CitizenDocument['status'];
    isManualOption: boolean;
  }>>([
    {
      type: '712_LAND_EXTRACT',
      title: '7/12 Land Extract (सातबारा उतारा)',
      file: null,
      status: 'NOT_PROVIDED',
      isManualOption: false
    },
    {
      type: 'INCOME_CERTIFICATE',
      title: 'Income Certificate (उत्पन्न दाखला)',
      file: null,
      status: 'NOT_PROVIDED',
      isManualOption: false
    },
    {
      type: 'CASTE_CERTIFICATE',
      title: 'Caste Certificate (जातीचा दाखला)',
      file: null,
      status: 'NOT_PROVIDED',
      isManualOption: false
    },
    {
      type: 'BANK_PASSBOOK',
      title: 'Bank Passbook / Cancelled Cheque',
      file: null,
      status: 'NOT_PROVIDED',
      isManualOption: false
    },
    {
      type: 'RATION_CARD',
      title: 'Ration Card Copy',
      file: null,
      status: 'NOT_PROVIDED',
      isManualOption: false
    }
  ]);

  const handleDocumentFileChange = (index: number, file: File | null) => {
    if (file && file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit. Please select a smaller file.');
      return;
    }
    setDocuments(prev => {
      const next = [...prev];
      next[index].file = file;
      next[index].status = file ? 'UPLOADED' : (next[index].isManualOption ? 'SUBMIT_MANUALLY_LATER' : 'NOT_PROVIDED');
      return next;
    });
  };

  const handleToggleManualOption = (index: number, checked: boolean) => {
    setDocuments(prev => {
      const next = [...prev];
      next[index].isManualOption = checked;
      if (checked) {
        next[index].file = null;
        next[index].status = 'SUBMIT_MANUALLY_LATER';
      } else {
        next[index].status = next[index].file ? 'UPLOADED' : 'NOT_PROVIDED';
      }
      return next;
    });
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name as per official records.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const formattedDocs: CitizenDocument[] = documents.map((doc, idx) => ({
        id: `doc-${idx + 1}-${Date.now()}`,
        documentType: doc.type,
        title: doc.title,
        fileName: doc.file ? doc.file.name : (doc.isManualOption ? 'Pending Manual Upload' : undefined),
        fileSize: doc.file ? `${(doc.file.size / 1024).toFixed(1)} KB` : undefined,
        uploadedAt: new Date().toISOString(),
        status: doc.status,
        isManualOption: doc.isManualOption
      }));

      const payload = {
        id: citizen.id,
        aadhaarNumber: citizen.aadhaarNumber,
        name: fullName,
        nameMr: fullNameMr || fullName,
        gender,
        dob,
        phone,
        email,
        address: {
          street,
          villageOrCity: village,
          taluka,
          district,
          state: 'Maharashtra',
          pincode
        },
        category,
        annualIncome,
        rationCardType,
        landHolding: {
          gatNumber,
          areaInAcres,
          irrigationType,
          village,
          taluka,
          district
        },
        dbtBankDetails: {
          bankName,
          accountNumber,
          ifscCode,
          isAadhaarSeeded: true
        },
        disabilityStatus,
        documents: formattedDocs
      };

      const res = await fetch('/api/citizens/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success && data.citizen) {
        setSuccessMsg('Unified Digital Profile created and synchronized with Supabase PostgreSQL DB!');
        setTimeout(() => {
          onProfileSaved(data.citizen);
        }, 1200);
      } else {
        setErrorMsg(data.error || 'Failed to save profile. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg('Network error while saving profile to database.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white/85 backdrop-blur-2xl border border-black/10 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.12)] space-y-6">
      {/* Prominent Callout Banner for Blank / Existing Profile */}
      <div className="bg-linear-to-r from-[#111815] to-[#1e2a25] text-white p-6 rounded-2xl border border-black/10 shadow-sm relative overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-400 text-[#111111] flex items-center justify-center font-bold text-xl shrink-0 shadow-md">
              <User className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-extrabold uppercase tracking-widest">
                  {isExistingProfile ? (language === 'mr' ? 'डिजिटल प्रोफाईल संपादन' : language === 'hi' ? 'डिजिटल प्रोफाइल संपादन' : 'Edit Unified Profile') : 'Create Unified Digital Profile'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-emerald-300 text-[10px] font-mono border border-white/15">
                  Aadhaar Verified: {citizen.maskedAadhaar}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
                {isExistingProfile
                  ? (language === 'mr' ? 'एकात्मिक डिजिटल प्रोफाईल संपादित करा' : language === 'hi' ? 'एकीकृत डिजिटल प्रोफाइल संपादित करें' : 'Update Your Unified Digital Profile')
                  : 'Initial Identity Setup (एकात्मिक डिजिटल प्रोफाईल)'}
              </h2>
              <p className="text-xs text-gray-300 max-w-3xl leading-relaxed mt-1">
                {isExistingProfile
                  ? (language === 'mr'
                      ? 'येथे आपली सामाजिक-आर्थिक माहिती, कायमचा पत्ता, ७/१२ शेतजमीन, थेट बँक खाते (DBT) व आवश्यक कागदपत्रे कधीही अद्ययावत करू शकता. सर्व ४,७०९+ योजनांसाठी हाच डेटा त्वरित लागू होईल.'
                      : language === 'hi'
                      ? 'यहाँ आप अपना सामाजिक-आर्थिक विवरण, स्थायी पता, 7/12 कृषि भूमि, प्रत्यक्ष बैंक खाता (DBT) एवं आवश्यक दस्तावेज कभी भी अपडेट कर सकते हैं।'
                      : 'You can update your socio-economic status, address, 7/12 land records, DBT bank account, and document attachments at any time. Changes sync instantly across all 4,709+ government schemes.')
                  : 'No profile details exist in the database for this Aadhaar yet. Fill in your one-time Unified Digital Profile below. All Maharashtra welfare scheme portals will fetch this data automatically.'}
              </p>
            </div>
          </div>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-all shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t.backToServices || 'Back'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Success / Error Messages */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 font-medium flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl text-xs text-rose-900 font-medium flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmitProfile} className="space-y-8">
        {/* Section 1: Personal Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-black/8 text-[#111111] font-bold text-sm">
            <User className="w-4 h-4 text-emerald-700" />
            <span>1. Personal Details (वैयक्तिक माहिती)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Full Name (English) *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="e.g. Abhijit Ramesh Patil"
                className="w-full px-3.5 py-2.5 bg-white border border-black/12 rounded-xl text-xs font-medium focus:outline-none focus:border-black transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                पूर्ण नाव (मराठीत)
              </label>
              <input
                type="text"
                value={fullNameMr}
                onChange={e => setFullNameMr(e.target.value)}
                placeholder="उदा. अभिजित रमेश पाटील"
                className="w-full px-3.5 py-2.5 bg-white border border-black/12 rounded-xl text-xs font-medium focus:outline-none focus:border-black transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Date of Birth (जन्म तारीख) *
              </label>
              <input
                type="date"
                required
                value={dob}
                onChange={e => setDob(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-black/12 rounded-xl text-xs font-medium focus:outline-none focus:border-black transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Gender (लिंग) *
              </label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-white border border-black/12 rounded-xl text-xs font-medium focus:outline-none focus:border-black transition-all"
              >
                <option value="MALE">Male (पुरुष)</option>
                <option value="FEMALE">Female (स्त्री)</option>
                <option value="OTHER">Other (इतर)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Mobile Number (मोबाईल क्र.) *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 98000 00000"
                className="w-full px-3.5 py-2.5 bg-white border border-black/12 rounded-xl text-xs font-medium focus:outline-none focus:border-black transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email Address (ईमेल आयडी)
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="citizen@mahashasan.gov.in"
                className="w-full px-3.5 py-2.5 bg-white border border-black/12 rounded-xl text-xs font-medium focus:outline-none focus:border-black transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Residential Address */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-black/8 text-[#111111] font-bold text-sm">
            <MapPin className="w-4 h-4 text-sky-700" />
            <span>2. Permanent Residential Address (कायमचा पत्ता)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Street / House No. / Village Name *
              </label>
              <input
                type="text"
                required
                value={street}
                onChange={e => setStreet(e.target.value)}
                placeholder="e.g. House No. 42, Main Shetkari Marg, Paradsinga"
                className="w-full px-3.5 py-2.5 bg-white border border-black/12 rounded-xl text-xs font-medium focus:outline-none focus:border-black transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Taluka (तालुका) *
              </label>
              <input
                type="text"
                required
                value={taluka}
                onChange={e => setTaluka(e.target.value)}
                placeholder="e.g. Haveli / Katol / Baramati"
                className="w-full px-3.5 py-2.5 bg-white border border-black/12 rounded-xl text-xs font-medium focus:outline-none focus:border-black transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                District (जिल्हा) *
              </label>
              <select
                value={district}
                onChange={e => setDistrict(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-black/12 rounded-xl text-xs font-medium focus:outline-none focus:border-black transition-all"
              >
                <option value="Pune">Pune (पुणे)</option>
                <option value="Nagpur">Nagpur (नागपूर)</option>
                <option value="Nashik">Nashik (नाशिक)</option>
                <option value="Chhatrapati Sambhajinagar">Chhatrapati Sambhajinagar</option>
                <option value="Kolhapur">Kolhapur (कोल्हापूर)</option>
                <option value="Thane">Thane (ठाणे)</option>
                <option value="Mumbai Suburban">Mumbai Suburban</option>
                <option value="Amravati">Amravati (अमरावती)</option>
                <option value="Solapur">Solapur (सोलापूर)</option>
                <option value="Nanded">Nanded (नांदेड)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Pincode (पिनकोड) *
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={pincode}
                onChange={e => setPincode(e.target.value)}
                placeholder="411024"
                className="w-full px-3.5 py-2.5 bg-white border border-black/12 rounded-xl text-xs font-medium focus:outline-none focus:border-black transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                State (राज्य)
              </label>
              <input
                type="text"
                disabled
                value="Maharashtra (महाराष्ट्र)"
                className="w-full px-3.5 py-2.5 bg-gray-100 border border-black/10 rounded-xl text-xs font-bold text-gray-700"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Socio-Economic Category & Income */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-black/8 text-[#111111] font-bold text-sm">
            <Building2 className="w-4 h-4 text-purple-700" />
            <span>3. Socio-Economic Criteria (सामाजिक-आर्थिक माहिती)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Social Category (प्रवर्ग) *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-white border border-black/12 rounded-xl text-xs font-medium focus:outline-none focus:border-black transition-all"
              >
                <option value="GENERAL">General (खुला)</option>
                <option value="OBC">OBC (इतर मागासवर्ग)</option>
                <option value="SC">SC (अनुसूचित जाती)</option>
                <option value="ST">ST (अनुसूचित जमाती)</option>
                <option value="VJNT">VJNT (विमुक्त जाती / भटक्या जमाती)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Annual Family Income (वार्षिक उत्पन्न ₹) *
              </label>
              <input
                type="number"
                required
                value={annualIncome}
                onChange={e => setAnnualIncome(Number(e.target.value))}
                placeholder="e.g. 72000"
                className="w-full px-3.5 py-2.5 bg-white border border-black/12 rounded-xl text-xs font-medium focus:outline-none focus:border-black transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Ration Card Type (रेशन कार्ड) *
              </label>
              <select
                value={rationCardType}
                onChange={e => setRationCardType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-white border border-black/12 rounded-xl text-xs font-medium focus:outline-none focus:border-black transition-all"
              >
                <option value="YELLOW_BPL">Yellow Card (BPL दारिद्र्यरेषेखालील)</option>
                <option value="ORANGE">Orange Card (केशरी - मध्यम उत्पन्न)</option>
                <option value="WHITE">White Card (पांढरे - उच्च उत्पन्न)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Disability / Divyang Status *
              </label>
              <select
                value={disabilityStatus}
                onChange={e => setDisabilityStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-white border border-black/12 rounded-xl text-xs font-medium focus:outline-none focus:border-black transition-all"
              >
                <option value="NO">No (अपंगत्व नाही)</option>
                <option value="YES">Yes (दिव्यांग ५०%+)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Agricultural & Landholding Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-black/8 text-[#111111] font-bold text-sm">
            <Landmark className="w-4 h-4 text-emerald-700" />
            <span>4. Farmer & Land Details (शेती व गट क्र. - Namo Shetkari Scheme)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Gat / Survey / Khata Number (गट क्र.)
              </label>
              <input
                type="text"
                value={gatNumber}
                onChange={e => setGatNumber(e.target.value)}
                placeholder="MH-REV-712-GAT-101"
                className="w-full px-3.5 py-2.5 bg-white border border-black/12 rounded-xl text-xs font-medium focus:outline-none focus:border-black transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Total Land Holding (एकूण जमीन क्षेत्र - एकर)
              </label>
              <input
                type="number"
                step="0.1"
                value={areaInAcres}
                onChange={e => setAreaInAcres(Number(e.target.value))}
                placeholder="2.5"
                className="w-full px-3.5 py-2.5 bg-white border border-black/12 rounded-xl text-xs font-medium focus:outline-none focus:border-black transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Irrigation Type (सिंचन प्रकार)
              </label>
              <select
                value={irrigationType}
                onChange={e => setIrrigationType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-black/12 rounded-xl text-xs font-medium focus:outline-none focus:border-black transition-all"
              >
                <option value="Seasonal Rainfed">Seasonal Rainfed (जिरायती - पावसाळी)</option>
                <option value="Perennial Well / Canal">Perennial Well / Canal (बागायती - विहीर/कालवा)</option>
                <option value="Drip / Micro Irrigation">Drip / Micro Irrigation (ठिबक सिंचन)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 5: Direct Benefit Transfer (DBT) Bank Account */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-black/8 text-[#111111] font-bold text-sm">
            <CreditCard className="w-4 h-4 text-amber-700" />
            <span>5. Direct Benefit Transfer Bank Account (DBT बँक खाते)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Bank Name (बँकेचे नाव) *
              </label>
              <input
                type="text"
                required
                value={bankName}
                onChange={e => setBankName(e.target.value)}
                placeholder="e.g. State Bank of India"
                className="w-full px-3.5 py-2.5 bg-white border border-black/12 rounded-xl text-xs font-medium focus:outline-none focus:border-black transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Account Number (खाते क्र.) *
              </label>
              <input
                type="text"
                required
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value)}
                placeholder="309981245512"
                className="w-full px-3.5 py-2.5 bg-white border border-black/12 rounded-xl text-xs font-medium focus:outline-none focus:border-black transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                IFSC Code (आय.एफ.एस.सी. कोड) *
              </label>
              <input
                type="text"
                required
                value={ifscCode}
                onChange={e => setIfscCode(e.target.value)}
                placeholder="SBIN0001234"
                className="w-full px-3.5 py-2.5 bg-white border border-black/12 rounded-xl text-xs font-medium focus:outline-none focus:border-black transition-all font-mono uppercase"
              />
            </div>
          </div>
        </div>

        {/* Section 6: Document Uploads with Optional Manual Submission Toggles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-black/8">
            <div className="flex items-center gap-2 text-[#111111] font-bold text-sm">
              <FileCheck2 className="w-4 h-4 text-emerald-700" />
              <span>6. Mandatory Documents & Verification Options</span>
            </div>
            <span className="text-[11px] text-[#5c5c5c]">
              Max file size: 5MB (PDF/JPG/PNG)
            </span>
          </div>

          <div className="space-y-3">
            {documents.map((doc, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition-all ${
                  doc.isManualOption
                    ? 'bg-amber-50/70 border-amber-200'
                    : doc.file
                    ? 'bg-emerald-50/70 border-emerald-200'
                    : 'bg-white border-black/10'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left Title & Status */}
                  <div className="space-y-1">
                    <span className="font-bold text-xs text-[#111111] block">
                      {doc.title}
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {doc.isManualOption ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                          <span>Submit Manually on Portal Later</span>
                        </span>
                      ) : doc.file ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          <span>File Selected: {doc.file.name}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-500 font-medium">
                          No file selected yet
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Upload Input & Manual Checkbox */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
                    <label className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                      doc.isManualOption
                        ? 'opacity-40 cursor-not-allowed bg-gray-100 border-gray-200 text-gray-400'
                        : 'bg-white hover:bg-black/5 border-black/15 text-[#111111]'
                    }`}>
                      <Upload className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{doc.file ? 'Change File' : 'Upload File'}</span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        disabled={doc.isManualOption}
                        className="hidden"
                        onChange={e => handleDocumentFileChange(idx, e.target.files ? e.target.files[0] : null)}
                      />
                    </label>

                    {/* Manual Submission Checkbox */}
                    <label className="inline-flex items-center gap-2 text-xs text-gray-700 cursor-pointer select-none bg-black/5 px-3 py-1.5 rounded-xl border border-black/8 hover:bg-black/10 transition-all">
                      <input
                        type="checkbox"
                        checked={doc.isManualOption}
                        onChange={e => handleToggleManualOption(idx, e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-800 focus:ring-emerald-600 border-gray-300"
                      />
                      <span className="font-medium text-[11px]">
                        Submit Manually Later
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit & Save / Cancel Buttons */}
        <div className="pt-4 border-t border-black/8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-[#5c5c5c] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Profile will be synchronized with Maharashtra Mahasetu & Supabase DB</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto px-5 py-3.5 bg-black/5 hover:bg-black/10 text-[#111111] font-semibold text-xs rounded-2xl border border-black/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <X className="w-4 h-4 text-[#5c5c5c]" />
                <span>{t.backToServices || 'Cancel'}</span>
              </button>
            )}

            <button
              id="btn-save-unified-profile"
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-8 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>
                {saving
                  ? (language === 'mr' ? 'सुपाबेस डेटाबेसमध्ये जतन करत आहे...' : 'Saving Profile to Supabase...')
                  : isExistingProfile
                  ? (language === 'mr' ? 'डिजिटल प्रोफाईल अद्ययावत करा' : language === 'hi' ? 'डिजिटल प्रोफाइल अपडेट करें' : 'Update Unified Profile')
                  : (language === 'mr' ? 'डिजिटल प्रोफाईल जतन करा' : language === 'hi' ? 'डिजिटल प्रोफाइल सहेजें' : 'Save Unified Profile to Database')}
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
