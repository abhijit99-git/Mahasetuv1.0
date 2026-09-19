/**
 * Mahasetu Official Domain Knowledge Base
 * Authoritative ground-truth repository for:
 * 1. Mahasetu Federated DPI Architecture (Zero Uploads, Consent Matrix, SHA-256 Ledger)
 * 2. Maharashtra State Government Departments, Adapters, and Key Public Services
 * 3. Flagship Welfare & DBT Schemes (Ladki Bahin, Namo Shetkari, Shahu Maharaj Scholarship, MJPJAY)
 * 4. Strict Guardrails for Out-of-Scope Prompt Filtering
 */

export interface GovernmentServiceKnowledge {
  code: string;
  nameEn: string;
  nameMr: string;
  nameHi: string;
  departmentEn: string;
  departmentMr: string;
  departmentCode: 'REVENUE' | 'EDUCATION' | 'RTO' | 'DISTRICT_ADMIN' | 'HEALTH' | 'WCD' | 'SOCIAL_JUSTICE' | 'AGRICULTURE';
  category: 'SCHOLARSHIPS' | 'FARMER_LAND' | 'TRANSPORT' | 'CIVIL_CERTIFICATES' | 'HEALTHCARE' | 'WOMEN_CHILD' | 'SOCIAL_SECURITY';
  slaDays: number;
  feeInr: number;
  keyEligibility: string;
  requiredDocuments: string[];
  meshAvailableProofs: string[];
  zeroUploadMechanism: string;
  keywords: string[];
}

export const MAHASETU_SERVICES_KB: GovernmentServiceKnowledge[] = [
  {
    code: 'SRV_MAHADBT_SCHOLARSHIP',
    nameEn: 'Rajarshi Chhatrapati Shahu Maharaj Merit Scholarship & Fee Concession',
    nameMr: 'राजर्षी छत्रपती शाहू महाराज शिक्षण शुल्क शिष्यवृत्ती योजना',
    nameHi: 'राजर्षि छत्रपति शाहू महाराज शिक्षण शुल्क छात्रवृत्ति योजना',
    departmentEn: 'Higher & Technical Education Department (MahaDBT)',
    departmentMr: 'उच्च व तंत्रशिक्षण विभाग (महाडीबीटी)',
    departmentCode: 'EDUCATION',
    category: 'SCHOLARSHIPS',
    slaDays: 7,
    feeInr: 0,
    keyEligibility: 'Maharashtra domicile students admitted in professional degree courses (Engineering, Medical, Pharmacy, MBA, Polytechnic) with annual family income up to ₹8,00,000 for EBC/OBC/SEBC/SC/ST categories. Covers 50% to 100% tuition and exam fee reimbursement.',
    requiredDocuments: [
      'Aadhaar Card Biometric L1 Verification',
      'Tahsildar Certified Annual Income Certificate (Below ₹8 Lakh)',
      'Maharashtra 15-Year Domicile Certificate',
      'College Admission Fee Receipt & CAP Allotment Letter',
      'Caste Certificate & Validity (if reserved category)'
    ],
    meshAvailableProofs: [
      'Aadhaar Card Biometric L1 Verification',
      'Tahsildar Certified Annual Income Certificate',
      'Maharashtra 15-Year Domicile Certificate',
      'Caste Certificate & Validity'
    ],
    zeroUploadMechanism: 'Income and Domicile credentials auto-verified peer-to-peer from District Administration and Revenue registries; caste status verified via MahaDBT CCVIS registry.',
    keywords: [
      'scholarship', 'शिष्यवृत्ती', 'छात्रवृत्ति', 'education', 'college', 'engineering', 'medical',
      'shahu maharaj', 'शाहू महाराज', 'mahadbt', 'fee', 'reimbursement', 'diploma', 'polytechnic',
      'ebc', 'obc', 'sc', 'st', 'tuition'
    ]
  },
  {
    code: 'SRV_LADKI_BAHIN',
    nameEn: 'Mukhyamantri Majhi Ladki Bahin Yojana (₹1,500/Month DBT)',
    nameMr: 'मुख्यमंत्री माझी लाडकी बहीण योजना (₹१,५००/महिना थेट बँक खात्यात)',
    nameHi: 'मुख्यमंत्री माझी लाड़की बहिन योजना (₹1,500/माह प्रत्यक्ष लाभ अंतरण)',
    departmentEn: 'Women & Child Development Department',
    departmentMr: 'महिला व बालविकास विभाग, महाराष्ट्र शासन',
    departmentCode: 'WCD',
    category: 'WOMEN_CHILD',
    slaDays: 3,
    feeInr: 0,
    keyEligibility: 'Married, widowed, divorced, abandoned, and unmarried women aged 21 to 65 years residing in Maharashtra. Family annual income must not exceed ₹2.50 Lakhs (or holding Yellow/Orange Ration Card). Beneficiary must possess an active Aadhaar-seeded bank account.',
    requiredDocuments: [
      'Aadhaar Card Biometric Verification',
      'Maharashtra Domicile Certificate / Ration Card (15-yr proof)',
      'Family Income Certificate (Below ₹2.5 Lakh) or Yellow/Orange Ration Card',
      'Aadhaar-Seeded DBT Bank Account Details'
    ],
    meshAvailableProofs: [
      'Aadhaar Card Biometric Verification',
      'Maharashtra Domicile Certificate',
      'Ration Card (Civil Supplies NFSA)',
      'NPCI Aadhaar-Bank Seeding Bridge'
    ],
    zeroUploadMechanism: 'Bank Aadhaar seeding is verified via NPCI Payment Bridge, and income eligibility is auto-cleared using the Food & Civil Supplies ration card registry with zero paper visits.',
    keywords: [
      'ladki bahin', 'लाडकी बहीण', 'लाड़की बहिन', 'women', 'महिला', 'बहीण', 'sister', '1500',
      'dbt', 'monthly financial assistance', 'women subsidy', 'स्त्री', 'annapurna', 'सिलिंडर'
    ]
  },
  {
    code: 'SRV_SHETKARI_SANMAN',
    nameEn: 'Namo Shetkari Mahasanman Nidhi Subsidy & 7/12 Land Extract',
    nameMr: 'नमो शेतकरी महासन्मान निधी अनुदान व डिजिटल ७/१२ व ८-अ उतारा',
    nameHi: 'नमो शेतकारी महासम्मान निधि अनुदान एवं 7/12 व 8-अ खतौनी',
    departmentEn: 'Revenue & Forest Department (Mahabhulekh & Krishi)',
    departmentMr: 'महसूल व वन विभाग (महाभूलेख व कृषी विभाग)',
    departmentCode: 'REVENUE',
    category: 'FARMER_LAND',
    slaDays: 2,
    feeInr: 15,
    keyEligibility: 'Landholding farmer families owning cultivable land in Maharashtra registered in Mahabhulekh. Provides additional ₹6,000/year from Maharashtra State Government over and above PM-KISAN (total ₹12,000/yr). Land records must be digitally signed (Gat/Survey Number).',
    requiredDocuments: [
      'Aadhaar Biometric e-KYC',
      'Digital 7/12 (Satbara) & 8A Land Record Extract (Mahabhulekh)',
      'e-Pik Pahani Crop Sowing Record',
      'Aadhaar-Seeded Active Bank Account (DBT)'
    ],
    meshAvailableProofs: [
      'Aadhaar Biometric e-KYC',
      'Digital 7/12 & 8A Land Record Extract (Mahabhulekh)',
      'e-Pik Pahani Crop Sowing Record',
      'NPCI Aadhaar Bank Seeding'
    ],
    zeroUploadMechanism: 'Land ownership, Gat number, and crop status are verified in real-time through the Mahabhulekh & e-Pik Pahani canonical adapters directly by Mahasetu.',
    keywords: [
      '7/12', '७/१२', 'सातबारा', 'satbara', 'farmer', 'शेतकरी', 'किसान', 'namo shetkari', 'नमो शेतकरी',
      'land', 'जमीन', 'उतारा', 'खतौनी', 'krishi', 'कृषी', 'pm kisan', 'crop', 'pik pahani', 'gat number'
    ]
  },
  {
    code: 'SRV_LEARNER_DL_FAST_TRACK',
    nameEn: 'Learner Driving License Fast-Track (Contactless MahaRTO)',
    nameMr: 'शिकाऊ वाहन चालविण्याचा परवाना (लर्नर लायसन्स महा-आरटीओ)',
    nameHi: 'लर्नर ड्राइविंग लाइसेंस फास्ट-ट्रैक (कांटेक्टलेस महा-आरटीओ)',
    departmentEn: 'Transport Department (MahaRTO / Sarathi)',
    departmentMr: 'परिवहन विभाग (महा-आरटीओ / सारथी)',
    departmentCode: 'RTO',
    category: 'TRANSPORT',
    slaDays: 1,
    feeInr: 200,
    keyEligibility: 'Citizen aged 16+ for gearless 2-wheelers up to 50cc, or 18+ for light motor vehicles (cars/motorcycles with gear). Contactless Aadhaar-based authentication requires no physical visit to the RTO office for learner license generation.',
    requiredDocuments: [
      'Aadhaar Card Biometric Verification (Age & Address)',
      'Self-Declaration Form 1 (Physical Fitness)',
      'Online Road Safety and Signs Evaluation'
    ],
    meshAvailableProofs: [
      'Aadhaar Card Biometric Verification (Age & Address)',
      'Digital Medical Certificate / Form 1'
    ],
    zeroUploadMechanism: 'Identity, photo, age, and local address are authenticated via UIDAI KUA gateway, and learner license is dispatched instantly in PDF/mParivahan format.',
    keywords: [
      'driving license', 'license', 'लायसन्स', 'परवाना', 'rto', 'आरटीओ', 'learner', 'वाहन', 'गाडी',
      'car', 'bike', 'sarathi', 'सारथी', 'transport', 'परिवहन', 'mh12', 'mh14'
    ]
  },
  {
    code: 'SRV_EWS_CERTIFICATE',
    nameEn: 'Economically Weaker Section (EWS) & Income Certificate',
    nameMr: 'आर्थिकदृष्ट्या दुर्बल घटक (EWS) व सक्षम प्राधिकाऱ्याचा वार्षिक उत्पन्न दाखला',
    nameHi: 'आर्थिक रूप से कमजोर वर्ग (EWS) एवं वार्षिक आय प्रमाण पत्र',
    departmentEn: 'District Administration & Revenue Department',
    departmentMr: 'जिल्हा प्रशासन व महसूल विभाग (तहसीलदार कार्यालय)',
    departmentCode: 'DISTRICT_ADMIN',
    category: 'CIVIL_CERTIFICATES',
    slaDays: 5,
    feeInr: 33,
    keyEligibility: 'Citizens not covered under SC/ST/OBC quotas whose gross annual family income is below ₹8,00,000 for EWS certificate (or specified thresholds for 1-year/3-year general income certificate). Provides 10% quota in state government jobs and admissions.',
    requiredDocuments: [
      'Aadhaar Card Verification',
      'Proof of Income (ITR / Employer Salary Slip / Talathi Verification)',
      '15-Year Residence Proof in Maharashtra (Electricity Bill / Voter ID / Ration)',
      'Self-Declaration of Agricultural & Residential Assets'
    ],
    meshAvailableProofs: [
      'Aadhaar Card Verification',
      'Landholding Records (Mahabhulekh)',
      'Ration Card / Electoral Registry'
    ],
    zeroUploadMechanism: 'Cross-verifies land assets and electricity billing records through interoperability adapters before submitting for digital signature by Sub-Divisional Officer.',
    keywords: [
      'income certificate', 'उत्पन्न दाखला', 'आय प्रमाण पत्र', 'ews', 'ईडब्ल्यूएस', 'tahsildar',
      'तहसीलदार', 'annual income', '8 lakh', '८ लाख', 'non creamy layer', 'उत्पन्न', 'daakhla'
    ]
  },
  {
    code: 'SRV_CASTE_CERTIFICATE',
    nameEn: 'Caste Certificate & Lineage Verification (SC/ST/OBC/VJNT)',
    nameMr: 'जात प्रमाणपत्र व वंशावळ पडताळणी (अजा/अज/इमाव/विजाभज)',
    nameHi: 'जाति प्रमाण पत्र एवं वंशावली सत्यापन',
    departmentEn: 'Revenue & Social Justice Department',
    departmentMr: 'महसूल व सामाजिक न्याय विभाग (जात प्रमाणपत्र पडताळणी समिती)',
    departmentCode: 'DISTRICT_ADMIN',
    category: 'CIVIL_CERTIFICATES',
    slaDays: 14,
    feeInr: 50,
    keyEligibility: 'Permanent residents of Maharashtra belonging to recognized Scheduled Castes (SC), Scheduled Tribes (ST), Other Backward Classes (OBC), Special Backward Category (SBC), or VJNT. Requires paternal lineage proof prior to 1961 (SC) or 1967 (OBC).',
    requiredDocuments: [
      'Aadhaar Card Biometric Verification',
      'School Leaving Certificate of Applicant & Father/Grandfather',
      'Paternal Relative Caste Certificate (if available)',
      '15-Year Maharashtra Residence Domicile Proof'
    ],
    meshAvailableProofs: [
      'Aadhaar Card Biometric Verification',
      'Digitized Caste Validity CCVIS Records',
      'DigiLocker School Leaving Records'
    ],
    zeroUploadMechanism: 'Prior blood relative validity is searched against the CCVIS database, auto-clearing verification time from 45 days to 48 hours.',
    keywords: [
      'caste certificate', 'जात दाखला', 'जातीचा दाखला', 'जाति प्रमाण पत्र', 'caste validity',
      'जात पडताळणी', 'sc', 'st', 'obc', 'vjnt', 'lineage', 'वंशावळ', 'social welfare'
    ]
  },
  {
    code: 'SRV_MJPJAY_HEALTH',
    nameEn: 'Mahatma Jyotirao Phule Jan Arogya Yojana (MJPJAY - ₹5 Lakh Health Cover)',
    nameMr: 'महात्मा ज्योतिराव फुले जन आरोग्य योजना (₹५ लाखांपर्यंत मोफत उपचार)',
    nameHi: 'महात्मा ज्योतिराव फुले जन आरोग्य योजना (₹5 लाख तक निःशुल्क उपचार)',
    departmentEn: 'Public Health & Family Welfare Department',
    departmentMr: 'सार्वजनिक आरोग्य व कुटुंब कल्याण विभाग, महाराष्ट्र शासन',
    departmentCode: 'HEALTH',
    category: 'HEALTHCARE',
    slaDays: 1,
    feeInr: 0,
    keyEligibility: 'All Maharashtra families holding Yellow, Orange, or White Ration Cards or Antyodaya Anna Yojana cards. Covers 1,356 medical therapies, critical surgeries, oncology, cardiology, kidney transplants up to ₹5,00,000 per family per year in 1,000+ empanelled hospitals.',
    requiredDocuments: [
      'Aadhaar Card of Family Members',
      'Ration Card (Yellow / Orange / White) or Domicile Proof',
      'Doctor Clinical Diagnosis & Hospital Pre-Authorization Request'
    ],
    meshAvailableProofs: [
      'Aadhaar Card Verification',
      'Food & Civil Supplies Ration Card Registry',
      'State Domicile Registry'
    ],
    zeroUploadMechanism: 'Hospital Arogyamitra authenticates the patient instantly using biometric Aadhaar and live ration card entitlement on the Mahasetu health adapter without asking for cash or deposits.',
    keywords: [
      'health', 'आरोग्य', 'मजबूत उपचार', 'hospital', 'दवाखाना', 'mjpjay', 'आयुष्मान', 'ayushman bharat',
      'medical cover', 'treatment', 'ऑपरेशन', 'surgery', 'ration card', 'मोफत उपचार', 'free treatment'
    ]
  },
  {
    code: 'SRV_SANJAY_GANDHI_PENSION',
    nameEn: 'Sanjay Gandhi Niradhar Anudan Yojana & Shravan Bal Pension',
    nameMr: 'संजय गांधी निराधार अनुदान योजना व श्रावणबाळ राज्य निवृत्तीवेतन',
    nameHi: 'संजय गांधी निराधार अनुदान योजना एवं श्रावण बाल पेंशन',
    departmentEn: 'Social Justice & Special Assistance Department',
    departmentMr: 'सामाजिक न्याय व विशेष सहाय्य विभाग, महाराष्ट्र शासन',
    departmentCode: 'SOCIAL_JUSTICE',
    category: 'SOCIAL_SECURITY',
    slaDays: 10,
    feeInr: 0,
    keyEligibility: 'Destitute individuals, destitute widows, orphan children, divorced or abandoned women, and persons with 40%+ disability having annual family income under ₹50,000 (or ₹21,000 for specific categories). Senior citizens aged 65+ qualify under Shravan Bal Yojana. Provides ₹1,500/month DBT.',
    requiredDocuments: [
      'Aadhaar Card Verification',
      'Age Certificate / School Leaving Proof',
      'Income Certificate (Below ₹50,000)',
      'Disability Certificate from Civil Surgeon (if disabled)',
      'Active DBT-enabled Bank Account'
    ],
    meshAvailableProofs: [
      'Aadhaar Card Verification',
      'Civil Hospital UDID Disability Registry',
      'Tahsildar Income Registry',
      'NPCI Aadhaar Bank Seeding'
    ],
    zeroUploadMechanism: 'UDID disability percentage is verified directly from Swavlamban health portal and income proof from Revenue department, depositing ₹1,500 monthly directly to Aadhaar bank accounts.',
    keywords: [
      'pension', 'पेन्शन', 'निवृत्तीवेतन', 'niradhar', 'निराधार', 'sanjay gandhi', 'संजय गांधी',
      'shravan bal', 'श्रावणबाळ', 'destitute', 'disability', 'दिव्यांग', 'widow', 'विधवा', 'senior citizen'
    ]
  }
];

/**
 * Knowledge base for Mahasetu core principles and definitions
 */
export const MAHASETU_PLATFORM_CORE_KB = {
  name: 'Mahasetu (महासेतू)',
  role: 'Maharashtra Federated Interoperability & Citizen Consent Gateway',
  foundingPrinciple: 'Centralize consent, canonical data standards, workflow orchestration, and immutable auditability — NEVER centralize or duplicate every citizen\'s private records in a risky honeypot mega-database.',
  zeroUploadsPhilosophy: 'Instead of asking citizens to repeatedly scan, photocopy, notarize, and upload documents (7/12 land records, caste certificates, income certificates, marksheets), Mahasetu securely queries the authentic custodian department database in real time via peer-to-peer API hops authorized by the citizen.',
  privacyCompliance: 'Strictly compliant with India\'s Digital Personal Data Protection (DPDP) Act 2023. Every data hop requires a cryptographically signed, purpose-bound, and time-limited consent artifact.',
  auditLedger: 'Every cross-departmental verification is permanently recorded in a SHA-256 hash-chained immutable audit ledger so citizens and vigilance officers can verify who accessed what data, when, and for what approved scheme.',
  identityGateway: 'Authenticates citizens using 12-digit Aadhaar UID and L1 Biometric / OTP protocols, preventing identity theft and ghost beneficiaries.',
  keyDepartments: [
    'Revenue & Forest (Mahabhulekh 7/12, Land Records, e-Pik Pahani)',
    'Higher & Technical Education (MahaDBT Scholarships, Fee Concessions)',
    'District Administration / Tehsildar (Caste, Income, Domicile, EWS Certificates)',
    'Transport / MahaRTO (Sarathi / Vahan Learner & Driving Licenses)',
    'Public Health (MJPJAY / Ayushman Bharat Cashless Healthcare)',
    'Women & Child Development (Majhi Ladki Bahin, Annapurna Yojana)',
    'Social Justice & Special Assistance (Sanjay Gandhi Niradhar, Shravan Bal, UDID)'
  ]
};

/**
 * Strict Out-of-Scope Detection
 * Any query completely outside government services, schemes, certificates, welfare, and Mahasetu
 * MUST be intercepted and politely rejected with guidance.
 */
export const OUT_OF_SCOPE_PATTERNS = [
  // Weather queries
  /\b(weather|temperature|forecast|rain|rainfall|climate|हवामान|बारिश|तापमान|मौसम)\b/i,
  // Time and Date general questions
  /\b(what time is it|current time|today's date|आज किती वाजले|घड्याळ|समय क्या है)\b/i,
  // General Programming / Code Generation
  /\b(write (a )?(code|script|program|python|javascript|react|java|c\+\+|html|css)|debug this code|function to calculate|coding)\b/i,
  // Sports, Entertainment, Movies, Bollywood
  /\b(cricket|ipl|score|football|world cup|movie|cinema|actor|actress|song|गाणे|चित्रपट|गाना|बॉलीवूड)\b/i,
  // General Trivia, Jokes, Recipes
  /\b(tell me a joke|write a poem|recipe for|कथा सांगा|जोक सांगा|कविता|रेसिपी|खाना बनाना)\b/i,
  // Stock Market / Trading / Crypto
  /\b(stock price|share market|bitcoin|crypto|trading|nse|bse|गुंतवणूक शेअर्स)\b/i,
  // Personal assistants unrelated to govt
  /\b(who is the prime minister of france|capital of|who won|translate this paragraph|calculate 2\+2)\b/i
];

export function isQueryOutOfScope(query: string): boolean {
  const q = (query || '').trim().toLowerCase();

  // If query is an obvious government scheme/service keyword, it is definitely in scope
  const inScopeKeywords = [
    'mahasetu', 'महासेतू', 'scheme', 'योजना', 'दस्तावेज', 'कागदपत्र', 'दाखला', 'प्रमाणपत्र', 'certificate',
    'subsidy', 'अनुदान', 'scholarship', 'शिष्यवृत्ती', 'छात्रवृत्ति', '7/12', '७/१२', 'सातबारा', 'satbara',
    'land', 'जमीन', 'farmer', 'शेतकरी', 'किसान', 'caste', 'जात', 'जाति', 'income', 'उत्पन्न', 'आय',
    'domicile', 'अधिवास', 'रहिवासी', 'ration', 'रेशन', 'राशन', 'rto', 'driving license', 'परवाना', 'लायसन्स',
    'ladki bahin', 'लाडकी बहीण', 'लाड़की बहिन', 'mjpjay', 'आरोग्य', 'health', 'hospital', 'dbt', 'aadhaar',
    'आधार', 'government', 'शासन', 'सरकारी', 'maha', 'pension', 'पेन्शन', 'निराधार', 'sanjay gandhi',
    'shravan bal', 'ews', 'ews दाखला', 'tehsildar', 'तहसीलदार', 'collector', 'कलेक्टर', 'mahaonline',
    'mahadbt', 'mahabhulekh', 'sarathi', 'सारथी', 'vahan', 'वाहन', 'eligibility', 'पात्रता', 'अर्ज',
    'application', 'status', 'स्थिती', 'audit', 'ऑडिट', 'consent', 'संमती'
  ];

  if (inScopeKeywords.some(kw => q.includes(kw))) {
    return false;
  }

  // Check against out of scope patterns
  for (const pattern of OUT_OF_SCOPE_PATTERNS) {
    if (pattern.test(q)) {
      return true;
    }
  }

  // Check if query is unrelated general question (e.g. "what is python", "how to cook rice")
  if (
    q.startsWith('what is the weather') ||
    q.startsWith('how is the weather') ||
    q.startsWith('what is the time') ||
    q.startsWith('write a code') ||
    q.startsWith('write code') ||
    q.startsWith('generate code') ||
    q.startsWith('who is ') ||
    q.startsWith('tell me about ') ||
    q.includes('who created python')
  ) {
    return true;
  }

  return false;
}
