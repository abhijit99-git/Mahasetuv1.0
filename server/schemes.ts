/**
 * Mahasetu Schemes Engine
 * Ingests and provides fast indexed search across 4,709+ Indian Government Welfare & DBT Schemes
 * Grounded in Kaggle dataset (premsargara/indian-government-beneficiary-schemes) + Maharashtra State Flagships
 */

import fs from 'fs';
import path from 'path';
import { WelfareScheme, SchemeStats } from '../src/types.ts';

let cachedSchemes: WelfareScheme[] = [];

function loadSchemes(): WelfareScheme[] {
  if (cachedSchemes.length > 0) {
    return cachedSchemes;
  }

  try {
    const jsonPath = path.join(process.cwd(), 'server', 'data', 'schemes_dataset.json');
    if (fs.existsSync(jsonPath)) {
      const raw = fs.readFileSync(jsonPath, 'utf-8');
      cachedSchemes = JSON.parse(raw);
      console.log(`[Mahasetu Engine] Loaded ${cachedSchemes.length} schemes from Kaggle dataset`);
    } else {
      console.warn(`[Mahasetu Engine] schemes_dataset.json not found at ${jsonPath}`);
    }
  } catch (err) {
    console.error('[Mahasetu Engine] Failed to load schemes dataset:', err);
  }

  return cachedSchemes;
}

export function getAllSchemes(): WelfareScheme[] {
  return loadSchemes();
}

export function getSchemeById(id: string): WelfareScheme | undefined {
  const all = loadSchemes();
  return all.find(s => s.id === id);
}

export interface SchemeSearchQuery {
  search?: string;
  category?: string;
  state?: string;
  gender?: string;
  occupation?: string;
  onlyMaharashtra?: boolean | string;
  zeroUploadOnly?: boolean | string;
  page?: number | string;
  limit?: number | string;
}

export function searchSchemes(query: SchemeSearchQuery) {
  const all = loadSchemes();
  let results = [...all];

  const search = (query.search || '').trim().toLowerCase();
  const category = (query.category || '').trim();
  const state = (query.state || '').trim();
  const gender = (query.gender || '').trim().toLowerCase();
  const occupation = (query.occupation || '').trim().toLowerCase();
  const onlyMh = String(query.onlyMaharashtra) === 'true';
  const zeroUploadOnly = String(query.zeroUploadOnly) === 'true';

  const page = Math.max(1, parseInt(String(query.page || 1), 10));
  const limit = Math.min(100, Math.max(1, parseInt(String(query.limit || 24), 10)));

  // 1. Text Search across multiple fields
  if (search) {
    const tokens = search.split(/\s+/).filter(Boolean);
    results = results.filter(s => {
      const searchableText = `${s.name} ${s.nameMr || ''} ${s.category} ${s.issuingAuthority} ${s.benefitSummary} ${s.benefitValue} ${s.eligibility} ${s.state} ${(s.requiredDocuments || []).join(' ')} ${s.allowedOccupations || ''}`.toLowerCase();
      return tokens.every(token => searchableText.includes(token));
    });
  }

  // 2. Category Filter
  if (category && category !== 'ALL') {
    results = results.filter(s => 
      s.category.toLowerCase() === category.toLowerCase() ||
      s.rawCategory.toLowerCase() === category.toLowerCase()
    );
  }

  // 3. State Filter
  if (state && state !== 'ALL') {
    results = results.filter(s => s.state.toLowerCase() === state.toLowerCase() || (state === 'Maharashtra' && s.isMaharashtra));
  } else if (onlyMh) {
    results = results.filter(s => s.isMaharashtra);
  }

  // 4. Gender Filter
  if (gender && gender !== 'all' && gender !== 'any') {
    results = results.filter(s => (s.gender || 'any').toLowerCase() === gender || (s.gender || 'any').toLowerCase() === 'any');
  }

  // 5. Occupation Filter
  if (occupation && occupation !== 'all') {
    results = results.filter(s => {
      const occ = (s.allowedOccupations || '').toLowerCase();
      return !occ || occ === 'any' || occ.includes(occupation);
    });
  }

  // 6. Zero-upload only
  if (zeroUploadOnly) {
    results = results.filter(s => s.zeroUploadSupported);
  }

  const total = results.length;
  const startIndex = (page - 1) * limit;
  const paginated = results.slice(startIndex, startIndex + limit);

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    schemes: paginated
  };
}

export function getSchemeStats(): SchemeStats {
  const all = loadSchemes();
  const categoryCounts: Record<string, number> = {};
  let maharashtraCount = 0;
  let nationalCount = 0;

  for (const s of all) {
    categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
    if (s.isMaharashtra) maharashtraCount++;
    if (s.isNational) nationalCount++;
  }

  return {
    totalSchemes: all.length,
    maharashtraSchemes: maharashtraCount,
    nationalSchemes: nationalCount,
    categoryCounts,
    zeroUploadEnabled: all.length,
    activeAdapters: 6
  };
}

/**
 * Returns top relevant schemes to inject into Gemini context for user inquiries
 */
export function findRelevantSchemesForAI(query: string, maxResults = 8): WelfareScheme[] {
  const all = loadSchemes();
  const q = (query || '').toLowerCase();

  // Extract key concept terms
  const terms = q
    .replace(/[^\w\s\u0900-\u097F]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2);

  // Score schemes
  const scored = all.map(scheme => {
    let score = 0;
    const text = `${scheme.name} ${scheme.nameMr || ''} ${scheme.category} ${scheme.benefitSummary} ${scheme.eligibility} ${scheme.allowedOccupations || ''}`.toLowerCase();

    // High priority for Maharashtra schemes when user mentions state or Marathi terms
    if (scheme.isMaharashtra) score += 5;

    for (const t of terms) {
      if (scheme.name.toLowerCase().includes(t)) score += 15;
      if (scheme.nameMr && scheme.nameMr.includes(t)) score += 20;
      if (scheme.category.toLowerCase().includes(t)) score += 10;
      if (text.includes(t)) score += 4;
    }

    // Specific topical boosts
    if ((q.includes('ladki') || q.includes('लाडकी') || q.includes('महिला') || q.includes('woman') || q.includes('sister')) && scheme.id.includes('ladki')) {
      score += 100;
    }
    if ((q.includes('farmer') || q.includes('शेतकरी') || q.includes('kisan') || q.includes('जमीन') || q.includes('7/12') || q.includes('crop')) && (scheme.rawCategory === 'agriculture' || scheme.id.includes('kisan') || scheme.id.includes('shetkari'))) {
      score += 80;
    }
    if ((q.includes('scholarship') || q.includes('शिक्षण') || q.includes('fee') || q.includes('student') || q.includes('विद्यार्थी') || q.includes('shahu')) && (scheme.rawCategory === 'education' || scheme.id.includes('shahu'))) {
      score += 80;
    }
    if ((q.includes('pension') || q.includes('पेन्शन') || q.includes('निराधार') || q.includes('sanjay gandhi') || q.includes('shravan')) && (scheme.rawCategory === 'pension' || scheme.id.includes('sanjay-gandhi'))) {
      score += 80;
    }
    if ((q.includes('health') || q.includes('आरोग्य') || q.includes('hospital') || q.includes('mjpjay') || q.includes('ayushman') || q.includes('उपचार')) && (scheme.rawCategory === 'health' || scheme.id.includes('mjpjay'))) {
      score += 80;
    }

    return { scheme, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, maxResults).map(s => s.scheme);
}
