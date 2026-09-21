/**
 * Mahasetu AI Assistance Layer
 * Powered by Google Gemini API (@google/genai) with Resilient Multi-Model Fallback
 * Primary Model: gemini-3.8-flash
 * Secondary Model: gemini-flash-latest
 * Resilient Fallback: Maharashtra DPI Local Deterministic Engine
 *
 * Implements:
 * 1. AI Service Navigator (Marathi / Hindi / English)
 * 2. AI Form Helper & Status Explainer
 * 3. AI Schema Mapper (Legacy Department Schema -> Mahasetu Canonical Schema)
 */

import { GoogleGenAI, Type } from '@google/genai';
import { findRelevantSchemesForAI } from './schemes.ts';
import { WelfareScheme } from '../src/types.ts';
import {
  MAHASETU_SERVICES_KB,
  MAHASETU_PLATFORM_CORE_KB,
  isQueryOutOfScope,
  GovernmentServiceKnowledge
} from './knowledgeBase.ts';

interface KeyPoolMetrics {
  key: string;
  masked: string;
  cooldownUntil: number;
  requestsServed: number;
  rateLimitHits: number;
  lastUsedAt: number;
}

const keyPoolMap = new Map<string, KeyPoolMetrics>();

/**
 * Returns all configured Gemini API keys across primary, comma-separated, and numbered team variables.
 */
export function getAvailableGeminiKeys(): string[] {
  const rawList: string[] = [];

  // 1. Check comma/newline/semicolon separated pool variable
  if (process.env.GEMINI_API_KEYS) {
    const parts = process.env.GEMINI_API_KEYS.split(/[,\n;]/).map(s => s.trim()).filter(Boolean);
    rawList.push(...parts);
  }

  // 2. Check individual primary & team numbered variables
  const candidateVars = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
    process.env.GEMINI_API_KEY_5,
    process.env.GEMINI_API_KEY_BACKUP,
  ];

  for (const val of candidateVars) {
    if (val && typeof val === 'string' && val.trim()) {
      rawList.push(val.trim());
    }
  }

  // Deduplicate and filter out placeholders
  const uniqueKeys: string[] = [];
  for (const k of rawList) {
    if (
      !uniqueKeys.includes(k) &&
      k !== 'MY_GEMINI_API_KEY' &&
      k.length >= 12 &&
      !k.startsWith('YOUR_') &&
      !k.includes('placeholder')
    ) {
      uniqueKeys.push(k);
    }
  }

  return uniqueKeys;
}

export function hasConfiguredGeminiKeys(): boolean {
  return getAvailableGeminiKeys().length > 0;
}

/**
 * Provides live telemetry on pool status, active keys, and cooling down keys.
 */
export function getGeminiPoolStatus() {
  const keys = getAvailableGeminiKeys();
  const now = Date.now();

  const statuses = keys.map((key, idx) => {
    let metrics = keyPoolMap.get(key);
    if (!metrics) {
      const masked = key.length > 8 ? `${key.slice(0, 6)}...${key.slice(-4)}` : '****';
      metrics = {
        key,
        masked,
        cooldownUntil: 0,
        requestsServed: 0,
        rateLimitHits: 0,
        lastUsedAt: 0,
      };
      keyPoolMap.set(key, metrics);
    }

    const isCoolingDown = metrics.cooldownUntil > now;
    const cooldownSeconds = isCoolingDown ? Math.ceil((metrics.cooldownUntil - now) / 1000) : 0;

    return {
      index: idx + 1,
      role: idx === 0 ? 'DEFAULT_PRIMARY' : `FALLBACK_${idx}`,
      masked: metrics.masked,
      status: isCoolingDown ? 'RATE_LIMITED_COOLING_DOWN' : 'READY',
      cooldownSecondsRemaining: cooldownSeconds,
      requestsServed: metrics.requestsServed,
      rateLimitHits: metrics.rateLimitHits,
    };
  });

  return {
    totalConfiguredKeys: keys.length,
    defaultKey: statuses[0]?.masked || 'None',
    fallbackCount: Math.max(0, keys.length - 1),
    activeKeys: statuses.filter(s => s.status === 'READY').length,
    coolingDownKeys: statuses.filter(s => s.status !== 'READY').length,
    poolRedundancyEnabled: keys.length > 1,
    keys: statuses,
  };
}

function getGeminiClient(): GoogleGenAI | null {
  const keys = getAvailableGeminiKeys();
  if (keys.length === 0) {
    return null;
  }
  return new GoogleGenAI({
    apiKey: keys[0],
    httpOptions: {
      timeout: 12000,
      headers: {
        'User-Agent': 'aistudio-build-mahasetu-mesh',
      },
    },
  });
}

/**
 * Robust caller with Multi-Key Pool failover and Multi-Model fallback:
 * 1. Checks all configured team keys (Key 1 as Default; Keys 2, 3, 4 as sequential Fallbacks)
 * 2. If a key hits 429 / RESOURCE_EXHAUSTED / quota limit, marks 60s cooldown and fails over to next key
 * 3. On each key, tries gemini-3.8-flash -> gemini-3.6-flash -> gemini-3.1-flash-lite
 */
export async function callGeminiWithKeyPoolAndModelFallback<T>(
  executor: (ai: GoogleGenAI, modelName: string) => Promise<T>
): Promise<T> {
  const keys = getAvailableGeminiKeys();
  if (keys.length === 0) {
    throw new Error('NO_GEMINI_API_KEY_CONFIGURED');
  }

  const now = Date.now();

  // Sort keys: ready keys in defined order (Default first, then Fallbacks), cooling down keys at the end
  const candidateKeys = [...keys].sort((a, b) => {
    const ma = keyPoolMap.get(a) || { cooldownUntil: 0 };
    const mb = keyPoolMap.get(b) || { cooldownUntil: 0 };
    const aCool = ma.cooldownUntil > now;
    const bCool = mb.cooldownUntil > now;
    if (!aCool && bCool) return -1;
    if (aCool && !bCool) return 1;
    return keys.indexOf(a) - keys.indexOf(b);
  });

  const models = ['gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (let keyIdx = 0; keyIdx < candidateKeys.length; keyIdx++) {
    const key = candidateKeys[keyIdx];
    let metrics = keyPoolMap.get(key);
    if (!metrics) {
      const masked = key.length > 8 ? `${key.slice(0, 6)}...${key.slice(-4)}` : '****';
      metrics = {
        key,
        masked,
        cooldownUntil: 0,
        requestsServed: 0,
        rateLimitHits: 0,
        lastUsedAt: 0,
      };
      keyPoolMap.set(key, metrics);
    }

    const ai = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        timeout: 12000,
        headers: {
          'User-Agent': 'aistudio-build-mahasetu-mesh',
        },
      },
    });

    for (const model of models) {
      try {
        metrics.lastUsedAt = Date.now();
        const result = await Promise.race([
          executor(ai, model),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('UPSTREAM_HIGH_DEMAND_TIMEOUT')), 12000)
          )
        ]);

        // Success on this key & model
        metrics.requestsServed++;
        metrics.cooldownUntil = 0;
        return result;
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        const isRateLimit =
          errMsg.includes('429') ||
          errMsg.includes('RESOURCE_EXHAUSTED') ||
          errMsg.includes('quota') ||
          errMsg.includes('Too Many Requests');

        if (isRateLimit) {
          metrics.rateLimitHits++;
          // Put key in cooldown for 60 seconds
          metrics.cooldownUntil = Date.now() + 60_000;
          console.warn(
            `[Mahasetu AI Pool] Key #${keyIdx + 1} (${metrics.masked}) hit rate limit (429/RESOURCE_EXHAUSTED). Failing over to next key in pool (${candidateKeys.length - keyIdx - 1} remaining)...`
          );
          // Break out of model loop to try the NEXT key in the pool immediately
          break;
        }

        const isTransientModelError =
          errMsg.includes('503') ||
          errMsg.includes('high demand') ||
          errMsg.includes('UNAVAILABLE') ||
          errMsg.includes('spikes in demand') ||
          errMsg.includes('try again later') ||
          errMsg.includes('UPSTREAM_HIGH_DEMAND_TIMEOUT');

        if (isTransientModelError) {
          console.warn(`[Mahasetu AI] Model '${model}' on key #${keyIdx + 1} busy. Trying next model on same key...`);
          continue;
        }

        // Invalid key or permission error: skip this key permanently for this session
        const isAuthError =
          errMsg.includes('API_KEY_INVALID') ||
          errMsg.includes('PERMISSION_DENIED') ||
          errMsg.includes('401') ||
          errMsg.includes('403');

        if (isAuthError) {
          metrics.rateLimitHits += 99;
          metrics.cooldownUntil = Date.now() + 3_600_000;
          console.warn(`[Mahasetu AI Pool] Key #${keyIdx + 1} (${metrics.masked}) auth error. Skipping to next key.`);
          break;
        }

        console.warn(`[Mahasetu AI] Model '${model}' notice on key #${keyIdx + 1}: ${errMsg}`);
      }
    }
  }

  throw lastError || new Error('ALL_GEMINI_KEYS_EXHAUSTED');
}

/**
 * Backwards-compatible caller with single client fallback
 */
async function callGeminiWithFallback<T>(
  ai: GoogleGenAI,
  executor: (modelName: string) => Promise<T>
): Promise<T> {
  return callGeminiWithKeyPoolAndModelFallback((_ai, model) => executor(model));
}

export interface RelatedScheme {
  serviceId: string;
  serviceCode: string;
  serviceName: string;
  serviceNameMr?: string;
  department: string;
  departmentCode: string;
  category: string;
  benefit: string;
  benefitMr?: string;
  matchReason: string;
  matchReasonMr?: string;
  slaDays?: number;
  feeInr?: number;
  requiredDocuments: string[];
}

export interface ServiceNavigationResult {
  greeting?: string;
  isGreeting?: boolean;
  isOutOfScope?: boolean;
  intent: string;
  department: string;
  departmentCode: string;
  serviceName: string;
  serviceId?: string;
  serviceCode?: string;
  benefit?: string;
  benefitMr?: string;
  slaDays?: number;
  feeInr?: number;
  requiredDocuments: string[];
  availableInMesh?: string[];
  nextAction: string;
  confidence: number;
  explanation: string;
  summary?: string;
  advice?: string;
  profileEligibilityNote?: string;
  matchedSchemes?: WelfareScheme[];
  relatedSchemes?: RelatedScheme[];
  suggestedTopics?: string[];
  source?: 'gemini' | 'local_mesh_intelligence';
}

/**
 * Detect language with strict priority given to citizen's selected preferred language
 */
export function detectLanguage(text: string, preferredLanguage?: string): 'Marathi' | 'English' | 'Hindi' {
  if (preferredLanguage) {
    const pl = preferredLanguage.toLowerCase().trim();
    if (pl === 'mr' || pl === 'marathi') return 'Marathi';
    if (pl === 'hi' || pl === 'hindi') return 'Hindi';
    if (pl === 'en' || pl === 'english') return 'English';
  }

  const t = (text || '').toLowerCase().trim();
  const marathiRegex = /[\u0900-\u097F]/;

  // Specific Marathi vocabulary indicators
  const marathiKeywords = [
    'नमस्कार', 'सस्नेह', 'प्रणाम', 'हॅलो', 'हाय', 'कसा', 'कशी', 'कसे', 'मला', 'हवे',
    'पाहिजे', 'शेतकरी', 'उतारा', 'दाखला', 'परवाना', 'अर्ज', 'शिष्यवृत्ती', 'माहिती',
    'काय', 'कधी', 'कुठे', 'करावे', 'द्या', 'नाही', 'आहे', 'होय', 'सातबारा', 'जात',
    'प्रमाणपत्र', 'उत्पन्न', 'तहसीलदार', 'आरोग्य', 'परिवहन', 'गाडी', 'लायसन्स', 'विद्यार्थी',
    'शुभ सकाळ', 'शुभ प्रभात'
  ];

  // Specific Hindi vocabulary indicators
  const hindiKeywords = [
    'नमस्ते', 'मुझे', 'चाहिए', 'करना', 'कैसे', 'कहाँ', 'छात्रवृत्ति', 'प्रमाण पत्र',
    'किसान', 'खतौनी', 'आय प्रमाण', 'जाति'
  ];

  if (marathiKeywords.some(w => t.includes(w))) {
    return 'Marathi';
  }

  if (hindiKeywords.some(w => t.includes(w))) {
    return 'Hindi';
  }

  // Devanagari script present
  if (marathiRegex.test(text)) {
    return 'Marathi';
  }

  return 'English';
}

/**
 * Check if the query is a greeting or introductory pleasantry
 */
function isGreetingOnly(text: string): boolean {
  const t = (text || '').toLowerCase().trim();
  const greetings = [
    'नमस्कार', 'सस्नेह नमस्कार', 'प्रणाम', 'हॅलो', 'हाय', 'शुभ सकाळ', 'शुभ प्रभात',
    'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'namaste',
    'namaskar', 'pranam', 'greetings', 'who are you', 'how can you help'
  ];

  return greetings.some(g => t === g || t.startsWith(g + ' ') || t.endsWith(' ' + g)) ||
    (t.length <= 15 && greetings.some(g => t.includes(g)));
}

/**
 * Deterministic local NLP engine covering Maharashtra state services in Marathi, Hindi & English,
 * grounded in the Mahasetu Official Domain Knowledge Base and 4,709+ welfare schemes.
 */
function resolveLocalNavigation(
  query: string,
  preferredLanguage: string = 'Marathi',
  citizenProfile?: any
): ServiceNavigationResult {
  const q = query.toLowerCase().trim();
  const lang = detectLanguage(query, preferredLanguage);
  const isMr = lang === 'Marathi';
  const isHi = lang === 'Hindi';

  // 1. STRICT OUT-OF-SCOPE INTERCEPTION
  if (isQueryOutOfScope(query)) {
    return {
      greeting: isMr ? 'सस्नेह नमस्कार!' : isHi ? 'नमस्ते!' : 'Hello!',
      isGreeting: false,
      isOutOfScope: true,
      intent: 'OUT_OF_SCOPE',
      serviceCode: 'OUT_OF_SCOPE',
      serviceId: 'srv-out-of-scope',
      department: isMr ? 'महासेतू नागरिक साहाय्यता नियंत्रण' : isHi ? 'महासेतु नागरिक सहायता नियंत्रण' : 'Mahasetu Citizen Assistance Guardrail',
      departmentCode: 'OUT_OF_SCOPE',
      serviceName: isMr ? 'विषयाशी असंबंधित विचारणा (Out of Scope)' : isHi ? 'विषय से बाहर का अनुरोध (Out of Scope)' : 'Request Out of Context',
      requiredDocuments: [],
      availableInMesh: [],
      nextAction: 'REORIENT_TO_GOVT_SERVICES',
      confidence: 1.0,
      explanation: isMr
        ? 'हा प्रश्न महासेतू आणि शासकीय सेवांच्या कक्षेबाहेरचा आहे. महासेतू एआय साहाय्यक केवळ महाराष्ट्र शासन व केंद्र सरकारच्या जनकल्याणकारी योजना, शासकीय दाखले (७/१२, जात, उत्पन्न, अधिवास), शेतकरी अनुदान, शिष्यवृत्ती आणि शासकीय सेवा पडताळणीसाठी सहाय्य करतो.'
        : isHi
        ? 'यह अनुरोध महासेतु और सरकारी सेवाओं के दायरे से बाहर है। महासेतु एआई सहायक केवल महाराष्ट्र सरकार और केंद्र सरकार की कल्याणकारी योजनाओं, प्रमाण पत्रों (7/12, जाति, आय, अधिवास), किसान अनुदान, छात्रवृत्ति एवं सरकारी सेवाओं के सत्यापन के लिए है।'
        : 'Your request is out of context for Mahasetu. The AI Citizen Sahayak is dedicated strictly to Maharashtra and Central Government welfare schemes, official civil certificates (7/12 land extract, caste, income, domicile), farmer subsidies, and public service interoperability.',
      advice: isMr
        ? 'कृपया महाराष्ट्र शासनाच्या योजना, दाखले, शेतकरी मदत किंवा शिष्यवृत्ती या विषयाशी संबंधित प्रश्न विचारा. उदा. "लाडकी बहीण योजनेची पात्रता काय आहे?", "७/१२ उतारा कसा मिळवायचा?", किंवा "माझ्या उत्पन्नानुसार कोणत्या योजना मिळतील?".'
        : isHi
        ? 'कृपया महाराष्ट्र सरकार की योजनाओं, प्रमाण पत्रों, किसान सब्सिडी या छात्रवृत्ति से संबंधित प्रश्न पूछें।'
        : 'Please ask questions related to government schemes, certificates, farmer assistance, or scholarships. E.g., "What are the eligibility criteria for Majhi Ladki Bahin Yojana?", "How to get a 7/12 land extract?", or "Which schemes match my profile?".',
      suggestedTopics: isMr
        ? ['माझी लाडकी बहीण योजना', '७/१२ डिजिटल उतारा', 'महाडीबीटी शिष्यवृत्ती', 'शिकाऊ वाहन परवाना', 'जात व उत्पन्न दाखला']
        : isHi
        ? ['लाड़की बहिन योजना', '7/12 भूमि रिकॉर्ड', 'महाडीबीटी छात्रवृत्ति', 'ड्राइविंग लाइसेंस', 'जाति एवं आय प्रमाण पत्र']
        : ['Majhi Ladki Bahin Yojana', '7/12 Land Record', 'MahaDBT Scholarship', 'Learner Driving License', 'Caste & Income Certificate'],
      source: 'local_mesh_intelligence'
    };
  }

  // 2. GREETING ONLY
  if (isGreetingOnly(query)) {
    return {
      greeting: isMr
        ? 'नमस्कार! महासेतू डिजिटल सेवा मंचावर आपले सहर्ष स्वागत आहे.'
        : isHi
        ? 'नमस्ते! महासेतु डिजिटल नागरिक सेवा मंच में आपका स्वागत है।'
        : 'Hello! Welcome to Mahasetu AI Citizen Sahayak.',
      isGreeting: true,
      isOutOfScope: false,
      intent: 'GREETING_AND_DISCOVERY',
      serviceCode: 'MAHASETU_DISCOVERY',
      serviceId: 'srv-discovery',
      department: isMr
        ? 'महाराष्ट्र शासन (डिजिटल पब्लिक इन्फ्रास्ट्रक्चर)'
        : isHi
        ? 'महाराष्ट्र शासन (डिजिटल सार्वजनिक अवसंरचना)'
        : 'Government of Maharashtra (Digital Public Infrastructure)',
      departmentCode: 'MAHASETU',
      serviceName: isMr
        ? 'महासेतू नागरिक सहाय्य व सेवा शोध'
        : isHi
        ? 'महासेतु नागरिक सहायता एवं सेवा खोज'
        : 'Mahasetu Citizen Assistance & Service Discovery',
      requiredDocuments: ['Aadhaar Card Biometric Verification'],
      availableInMesh: ['Aadhaar Card Biometric Verification'],
      nextAction: '/services',
      confidence: 1.0,
      explanation: isMr
        ? 'नमस्कार! मी आपला महासेतू एआय साहाय्यक आहे. मी आपल्याला महाराष्ट्र शासनाच्या विविध सेवांसाठी (उदा. माझी लाडकी बहीण योजना, शेतकरी सन्मान निधी व ७/१२ उतारा, महाडीबीटी शिष्यवृत्ती, शिकाऊ वाहन परवाना, जात व उत्पन्न दाखला) थेट मदत करू शकतो. आपल्याला आज कोणती शासकीय सेवा हवी आहे?'
        : isHi
        ? 'नमस्ते! मैं आपका महासेतु एआई सहायक हूँ। मैं आपको महाराष्ट्र सरकार की विभिन्न सेवाओं (जैसे लाड़की बहिन योजना, किसान सम्मान निधि व 7/12 खतौनी, महाडीबीटी छात्रवृत्ति, ड्राइविंग लाइसेंस, जाति एवं आय प्रमाण पत्र) में सहायता कर सकता हूँ। आज मैं आपकी क्या मदद करूँ?'
        : 'Hello! I am your Mahasetu AI Assistant for Maharashtra Government digital public services. I can guide you through welfare schemes (Ladki Bahin, Namo Shetkari, Scholarships), 7/12 land records, learner driving licenses, and caste or income certificates with zero paper uploads. How can I help you today?',
      summary: isMr
        ? 'महासेतूच्या माध्यमातून शासकीय सेवांसाठी कार्यालयात जाण्याची किंवा कागदपत्रे स्कॅन करण्याची गरज नाही. सर्व पडताळणी थेट पूर्ण होते.'
        : isHi
        ? 'महासेतु के माध्यम से सरकारी कार्यालयों के चक्कर काटने की आवश्यकता नहीं है।'
        : 'Zero physical uploads required. All state credentials are authenticated digitally through the Mahasetu federated mesh.',
      advice: isMr
        ? 'कृपया आपल्या गरजेनुसार कोणतीही सेवा किंवा योजना विचारा, जसे: "लाडकी बहीण योजनेची पात्रता", "मला शिष्यवृत्ती हवी आहे" किंवा "७/१२ उतारा कसा काढायचा".'
        : isHi
        ? 'कृपया अपनी आवश्यकता अनुसार पूछें, जैसे: "लाड़की बहिन योजना की पात्रता", "मुझे छात्रवृत्ति चाहिए" या "ड्राइविंग लाइसेंस कैसे बनेगा".'
        : 'Feel free to ask for any service or scheme, e.g., "Ladki Bahin scheme details", "I need a scholarship", or "How to get a 7/12 land extract".',
      suggestedTopics: isMr
        ? ['माझी लाडकी बहीण योजना', 'नमो शेतकरी सन्मान निधी', 'महाडीबीटी शिष्यवृत्ती', 'शिकाऊ वाहन परवाना', 'उत्पन्न व जात दाखला']
        : ['Majhi Ladki Bahin Yojana', 'Namo Shetkari Subsidy', 'MahaDBT Scholarship', 'Learner Driving License', 'Income & Caste Certificate'],
      source: 'local_mesh_intelligence'
    };
  }

  // 3. MATCH AGAINST OFFICIAL SERVICES KNOWLEDGE BASE
  let matchedKbService: GovernmentServiceKnowledge | null = null;
  let highestMatchScore = 0;

  for (const srv of MAHASETU_SERVICES_KB) {
    let score = 0;
    for (const kw of srv.keywords) {
      if (q.includes(kw.toLowerCase())) {
        score += kw.length > 4 ? 3 : 1;
      }
    }
    if (score > highestMatchScore) {
      highestMatchScore = score;
      matchedKbService = srv;
    }
  }

  // Also query relevant schemes from 4,709+ database
  const matchingSchemes = findRelevantSchemesForAI(query, 4, citizenProfile);

  if (matchedKbService && highestMatchScore > 0) {
    const srvName = isMr ? matchedKbService.nameMr : isHi ? matchedKbService.nameHi : matchedKbService.nameEn;
    const deptName = isMr ? matchedKbService.departmentMr : matchedKbService.departmentEn;

    let profileNote: string | undefined = undefined;
    if (citizenProfile) {
      if (matchedKbService.code === 'SRV_LADKI_BAHIN') {
        const isFemale = citizenProfile.gender === 'FEMALE' || citizenProfile.gender === 'female';
        const income = Number(citizenProfile.annualIncome) || 0;
        if (isFemale && (!income || income <= 250000)) {
          profileNote = isMr
            ? `आपल्या प्रोफाइलनुसार आपण महिला असून कौटुंबिक उत्पन्न ₹२.५० लाखांपेक्षा कमी असल्यामुळे आपण या योजनेसाठी पूर्ण पात्र आहात.`
            : `Based on your unified profile (Female, annual income ≤ ₹2.5L), you meet the eligibility criteria for Mukhyamantri Majhi Ladki Bahin Yojana.`;
        }
      } else if (matchedKbService.code === 'SRV_SHETKARI_SANMAN') {
        const landArea = Number(citizenProfile.landHolding?.areaInAcres) || 0;
        if (landArea > 0) {
          profileNote = isMr
            ? `आपल्या प्रोफाइलमध्ये ${landArea} एकर शेतजमीन नोंदणीकृत असल्यामुळे आपण नमो शेतकरी सन्मान निधीसाठी थेट पात्र आहात.`
            : `With ${landArea} acres of land registered in your profile, you are eligible for Namo Shetkari Mahasanman Nidhi.`;
        }
      } else if (matchedKbService.code === 'SRV_MAHADBT_SCHOLARSHIP') {
        const category = citizenProfile.category;
        const income = Number(citizenProfile.annualIncome) || 0;
        if (income <= 800000) {
          profileNote = isMr
            ? `आपले कौटुंबिक उत्पन्न ₹८ लाखांच्या मर्यादेत (प्रवर्ग: ${category || 'सामान्य'}) असल्यामुळे आपण महाडीबीटी शिष्यवृत्तीसाठी पात्र आहात.`
            : `Your annual income is within the ₹8,00,000 ceiling (Category: ${category || 'General'}), qualifying you for MahaDBT fee concessions.`;
        }
      }
    }

    return {
      greeting: isMr ? 'सस्नेह नमस्कार!' : isHi ? 'नमस्ते!' : 'Hello!',
      isGreeting: false,
      isOutOfScope: false,
      intent: `APPLY_${matchedKbService.code}`,
      serviceCode: matchedKbService.code,
      serviceId: `srv-${matchedKbService.category.toLowerCase()}`,
      department: deptName,
      departmentCode: matchedKbService.departmentCode,
      serviceName: srvName,
      slaDays: matchedKbService.slaDays,
      feeInr: matchedKbService.feeInr,
      requiredDocuments: matchedKbService.requiredDocuments,
      availableInMesh: matchedKbService.meshAvailableProofs,
      nextAction: `/services/${matchedKbService.code}`,
      confidence: 0.96,
      explanation: isMr
        ? `आपल्या विचारणेनुसार "${srvName}" ही सेवा निश्चित करण्यात आली आहे. ${matchedKbService.keyEligibility}`
        : isHi
        ? `आपके अनुरोध के अनुसार "${srvName}" सेवा चिन्हित की गई है। ${matchedKbService.keyEligibility}`
        : `Identified service: "${srvName}". ${matchedKbService.keyEligibility}`,
      summary: isMr
        ? `महासेतू शून्य-कागदपत्र तंत्रज्ञान: ${matchedKbService.zeroUploadMechanism}`
        : `Mahasetu Zero-Upload Engine: ${matchedKbService.zeroUploadMechanism}`,
      advice: isMr
        ? `या सेवेसाठी लागणारे सर्व पुरावे महासेतूच्या आंतर-विभागीय प्रणालीद्वारे थेट तपासले जातील. कोणत्याही कार्यालयात फेऱ्या मारण्याची गरज नाही.`
        : `All required proofs are verified peer-to-peer via Mahasetu consent protocols without scanning physical papers.`,
      profileEligibilityNote: profileNote,
      matchedSchemes: matchingSchemes,
      source: 'local_mesh_intelligence'
    };
  }

  // 4. GENERAL GOVERNMENT SCHEME / DISCOVERY LOOKUP (When citizen asks a general govt question or about schemes for their profile)
  const topScheme = matchingSchemes[0];
  const schemeTitle = topScheme ? (isMr ? (topScheme.nameMr || topScheme.name) : topScheme.name) : (isMr ? 'महाराष्ट्र शासन जनकल्याणकारी योजना' : 'Maharashtra Welfare Schemes');

  return {
    greeting: isMr ? 'सस्नेह नमस्कार!' : isHi ? 'नमस्ते!' : 'Hello!',
    isGreeting: false,
    isOutOfScope: false,
    intent: 'EXPLORE_SCHEMES_AND_SERVICES',
    serviceCode: topScheme ? topScheme.id : 'SRV_MAHADBT_SCHOLARSHIP',
    serviceId: topScheme ? topScheme.id : 'srv-welfare',
    department: topScheme ? topScheme.issuingAuthority : (isMr ? 'महाराष्ट्र शासन (सार्वजनिक सेवा मंच)' : 'Government of Maharashtra'),
    departmentCode: 'MAHASETU',
    serviceName: schemeTitle,
    slaDays: 7,
    feeInr: 0,
    requiredDocuments: topScheme ? (topScheme.requiredDocuments || ['Aadhaar Card Biometric Verification', 'Income Certificate', 'Domicile Certificate']) : ['Aadhaar Card Biometric Verification'],
    availableInMesh: ['Aadhaar Card Biometric Verification', 'Income Certificate (Revenue Registry)'],
    nextAction: '/schemes',
    confidence: 0.90,
    explanation: isMr
      ? `आपल्या विचारणेनुसार शासकीय योजना व सेवा शोधण्यात आल्या आहेत. ${topScheme ? `प्रमुख योजना: ${schemeTitle}. लाभ: ${topScheme.benefitSummary}.` : 'महासेतूद्वारे सर्व पुरावे विना-कागदी पडताळले जातात.'}`
      : `Identified relevant government schemes. ${topScheme ? `Primary scheme: ${schemeTitle}. Benefit: ${topScheme.benefitSummary}.` : 'All proofs are verified digitally through Mahasetu.'}`,
    summary: isMr
      ? 'महासेतू आंतर-विभागीय प्रणालीद्वारे थेट पडताळणी होते. कागदपत्रे सादर करण्याची गरज नाही.'
      : 'Peer-to-peer interoperability eliminates manual document submissions.',
    advice: isMr
      ? 'आपण योजनेचा तपशील तपासून थेट शून्य-कागदपत्र अर्ज करू शकता किंवा योजना सूचीमध्ये इतर योजना पाहू शकता.'
      : 'Review the matched scheme details below to begin zero-upload application or explore matching schemes in the catalogue.',
    matchedSchemes: matchingSchemes,
    source: 'local_mesh_intelligence'
  };
}

export async function navigateServiceQuery(
  query: string,
  preferredLanguage: string = 'Marathi',
  citizenProfile?: any
): Promise<ServiceNavigationResult> {
  const detectedLang = detectLanguage(query, preferredLanguage);

  // 1. FAST-PATH OUT-OF-SCOPE FILTER:
  // If the query is blatantly out of scope (weather, time, programming, sports, jokes, etc.),
  // immediately return the strict refusal without wasting upstream tokens.
  if (isQueryOutOfScope(query)) {
    return resolveLocalNavigation(query, detectedLang, citizenProfile);
  }

  if (!hasConfiguredGeminiKeys()) {
    return resolveLocalNavigation(query, detectedLang, citizenProfile);
  }

  try {
    const relevantSchemes = findRelevantSchemesForAI(query, 5, citizenProfile);
    const schemesContext = relevantSchemes.map(s =>
      `- [${s.id}] ${s.name} (${s.nameMr || ''}): ${s.benefitSummary} | Eligibility: ${s.eligibility} | Category: ${s.category} | Authority: ${s.issuingAuthority}`
    ).join('\n');

    const profileContext = citizenProfile ? JSON.stringify({
      gender: citizenProfile.gender,
      annualIncome: citizenProfile.annualIncome,
      category: citizenProfile.category,
      rationCardType: citizenProfile.rationCardType,
      district: citizenProfile.address?.district,
      landAreaInAcres: citizenProfile.landHolding?.areaInAcres
    }) : 'No authenticated citizen profile attached';

    const prompt = `You are the official AI Citizen Sahayak for Maharashtra Government's "Mahasetu" platform (Citizen Interoperability & Consent Gateway).
Your task is to analyze the citizen query, verify if it is related to Maharashtra or Central government welfare schemes, certificates, subsidies, or services, and guide them with authoritative precision.

CITIZEN QUERY: "${query}"
DETECTED PRIMARY LANGUAGE: "${detectedLang}"
CITIZEN UNIFIED PROFILE: ${profileContext}

GROUND TRUTH KNOWLEDGE BASE:
1. PLATFORM ARCHITECTURE:
   - Mahasetu connects state departments (Mahabhulekh 7/12, MahaDBT Scholarships, MahaRTO Sarathi, Tahsildar Civil Registry, MJPJAY Health, WCD Ladki Bahin).
   - Zero Physical Uploads: Verifies all documents peer-to-peer via Aadhaar biometrics and DPDP Act 2023 compliant consent artifacts.
2. TOP MATCHED SCHEMES FROM MAHASETU REPOSITORY (4,709+ SCHEMES):
${schemesContext}

CRITICAL RULES:
1. MANDATORY LANGUAGE ENFORCEMENT:
   - The citizen has selected "${detectedLang}" language.
   - You MUST write ALL user-facing text fields (greeting, serviceName, department, explanation, summary, advice, profileEligibilityNote, requiredDocuments, availableInMesh) strictly in ${detectedLang === 'Marathi' ? 'MARATHI (मराठी)' : detectedLang === 'Hindi' ? 'HINDI (हिंदी)' : 'ENGLISH'}.
   - DO NOT output English text if Marathi or Hindi is requested!
2. STRICT OUT-OF-SCOPE GUARDRAIL:
   - If the query is completely unrelated to government services, welfare schemes, certificates, farmer subsidies, scholarships, or Mahasetu (e.g. asking for weather, current time, writing code, recipes, movie reviews, sports, trivia):
     You MUST set "isOutOfScope": true, "intent": "OUT_OF_SCOPE", "serviceName": "${detectedLang === 'Marathi' ? 'विषयाशी असंबंधित विचारणा' : detectedLang === 'Hindi' ? 'विषय से बाहर का अनुरोध' : 'Request Out of Context'}", "department": "${detectedLang === 'Marathi' ? 'महासेतू नागरिक नियंत्रण' : detectedLang === 'Hindi' ? 'महासेतु नियंत्रण' : 'Mahasetu Guardrail'}", "departmentCode": "OUT_OF_SCOPE".
     In "explanation" and "advice", politely explain in ${detectedLang} that Mahasetu AI Sahayak is dedicated strictly to government services, schemes, and official certificates, and ask the user to submit an on-topic government query.
3. GREETINGS FIRST:
   - If Marathi: Greet with "नमस्कार!" or "सस्नेह नमस्कार!".
   - If English: Greet with "Hello! Welcome to Mahasetu AI Citizen Sahayak.".
   - If Hindi: Greet with "नमस्ते! महासेतु में आपका स्वागत है।".
   - If the query is only a greeting (e.g. "hi", "namaste"), set isGreeting: true and introduce key services in ${detectedLang}.
4. CITIZEN PROFILE RELEVANCE:
   - If a citizen profile is provided, evaluate whether the citizen qualifies for the relevant scheme based on their gender, income, category, land holding, or district.
   - If they qualify, set "profileEligibilityNote" in ${detectedLang} explaining why they qualify.
5. PAPERLESS & ZERO UPLOADS:
   - Explain in ${detectedLang} how Mahasetu verifies documents cross-departmentally via Aadhaar biometrics without requiring physical scans or office visits.

Return JSON adhering strictly to the schema.`;

    const response = await callGeminiWithKeyPoolAndModelFallback((ai, modelName) =>
      ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              greeting: { type: Type.STRING, description: 'Polite greeting in citizen language (e.g. नमस्कार! or Hello!)' },
              isGreeting: { type: Type.BOOLEAN, description: 'True if citizen query was a greeting' },
              isOutOfScope: { type: Type.BOOLEAN, description: 'True if query is out of context for government services' },
              intent: { type: Type.STRING },
              department: { type: Type.STRING },
              departmentCode: { type: Type.STRING },
              serviceName: { type: Type.STRING },
              serviceId: { type: Type.STRING },
              serviceCode: { type: Type.STRING },
              slaDays: { type: Type.NUMBER },
              feeInr: { type: Type.NUMBER },
              requiredDocuments: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              availableInMesh: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              nextAction: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              profileEligibilityNote: { type: Type.STRING, description: 'Analysis of citizen profile against scheme criteria' },
              explanation: { type: Type.STRING, description: 'Detailed explanation starting with greeting in citizen language' },
              summary: { type: Type.STRING, description: 'Short summary of the paperless process in the citizen language' },
              advice: { type: Type.STRING, description: 'Direct advice to citizen in the citizen language' }
            },
            required: ['greeting', 'intent', 'department', 'departmentCode', 'serviceName', 'requiredDocuments', 'nextAction', 'confidence', 'explanation']
          }
        }
      })
    );

    const parsed = JSON.parse(response.text || '{}');
    if (parsed && parsed.serviceName) {
      return {
        ...parsed,
        matchedSchemes: relevantSchemes,
        source: 'gemini'
      };
    }
    return resolveLocalNavigation(query, detectedLang, citizenProfile);
  } catch (err: any) {
    console.warn('[Mahasetu AI] Gemini Service note / failover engaged. Serving via knowledge-base engine:', err?.message || err);
    return resolveLocalNavigation(query, detectedLang, citizenProfile);
  }
}

export async function explainApplicationStatus(
  statusMessage: string,
  preferredLanguage: string = 'Marathi'
): Promise<string> {
  const isMr = preferredLanguage.toLowerCase().includes('marathi') || preferredLanguage === 'mr';
  const isHi = preferredLanguage.toLowerCase().includes('hindi') || preferredLanguage === 'hi';

  const defaultExplanation = isMr
    ? 'तुमचा अर्ज प्रगतीपथावर आहे. महासेतू आंतर-विभागीय स्तराद्वारे महसूल विभाग आणि जिल्हा प्रशासनाकडून कागदपत्रे डिजिटल पद्धतीने विना-कागदी पडताळली गेली आहेत. कोणत्याही शासकीय कार्यालयात जाण्याची गरज नाही.'
    : isHi
    ? 'आपका आवेदन प्रगति पर है। महासेतु इंटरऑपरेबिलिटी लेयर के माध्यम से राजस्व विभाग और जिला प्रशासन से दस्तावेजों का डिजिटल सत्यापन पूरा कर लिया गया है।'
    : 'Your application is progressing normally. Required cross-departmental proofs have been automatically verified via Mahasetu consent-based APIs with zero physical visits required.';

  if (!hasConfiguredGeminiKeys()) {
    return defaultExplanation;
  }

  try {
    const prompt = `You are a helpful assistant for the Maharashtra Government "Mahasetu" platform.
Explain this government application status message to the citizen in clear, compassionate, and simple ${preferredLanguage}.
Keep it under 3 sentences. Explain what happened and what, if anything, the citizen needs to do next.

Status message: "${statusMessage}"`;

    const response = await callGeminiWithKeyPoolAndModelFallback((ai, modelName) =>
      ai.models.generateContent({
        model: modelName,
        contents: prompt,
      })
    );

    return response.text?.trim() || defaultExplanation;
  } catch (err: any) {
    console.warn('[Mahasetu AI] Gemini Explain Status high-demand / fallback engaged.');
    return defaultExplanation;
  }
}

export async function generateSchemaMappingRules(
  sourceSchemaJson: string,
  canonicalSchemaJson: string
) {
  const fallbackMappings = {
    mappings: [
      {
        canonical: 'personName',
        source: 'applicantName',
        description: 'Direct string name mapping'
      },
      {
        canonical: 'documentNumber',
        source: 'cert_id',
        description: 'Maps departmental certificate registration identifier'
      },
      {
        canonical: 'verificationStatus',
        source: 'is_valid',
        transform: 'is_valid === true ? "VERIFIED" : "NOT_VERIFIED"',
        description: 'Normalizes boolean validity flag into canonical enum'
      },
      {
        canonical: 'validUntil',
        source: 'valid_until',
        description: 'Preserves expiration timestamp'
      }
    ]
  };

  if (!hasConfiguredGeminiKeys()) {
    return fallbackMappings;
  }

  try {
    const prompt = `You are a senior data integration architect for the Maharashtra Government "Mahasetu" Interoperability Platform.
Propose field mapping rules to translate the following Department-Specific Legacy JSON schema into the Mahasetu Canonical JSON schema.

Department Legacy Schema:
${sourceSchemaJson}

Mahasetu Canonical Schema:
${canonicalSchemaJson}

Rules:
- Map source fields to canonical fields.
- If transformation is required (e.g. converting boolean to status string, or parsing date formats), specify in "transform".
- Return ONLY valid JSON adhering to the schema.`;

    const response = await callGeminiWithKeyPoolAndModelFallback((ai, modelName) =>
      ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              mappings: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    canonical: { type: Type.STRING },
                    source: { type: Type.STRING },
                    transform: { type: Type.STRING },
                    description: { type: Type.STRING }
                  },
                  required: ['canonical', 'source', 'description']
                }
              }
            },
            required: ['mappings']
          }
        }
      })
    );

    return JSON.parse(response.text || '{}');
  } catch (err: any) {
    console.warn('[Mahasetu AI] Gemini Schema Mapper fallback engaged:', err?.message || err);
    return fallbackMappings;
  }
}

export interface SchemeAdvisorResult {
  greeting: string;
  advice: string;
  isOutOfScope?: boolean;
  matchedSchemes: WelfareScheme[];
  keyBenefitsSummary: string;
  eligibilityChecklist: string[];
  zeroUploadVerificationDetails: string;
  source: 'gemini' | 'local_database_index';
}

/**
 * AI-powered Scheme Advisor grounded in the 4,709+ Kaggle Government Schemes dataset
 */
export async function adviseSchemesWithAI(
  query: string,
  preferredLanguage: string = 'Marathi',
  citizenProfile?: any
): Promise<SchemeAdvisorResult> {
  const lang = detectLanguage(query, preferredLanguage);
  const isMr = lang === 'Marathi';
  const isHi = lang === 'Hindi';

  // Fast-path guardrail: strict out-of-scope check
  if (isQueryOutOfScope(query)) {
    return {
      isOutOfScope: true,
      greeting: isMr ? 'सस्नेह नमस्कार!' : isHi ? 'नमस्ते!' : 'Hello!',
      advice: isMr
        ? 'हा प्रश्न महासेतू आणि शासकीय योजनांच्या कक्षेबाहेरचा आहे. महासेतू एआय साहाय्यक केवळ महाराष्ट्र शासन व केंद्र सरकारच्या जनकल्याणकारी योजना, शेतकरी अनुदान, शिष्यवृत्ती आणि शासकीय सेवांच्या मार्गदर्शनासाठी आहे.'
        : isHi
        ? 'यह अनुरोध महासेतु और सरकारी योजनाओं के दायरे से बाहर है। महासेतु एआई सहायक केवल सरकारी कल्याणकारी योजनाओं एवं सब्सिडी की जानकारी प्रदान करता है।'
        : 'Your request is out of context for Mahasetu. The AI Scheme Advisor is dedicated strictly to Maharashtra and Central Government welfare schemes, farmer subsidies, and citizen benefits.',
      matchedSchemes: [],
      keyBenefitsSummary: isMr ? 'केवळ अधिकृत शासकीय योजनांसाठी उपलब्ध.' : 'Available only for official government schemes.',
      eligibilityChecklist: [],
      zeroUploadVerificationDetails: isMr ? 'महासेतू शून्य-कागदपत्र प्रणाली.' : 'Mahasetu Zero-Upload Engine.',
      source: 'local_database_index'
    };
  }

  const relevantSchemes = findRelevantSchemesForAI(query, 6, citizenProfile);

  const defaultGreeting = isMr
    ? 'नमस्कार! महासेतू योजना सहाय्यक मध्ये आपले स्वागत आहे.'
    : isHi
    ? 'नमस्ते! महासेतु सरकारी योजना सहायक में आपका स्वागत है।'
    : 'Hello! Welcome to Mahasetu Government Schemes AI Advisor.';

  const defaultAdvice = isMr
    ? `आपल्या विचारणेशी संबंधित ${relevantSchemes.length} शासकीय योजना सापडल्या आहेत. या योजनांसाठी लागणारे सर्व पुरावे (७/१२, उत्पन्न, जात, अधिवास) महासेतूच्या माध्यमातून शून्य कागदपत्रांसह थेट पडताळले जातील.`
    : isHi
    ? `आपकी आवश्यकता के अनुसार ${relevantSchemes.length} सरकारी योजनाएं प्राप्त हुई हैं। इनके लिए आवश्यक सभी प्रमाण पत्र महासेतु द्वारा बिना किसी कागजी अपलोड के सीधे सत्यापित किए जाएंगे।`
    : `Found ${relevantSchemes.length} relevant welfare schemes for your profile. All required proofs can be pre-verified via Mahasetu with zero physical document uploads.`;

  const fallbackResult: SchemeAdvisorResult = {
    greeting: defaultGreeting,
    advice: defaultAdvice,
    matchedSchemes: relevantSchemes,
    keyBenefitsSummary: isMr
      ? 'थेट बँक खात्यात आर्थिक सहाय्य, शिक्षण शुल्क माफी, किंवा कृषी अनुदान थेट महासेतू डीपीआय प्रणालीद्वारे उपलब्ध.'
      : 'Direct DBT cash transfer, tuition fee waivers, or agricultural subsidies verified via the Mahasetu federated network.',
    eligibilityChecklist: [
      isMr ? 'आधार बायोमेट्रिक ओळख पडताळणी (L1)' : 'Aadhaar Biometric Verification (L1 Certified)',
      isMr ? 'महाराष्ट्र रहिवासी / अधिवास दाखला' : 'Maharashtra Domicile / Residence Proof',
      isMr ? 'सक्षम प्राधिकाऱ्याचा उत्पन्न दाखला' : 'Verified Income Certificate'
    ],
    zeroUploadVerificationDetails: isMr
      ? 'महाभूलेख (७/१२), महाडीबीटी (जात/उत्पन्न) आणि सारथी (परिवहन) या विभागांचे अ‍ॅडॉप्टर्स महासेतूशी जोडलेले आहेत.'
      : 'Departmental adapters for Revenue, MahaDBT, and Sarathi transport automatically fulfill required proofs.',
    source: 'local_database_index'
  };

  if (!hasConfiguredGeminiKeys()) {
    return fallbackResult;
  }

  try {
    const schemeContext = relevantSchemes.map(s => `
ID: ${s.id}
Name: ${s.name} (${s.nameMr || ''})
Category: ${s.category}
Issuing Authority: ${s.issuingAuthority}
State: ${s.state}
Benefit: ${s.benefitSummary} (Est: ${s.benefitValue})
Eligibility: ${s.eligibility}
Income Limit: ${s.maxAnnualIncome || 'No direct limit'}
Gender: ${s.gender}
Required Documents: ${(s.requiredDocuments || []).join(', ')}
Adapters: ${(s.adapters || []).join(', ')}
Zero Upload: Yes, through Mahasetu Interoperability Engine
`).join('\n---\n');

    const prompt = `You are the official AI Government Welfare & DBT Scheme Advisor for Maharashtra Government's "Mahasetu" platform.
You have access to 4,709+ verified Indian Government & Maharashtra State welfare schemes from official datasets.

CITIZEN INQUIRY: "${query}"
CITIZEN PROFILE: ${JSON.stringify(citizenProfile || {})}
DETECTED LANGUAGE: "${lang}"

RELEVANT SCHEMES FROM DATASET:
${schemeContext}

CRITICAL INSTRUCTIONS:
1. STRICT MANDATORY LANGUAGE ENFORCEMENT:
   - The citizen has selected "${lang}" language.
   - You MUST write greeting, advice, keyBenefitsSummary, eligibilityChecklist items, and zeroUploadVerificationDetails STRICTLY IN ${isMr ? 'MARATHI (मराठी)' : isHi ? 'HINDI (हिंदी)' : 'ENGLISH'}.
   - DO NOT write English if Marathi or Hindi is chosen!
2. GREET FIRST:
   - If Marathi: Start with warm "नमस्कार!" or "सस्नेह नमस्कार!".
   - If Hindi: Start with "नमस्ते!".
   - If English: Start with "Hello and welcome to Mahasetu Scheme Advisor!".
3. EXPLAIN APPLICABLE SCHEMES & BENEFITS:
   - In ${lang}, clearly explain which schemes the citizen is eligible for and how much financial benefit/subsidy/scholarship they will receive.
4. ZERO UPLOADS / MAHASETU ADVANTAGE:
   - In ${lang}, highlight that citizens DO NOT need to visit offices or upload scan copies. Mahasetu's federated adapters (Bhulekh 7/12, MahaDBT Caste/Income, UIDAI Biometric) fetch authoritative verified proofs in seconds.

Return JSON adhering strictly to the schema.`;

    const response = await callGeminiWithKeyPoolAndModelFallback((ai, modelName) =>
      ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              greeting: { type: Type.STRING },
              advice: { type: Type.STRING, description: 'Comprehensive advice and scheme analysis in citizen language' },
              keyBenefitsSummary: { type: Type.STRING, description: 'Summary of financial and non-financial benefits' },
              eligibilityChecklist: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              zeroUploadVerificationDetails: { type: Type.STRING, description: 'Explanation of which peer adapters will verify proofs automatically' }
            },
            required: ['greeting', 'advice', 'keyBenefitsSummary', 'eligibilityChecklist', 'zeroUploadVerificationDetails']
          }
        }
      })
    );

    const parsed = JSON.parse(response.text || '{}');
    if (parsed && parsed.advice) {
      return {
        ...parsed,
        matchedSchemes: relevantSchemes,
        source: 'gemini'
      };
    }
    return fallbackResult;
  } catch (err: any) {
    console.warn('[Mahasetu AI] Gemini Scheme Advisor fallback engaged:', err?.message || err);
    return fallbackResult;
  }
}

