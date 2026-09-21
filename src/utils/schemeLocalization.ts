/**
 * Mahasetu Schemes Localization Engine
 * Provides comprehensive translation & formatting of scheme categories, names, benefits,
 * eligibility criteria, and issuing authorities into Marathi (मराठी), Hindi (हिंदी), and English.
 */

import { WelfareScheme } from '../types.ts';
import { Language } from '../locales.ts';

export interface LocalizedCategory {
  id: string;
  label: string;
}

export const CATEGORY_TRANSLATIONS: Record<string, { mr: string; hi: string; en: string }> = {
  ALL: {
    mr: 'सर्व योजना (४,७०९+)',
    hi: 'सभी योजनाएं (4,709+)',
    en: 'All Schemes (4,709+)'
  },
  'Agriculture & Farming': {
    mr: 'कृषी व शेतकरी विकास',
    hi: 'कृषि एवं किसान कल्याण',
    en: 'Agriculture & Farming'
  },
  'Education & Scholarships': {
    mr: 'शिक्षण व शिष्यवृत्ती',
    hi: 'शिक्षा एवं छात्रवृत्ति',
    en: 'Education & Scholarships'
  },
  'Women & Child Welfare': {
    mr: 'महिला व बालविकास',
    hi: 'महिला एवं बाल विकास',
    en: 'Women & Child Welfare'
  },
  'Social Welfare & Pensions': {
    mr: 'सामाजिक न्याय व निवृत्तीवेतन',
    hi: 'सामाजिक न्याय एवं पेंशन',
    en: 'Social Welfare & Pensions'
  },
  'Healthcare & Medical': {
    mr: 'सार्वजनिक आरोग्य व वैद्यकीय मदत',
    hi: 'स्वास्थ्य एवं चिकित्सा सहायता',
    en: 'Healthcare & Medical'
  },
  'Employment & Skills': {
    mr: 'रोजगार व कौशल्य विकास',
    hi: 'रोजगार एवं कौशल विकास',
    en: 'Employment & Skills'
  },
  'Housing & Urban Development': {
    mr: 'गृहनिर्माण व नागरी विकास',
    hi: 'आवास एवं शहरी विकास',
    en: 'Housing & Urban Development'
  },
  'Banking & Financial Inclusion': {
    mr: 'बँकिंग व आर्थिक समावेशन',
    hi: 'बैंकिंग एवं वित्तीय समावेशन',
    en: 'Banking & Financial Inclusion'
  },
  'Divyangjan & Disability Support': {
    mr: 'दिव्यांगजन सहाय्य व सबलीकरण',
    hi: 'दिव्यांगजन सहायता एवं सशक्तिकरण',
    en: 'Divyangjan & Disability Support'
  }
};

export const SCHEME_SPECIFIC_LOCALIZATION: Record<
  string,
  {
    nameMr?: string;
    nameHi?: string;
    benefitMr?: string;
    benefitHi?: string;
    benefitValueMr?: string;
    benefitValueHi?: string;
    eligibilityMr?: string;
    eligibilityHi?: string;
    authorityMr?: string;
    authorityHi?: string;
  }
> = {
  'ladki-bahin-mh-2024': {
    nameMr: 'मुख्यमंत्री माझी लाडकी बहीण योजना (महाराष्ट्र)',
    nameHi: 'मुख्यमंत्री माझी लाड़की बहिन योजना (महाराष्ट्र)',
    benefitMr: 'पात्र महिलांच्या आधार जोडणी असलेल्या बँक खात्यात दरमहा ₹१,५०० थेट डीबीटी द्वारे जमा.',
    benefitHi: 'पात्र महिलाओं के आधार लिंक बैंक खाते में प्रतिमाह ₹1,500 का सीधा डीबीटी अंतरण।',
    benefitValueMr: '₹१,५०० / दरमहा (वार्षिक ₹१८,०००)',
    benefitValueHi: '₹1,500 / प्रतिमाह (वार्षिक ₹18,000)',
    eligibilityMr: '२१ ते ६५ वयोगटातील महाराष्ट्र रहिवासी महिला, ज्यांचे कौटुंबिक वार्षिक उत्पन्न ₹२.५० लाखांपेक्षा कमी आहे.',
    eligibilityHi: '21 से 65 वर्ष आयु वर्ग की महाराष्ट्र निवासी महिलाएं, जिनकी पारिवारिक वार्षिक आय ₹2.5 लाख से कम हो।',
    authorityMr: 'महिला व बालविकास विभाग, महाराष्ट्र शासन',
    authorityHi: 'महिला एवं बाल विकास विभाग, महाराष्ट्र शासन'
  },
  'namo-shetkari-mh-2023': {
    nameMr: 'नमो शेतकरी महासन्मान निधी योजना (महाराष्ट्र)',
    nameHi: 'नमो शेतकरी महासम्मान निधि योजना (महाराष्ट्र)',
    benefitMr: 'पीएम किसान योजनेच्या ₹६,००० शिवाय राज्य शासनाकडून अतिरिक्त ₹६,००० दरवर्षी थेट बँक खात्यात (एकूण ₹१२,००० वार्षिक).',
    benefitHi: 'पीएम किसान के ₹6,000 के अतिरिक्त राज्य सरकार द्वारा ₹6,000 प्रतिवर्ष (कुल ₹12,000 वार्षिक)।',
    benefitValueMr: '₹६,००० / वर्ष (पीएम किसान सह एकूण ₹१२,०००)',
    benefitValueHi: '₹6,000 / वर्ष (पीएम किसान सहित कुल ₹12,000)',
    eligibilityMr: 'महाराष्ट्रातील भूमी अभिलेख (७/१२ उतारा) नोंदणीकृत पात्र अल्प व अत्यल्प भूधारक शेतकरी.',
    eligibilityHi: 'महाराष्ट्र के 7/12 भूमि रिकॉर्ड में पंजीकृत पात्र छोटे व सीमांत किसान।',
    authorityMr: 'कृषी विभाग, महाराष्ट्र शासन',
    authorityHi: 'कृषि विभाग, महाराष्ट्र शासन'
  },
  'mahadbt-shahu-maharaj-scholarship': {
    nameMr: 'राजर्षी छत्रपती शाहू महाराज शिक्षण शुल्क शिष्यवृत्ती (महाडीबीटी)',
    nameHi: 'राजर्षि छत्रपति शाहू महाराज शिक्षण शुल्क छात्रवृत्ति (महाडीबीटी)',
    benefitMr: 'व्यावसायिक व उच्च शिक्षण अभ्यासक्रमांसाठी (इंजिनीअरिंग, मेडिकल, फार्मसी) ५०% ते १००% शिक्षण शुल्क व परीक्षा शुल्क प्रतिपूर्ती.',
    benefitHi: 'व्यावसायिक पाठ्यक्रमों (इंजीनियरिंग, मेडिकल, फार्मेसी) हेतु 50% से 100% शिक्षण शुल्क प्रतिपूर्ति।',
    benefitValueMr: '५०% ते १००% शिक्षण व परीक्षा शुल्क प्रतिपूर्ती',
    benefitValueHi: '50% से 100% शिक्षण एवं परीक्षा शुल्क प्रतिपूर्ति',
    eligibilityMr: 'महाराष्ट्र अधिवास असलेले आर्थिकदृष्ट्या मागास (EBC/SEBC) व खुल्या प्रवर्गातील विद्यार्थी, कौटुंबिक उत्पन्न ₹८ लाखांच्या आत.',
    eligibilityHi: 'महाराष्ट्र के आर्थिक रूप से कमजोर (EBC) व सामान्य वर्ग के छात्र, पारिवारिक आय ₹8 लाख तक।',
    authorityMr: 'उच्च व तंत्र शिक्षण विभाग (महाडीबीटी)',
    authorityHi: 'उच्च एवं तकनीकी शिक्षा विभाग (महाडीबीटी)'
  },
  'sanjay-gandhi-niradhar-mh': {
    nameMr: 'संजय गांधी निराधार अनुदान योजना (महाराष्ट्र)',
    nameHi: 'संजय गांधी निराधार अनुदान योजना (महाराष्ट्र)',
    benefitMr: 'निराधार वृद्ध, दिव्यांग, विधवा, अनाथ व दुर्धर आजाराने ग्रस्त व्यक्तींना दरमहा ₹१,५०० आर्थिक सहाय्य.',
    benefitHi: 'निराधार वृद्ध, दिव्यांग, विधवा एवं बेसहारा नागरिकों को प्रतिमाह ₹1,500 की वित्तीय सहायता।',
    benefitValueMr: '₹१,५०० / दरमहा',
    benefitValueHi: '₹1,500 / प्रतिमाह',
    eligibilityMr: '६५ वर्षांखालील निराधार, दिव्यांग (४०%+), विधवा, किंवा निराधार व्यक्ती, ज्यांचे वार्षिक उत्पन्न ₹५०,००० च्या आत आहे.',
    eligibilityHi: '65 वर्ष से कम आयु के निराधार, 40%+ दिव्यांग, विधवा जिनकी वार्षिक आय ₹50,000 तक हो।',
    authorityMr: 'सामाजिक न्याय व विशेष सहाय्य विभाग, महाराष्ट्र शासन',
    authorityHi: 'सामाजिक न्याय एवं विशेष सहायता विभाग, महाराष्ट्र शासन'
  },
  'mjpjay-health-insurance-mh': {
    nameMr: 'महात्मा ज्योतिराव फुले जन आरोग्य योजना (MJPJAY)',
    nameHi: 'महात्मा ज्योतिराव फुले जन आरोग्य योजना (MJPJAY)',
    benefitMr: 'संपूर्ण कुटुंबासाठी राज्यातील अंगीकृत रुग्णालयांमध्ये दरवर्षी ₹५,००,००० पर्यंत कॅशलेस मोफत वैद्यकीय उपचार व शस्त्रक्रिया.',
    benefitHi: 'पूरे परिवार के लिए सूचीबद्ध अस्पतालों में ₹5,00,000 प्रतिवर्ष तक कैशलेस मुफ्त चिकित्सा उपचार।',
    benefitValueMr: '₹५,००,००० पर्यंत मोफत उपचार (कॅशलेस)',
    benefitValueHi: '₹5,00,000 तक मुफ्त उपचार (कैशलेस)',
    eligibilityMr: 'महाराष्ट्रातील सर्व शिधापत्रिकाधारक (पिवळे, केशरी, पांढरे) कुटुंब व शेतकरी.',
    eligibilityHi: 'महाराष्ट्र के सभी राशन कार्ड धारक (पीला, केसरी, सफेद) परिवार एवं किसान।',
    authorityMr: 'सार्वजनिक आरोग्य विभाग, महाराष्ट्र शासन',
    authorityHi: 'सार्वजनिक स्वास्थ्य विभाग, महाराष्ट्र शासन'
  },
  'shravanbal-seva-pension-mh': {
    nameMr: 'श्रावणबाळ सेवा राज्य निवृत्तीवेतन योजना',
    nameHi: 'श्रावणबाल सेवा राज्य पेंशन योजना',
    benefitMr: '६५ वर्षे व त्यावरील ज्येष्ठ नागरिकांना दरमहा ₹१,५०० निवृत्तीवेतन थेट आधार संलग्न बँक खात्यात.',
    benefitHi: '65 वर्ष या अधिक आयु के वरिष्ठ नागरिकों को प्रतिमाह ₹1,500 की वृद्धावस्था पेंशन।',
    benefitValueMr: '₹१,५०० / दरमहा',
    benefitValueHi: '₹1,500 / प्रतिमाह',
    eligibilityMr: 'महाराष्ट्र रहिवासी ६५ वर्षे व त्यावरील ज्येष्ठ नागरिक, दारिद्र्यरेषेखालील (BPL) किंवा कौटुंबिक वार्षिक उत्पन्न ₹२१,००० च्या आत.',
    eligibilityHi: 'महाराष्ट्र निवासी 65 वर्ष व अधिक के वरिष्ठ नागरिक, बीपीएल या पारिवारिक आय ₹21,000 तक।',
    authorityMr: 'सामाजिक न्याय विभाग, महाराष्ट्र शासन',
    authorityHi: 'सामाजिक न्याय विभाग, महाराष्ट्र शासन'
  },
  'pm-kisan-samman-nidhi': {
    nameMr: 'प्रधानमंत्री किसान सन्मान निधी (PM-KISAN)',
    nameHi: 'प्रधानमंत्री किसान सम्मान निधि (PM-KISAN)',
    benefitMr: 'देशातील सर्व पात्र शेतकरी कुटुंबांना दरवर्षी ₹६,००० (₹२,००० च्या ३ समान हप्त्यांमध्ये) थेट बँक खात्यात.',
    benefitHi: 'देश के सभी पात्र किसान परिवारों को ₹6,000 प्रतिवर्ष (₹2,000 की 3 किस्तों में) प्रत्यक्ष अंतरण।',
    benefitValueMr: '₹६,००० / वर्ष (३ हप्त्यांमध्ये)',
    benefitValueHi: '₹6,000 / वर्ष (3 किश्तों में)',
    eligibilityMr: 'स्वतःच्या नावावर लागवडीयोग्य शेतजमीन असलेले सर्व शेतकरी कुटुंब.',
    eligibilityHi: 'अपने नाम पर खेती योग्य भूमि रखने वाले सभी किसान परिवार।',
    authorityMr: 'कृषी व शेतकरी कल्याण मंत्रालय, भारत सरकार',
    authorityHi: 'कृषि एवं किसान कल्याण मंत्रालय, भारत सरकार'
  },
  'pmay-urban-housing': {
    nameMr: 'प्रधानमंत्री आवास योजना (शहरी व ग्रामीण)',
    nameHi: 'प्रधानमंत्री आवास योजना (शहरी एवं ग्रामीण)',
    benefitMr: 'पक्के घर बांधण्यासाठी किंवा खरेदीसाठी ₹२,५०,००० पर्यंत व्याज अनुदान / थेट आर्थिक सहाय्य.',
    benefitHi: 'पक्का मकान निर्माण अथवा क्रय हेतु ₹2,50,000 तक की ब्याज सब्सिडी अथवा प्रत्यक्ष अनुदान।',
    benefitValueMr: '₹२,५०,००० पर्यंत गृहनिर्माण अनुदान',
    benefitValueHi: '₹2,50,000 तक आवास अनुदान',
    eligibilityMr: 'भारतात स्वतःचे पक्के घर नसलेले EWS/LIG/MIG प्रवर्गातील कुटुंब.',
    eligibilityHi: 'देश में पक्का मकान न रखने वाले EWS/LIG/MIG श्रेणी के परिवार।',
    authorityMr: 'गृहनिर्माण व नागरी व्यवहार मंत्रालय, भारत सरकार',
    authorityHi: 'आवासन एवं शहरी कार्य मंत्रालय, भारत सरकार'
  },
  'pm-svanidhi-street-vendor': {
    nameMr: 'पीएम स्वनिधी - पथविक्रेता आत्मनिर्भर निधी',
    nameHi: 'पीएम स्वनिधि - स्ट्रीट वेंडर्स आत्मनिर्भर निधि',
    benefitMr: 'फेरीवाले व पथविक्रेत्यांना ₹१०,००० ते ₹५०,००० पर्यंत विनातारण खेळते भांडवल कर्ज व वेळेत परतफेडीवर ७% व्याज अनुदान.',
    benefitHi: 'स्ट्रीट वेंडर्स को ₹10,000 से ₹50,000 तक का बिना गारंटी कार्यशील पूंजी ऋण व 7% ब्याज सब्सिडी।',
    benefitValueMr: '₹१०,००० ते ₹५०,००० पर्यंत विनातारण कर्ज',
    benefitValueHi: '₹10,000 से ₹50,000 तक बिना गारंटी ऋण',
    eligibilityMr: 'शहरी भागातील नोंदणीकृत पथविक्रेते व छोटे फेरीवाले.',
    eligibilityHi: 'शहरी क्षेत्रों के पंजीकृत पथ विक्रेता एवं छोटे व्यापारी।',
    authorityMr: 'गृहनिर्माण व नागरी व्यवहार मंत्रालय / एमएसएमई',
    authorityHi: 'आवासन एवं शहरी कार्य मंत्रालय / एमएसएमई'
  },
  'sukanya-samriddhi-yojana': {
    nameMr: 'सुकन्या समृद्धी योजना (मुलींचे भविष्य सुरक्षा)',
    nameHi: 'सुकन्या समृद्धि योजना (बालिका भविष्य सुरक्षा)',
    benefitMr: 'मुलींच्या उच्च शिक्षण व विवाहासाठी ८.२% आकर्षक चक्रवाढ व्याजदर आणि प्राप्तिकरात कलम 80C अंतर्गत पूर्ण करमुक्ती.',
    benefitHi: 'बालिकाओं की उच्च शिक्षा व विवाह हेतु 8.2% आकर्षक ब्याज दर व धारा 80C के तहत पूर्ण कर छूट।',
    benefitValueMr: '८.२% चक्रवाढ व्याज + करमुक्ती',
    benefitValueHi: '8.2% चक्रवृद्धि ब्याज + कर छूट',
    eligibilityMr: '१० वर्षांखालील मुलींच्या नावे पालक खाते उघडू शकतात.',
    eligibilityHi: '10 वर्ष से कम आयु की बालिकाओं के नाम पर अभिभावक खाता खोल सकते हैं।',
    authorityMr: 'टपाल विभाग / वित्त मंत्रालय, भारत सरकार',
    authorityHi: 'डाक विभाग / वित्त मंत्रालय, भारत सरकार'
  },
  'ayushman-bharat-pmjay': {
    nameMr: 'आयुष्मान भारत - प्रधानमंत्री जन आरोग्य योजना (PM-JAY)',
    nameHi: 'आयुष्मान भारत - प्रधानमंत्री जन आरोग्य योजना (PM-JAY)',
    benefitMr: 'गरीब व गरजू कुटुंबांना दरवर्षी ₹५,००,००० पर्यंत मोफत द्वितीयक व तृतीयक रुग्णालयीन उपचार (कॅशलेस).',
    benefitHi: 'गरीब व पात्र परिवारों को ₹5,00,000 प्रतिवर्ष तक मुफ्त अस्पताल उपचार (कैशलेस)।',
    benefitValueMr: '₹५,००,००० / वर्ष (मोफत उपचार)',
    benefitValueHi: '₹5,00,000 / वर्ष (मुफ्त उपचार)',
    eligibilityMr: 'SECC 2011 यादीतील पात्र वंचित व दुर्बल कुटुंब.',
    eligibilityHi: 'सामाजिक-आर्थिक जाति जनगणना 2011 में चिन्हित पात्र परिवार।',
    authorityMr: 'राष्ट्रीय आरोग्य प्राधिकरण (NHA), भारत सरकार',
    authorityHi: 'राष्ट्रीय स्वास्थ्य प्राधिकरण (NHA), भारत सरकार'
  }
};

/**
 * Returns a fully localized representation of a WelfareScheme object according to the active language
 */
export function getLocalizedScheme(scheme: WelfareScheme, lang: Language): WelfareScheme {
  const isMr = lang === 'mr';
  const isHi = lang === 'hi';

  if (!isMr && !isHi) {
    // English defaults
    return scheme;
  }

  const specific = SCHEME_SPECIFIC_LOCALIZATION[scheme.id] || {};
  const catTrans = CATEGORY_TRANSLATIONS[scheme.category];

  const localizedCategory = catTrans
    ? (isMr ? catTrans.mr : catTrans.hi)
    : scheme.category;

  // Localized Name
  let localizedName = scheme.name;
  if (isMr) {
    localizedName = specific.nameMr || scheme.nameMr || scheme.name;
  } else if (isHi) {
    localizedName = specific.nameHi || scheme.nameHi || scheme.nameMr || scheme.name;
  }

  // Localized Benefit Summary
  let localizedBenefit = scheme.benefitSummary;
  if (isMr) {
    localizedBenefit = specific.benefitMr || scheme.benefitSummaryMr || scheme.benefitSummary;
  } else if (isHi) {
    localizedBenefit = specific.benefitHi || scheme.benefitSummaryHi || scheme.benefitSummary;
  }

  // Localized Benefit Value
  let localizedValue = scheme.benefitValue;
  if (isMr) {
    localizedValue = specific.benefitValueMr || scheme.benefitValueMr || scheme.benefitValue;
  } else if (isHi) {
    localizedValue = specific.benefitValueHi || scheme.benefitValueHi || scheme.benefitValue;
  }

  // Localized Eligibility
  let localizedEligibility = scheme.eligibility;
  if (isMr) {
    localizedEligibility = specific.eligibilityMr || scheme.eligibilityMr || scheme.eligibility;
  } else if (isHi) {
    localizedEligibility = specific.eligibilityHi || scheme.eligibilityHi || scheme.eligibility;
  }

  // Localized Authority
  let localizedAuthority = scheme.issuingAuthority;
  if (isMr) {
    localizedAuthority = specific.authorityMr || scheme.issuingAuthorityMr || (scheme.isMaharashtra ? 'महाराष्ट्र शासन' : scheme.issuingAuthority);
  } else if (isHi) {
    localizedAuthority = specific.authorityHi || scheme.issuingAuthorityHi || (scheme.isMaharashtra ? 'महाराष्ट्र शासन' : scheme.issuingAuthority);
  }

  // Localized State
  let localizedState = scheme.state;
  if (scheme.isMaharashtra) {
    localizedState = isMr ? 'महाराष्ट्र' : 'महाराष्ट्र';
  } else if (scheme.isNational) {
    localizedState = isMr ? 'भारत सरकार / राष्ट्रीय' : 'भारत सरकार / राष्ट्रीय';
  }

  return {
    ...scheme,
    name: localizedName,
    nameMr: isMr ? (specific.nameMr || scheme.nameMr) : scheme.nameMr,
    nameHi: isHi ? (specific.nameHi || scheme.nameHi) : scheme.nameHi,
    category: localizedCategory,
    benefitSummary: localizedBenefit,
    benefitValue: localizedValue,
    eligibility: localizedEligibility,
    issuingAuthority: localizedAuthority,
    state: localizedState
  };
}

export const CATALOGUE_STRINGS = {
  mr: {
    heroBadge: '४,७०९+ सत्यापित शासकीय कल्याणकारी योजना • महाराष्ट्र फ्लॅगशिप्स',
    heroTitle: 'शासकीय कल्याणकारी योजना निर्देशिका',
    heroSubtitle: 'सर्व भारतीय व महाराष्ट्र राज्य थेट लाभ हस्तांतरण (DBT) योजना संच',
    heroDesc: 'महाराष्ट्र शासन व केंद्र सरकारच्या ४,७०९+ सत्यापित जनकल्याणकारी योजना शोधा. महासेतूच्या शून्य-अपलोड डिजिटल प्रणालीद्वारे थेट कागदपत्रांशिवाय पडताळणी व त्वरित अर्ज करा.',
    totalSchemes: 'एकूण योजना',
    totalSchemesSub: '१००% शासकीय सत्यापित',
    mhSchemes: 'महाराष्ट्र राज्य',
    mhSchemesSub: 'फ्लॅगशिप्स व राज्य DBT',
    centralSchemes: 'केंद्रीय / राष्ट्रीय',
    centralSchemesSub: 'अखिल भारतीय व्याप्ती',
    zeroUploadMesh: 'शून्य-अपलोड प्रणाली',
    zeroUploadMeshSub: '६ आंतर-विभागीय अ‍ॅडॉप्टर्स',
    aiAdvisorTitle: 'AI योजना सल्लागार (AI Scheme Advisor)',
    aiAdvisorBadge: 'जेमिनी व शासकीय योजना संच आधारित',
    aiAdvisorPlaceholder: 'उदा. मी शेतकरी आहे आणि माझ्याकडे २ एकर जमीन आहे, मला कोणत्या योजनांचा लाभ मिळेल?',
    aiAdvisorBtn: 'AI सहाय्यकास विचारा',
    aiAdvisorAnalyzing: '४,७०९ योजनांचे विश्लेषण सुरू आहे...',
    aiBenefitsSummary: 'प्रमुख योजना लाभ:',
    aiEligibilityChecklist: 'पात्रता निकष (Eligibility Checklist):',
    aiRecommendedSchemes: 'शिफारस केलेल्या योजना (Recommended Matching Schemes):',
    detailsBtn: 'तपशील (Details)',
    applyBtn: 'अर्ज करा (Apply)',
    searchPlaceholder: 'योजना, विभाग, लाभ किंवा कीवर्ड शोधा (नाव, विभाग, श्रेणी, लाभानुसार ४,७०९+ योजना शोधा)...',
    mhOnlyFilter: 'केवळ महाराष्ट्र योजना',
    filtersBtn: 'गाळणी (Filters)',
    genderFilterLabel: 'लिंग मर्यादा (Gender Restriction)',
    genderAll: 'सर्व लिंग (All Genders)',
    genderFemale: 'केवळ महिला (Women / Female Only)',
    genderMale: 'केवळ पुरुष (Male Only)',
    occupationFilterLabel: 'व्यवसाय / लाभार्थी गट (Occupation)',
    occupationAll: 'सर्व व्यवसाय (All Occupations)',
    occupationFarmer: 'शेतकरी / कृषी (Farmers)',
    occupationStudent: 'विद्यार्थी व संशोधक (Students)',
    occupationEntrepreneur: 'उद्योजक / सूक्ष्म-लघु उद्योग (MSME)',
    occupationUnemployed: 'बेरोजगार / निराधार (Unemployed / Destitute)',
    resetFilters: 'सर्व गाळणी पूर्ववत करा',
    showingText: 'दर्शवत आहे',
    ofText: 'पैकी',
    schemesText: 'योजना',
    pageText: 'पृष्ठ',
    mhPriorityTag: '(महाराष्ट्र प्राधान्य)',
    loadingDatabase: 'शासकीय कल्याणकारी योजना डेटाबेस लोड होत आहे...',
    noSchemesFound: 'कोणतीही योजना सापडली नाही',
    noSchemesDesc: 'कृपया आपले शोध शब्द बदला, श्रेणी निवडा किंवा संपूर्ण ४,७०९+ राष्ट्रीय योजना पाहण्यासाठी महाराष्ट्र मर्यादा काढा.',
    clearFilters: 'गाळणी हटवा',
    mhStateBadge: 'महाराष्ट्र राज्य',
    estimatedBenefit: 'अपेक्षित थेट लाभ:',
    zeroUploadAdapters: 'महासेतू शून्य-अपलोड अ‍ॅडॉप्टर्स:',
    viewDetails: 'तपशील पहा',
    apply: 'अर्ज करा',
    mhFlagship: 'महाराष्ट्र फ्लॅगशिप',
    centralDbt: 'केंद्रीय DBT',
    directBenefitValue: 'थेट योजना लाभ:',
    eligibilityRules: 'पात्रता निकष व नियम:',
    incomeLimit: 'उत्पन्न मर्यादा:',
    minAge: 'किमान वय:',
    years: 'वर्षे',
    gender: 'लिंग:',
    zeroUploadFlowTitle: 'महासेतू आंतर-विभागीय देवाणघेवाण (शून्य कागदपत्रे):',
    zeroUploadFlowDesc: 'महासेतूद्वारे अर्ज करताना, आमचे सार्वभौम अ‍ॅडॉप्टर्स अधिकृत शासकीय नोंदवहीतून आपले पुरावे स्वयंचलितपणे आणून पडताळतात:',
    openOfficialPortal: 'अधिकृत संकेतस्थळ उघडा',
    close: 'बंद करा',
    applyViaMahasetu: 'महासेतू द्वारे अर्ज करा',
    zeroUploadsBadge: 'शून्य कागदपत्रे',
    oneClickTag: 'शून्य कागदपत्रे • १-क्लिक पडताळणी',
    point1: '७/१२ जमीन, उत्पन्न व जात प्रमाणपत्रे थेट नोंदवहीतून सत्यापित',
    point2: 'कागदपत्र स्कॅन करणे किंवा प्रमाणपत्र अपलोड करण्याची गरज नाही',
    point3: 'अपरिवर्तनीय डिजिटल लेजरद्वारे नागरिक संमती प्रमाणित',
    continueViaMahasetu: 'महासेतू द्वारे पुढे जा (शून्य कागदपत्रे)',
    goToOfficialPortal: 'शासकीय अधिकृत संकेतस्थळावर जा',
    externalBadge: 'बाह्य संकेतस्थळ',
    officialPortalDesc: 'शासकीय अधिकृत संकेतस्थळावर अर्ज करा',
    destination: 'संकेतस्थळ:',
    externalNote: '* टीप: यासाठी मॅन्युअल खाते नोंदणी व स्कॅन केलेल्या PDF कागदपत्रांची आवश्यकता असते.',
    openOfficialPortalBtn: 'अधिकृत संकेतस्थळ उघडा (External)',
    footerGovtTag: 'महाराष्ट्र शासन डिजिटल महासेतू',
    cancel: 'रद्द करा / मागे जा'
  },
  hi: {
    heroBadge: '4,709+ सत्यापित सरकारी कल्याणकारी योजनाएं • महाराष्ट्र फ्लैगशिप्स',
    heroTitle: 'सरकारी कल्याणकारी योजना निर्देशिका',
    heroSubtitle: 'सभी भारतीय एवं महाराष्ट्र राज्य प्रत्यक्ष लाभ अंतरण (DBT) योजना भंडार',
    heroDesc: 'महाराष्ट्र सरकार एवं केंद्र सरकार की 4,709+ सत्यापित जनकल्याणकारी योजनाएं खोजें। महासेतु की शून्य-अपलोड डिजिटल प्रणाली द्वारा बिना कागजी कार्रवाई सीधा सत्यापन व त्वरित आवेदन करें।',
    totalSchemes: 'कुल योजनाएं',
    totalSchemesSub: '100% सरकारी सत्यापित',
    mhSchemes: 'महाराष्ट्र राज्य',
    mhSchemesSub: 'फ्लैगशिप्स एवं राज्य DBT',
    centralSchemes: 'केंद्रीय / राष्ट्रीय',
    centralSchemesSub: 'अखिल भारतीय कवरेज',
    zeroUploadMesh: 'शून्य-अपलोड प्रणाली',
    zeroUploadMeshSub: '6 अंतर-विभागीय एडॉप्टर्स',
    aiAdvisorTitle: 'AI योजना सलाहकार (AI Scheme Advisor)',
    aiAdvisorBadge: 'जेमिनी एवं सरकारी योजना डेटाबेस आधारित',
    aiAdvisorPlaceholder: 'उदा. मैं किसान हूँ और मेरे पास 2 एकड़ जमीन है, मुझे कौन-सी योजनाओं का लाभ मिलेगा?',
    aiAdvisorBtn: 'AI सहायक से पूछें',
    aiAdvisorAnalyzing: '4,709 योजनाओं का विश्लेषण जारी है...',
    aiBenefitsSummary: 'प्रमुख योजना लाभ:',
    aiEligibilityChecklist: 'पात्रता मानदंड (Eligibility Checklist):',
    aiRecommendedSchemes: 'अनुशंसित योजनाएं (Recommended Matching Schemes):',
    detailsBtn: 'विवरण (Details)',
    applyBtn: 'आवेदन करें (Apply)',
    searchPlaceholder: 'योजना, विभाग, लाभ अथवा कीवर्ड खोजें (4,709+ योजनाएं उपलब्ध)...',
    mhOnlyFilter: 'केवल महाराष्ट्र योजनाएं',
    filtersBtn: 'फ़िल्टर (Filters)',
    genderFilterLabel: 'लिंग सीमा (Gender Restriction)',
    genderAll: 'सभी लिंग (All Genders)',
    genderFemale: 'केवल महिलाएं (Women / Female Only)',
    genderMale: 'केवल पुरुष (Male Only)',
    occupationFilterLabel: 'व्यवसाय / लाभार्थी वर्ग (Occupation)',
    occupationAll: 'सभी व्यवसाय (All Occupations)',
    occupationFarmer: 'किसान / कृषि (Farmers)',
    occupationStudent: 'विद्यार्थी एवं शोधार्थी (Students)',
    occupationEntrepreneur: 'उद्यमी / सूक्ष्म-लघु उद्योग (MSME)',
    occupationUnemployed: 'बेरोजगार / निराधार (Unemployed / Destitute)',
    resetFilters: 'सभी फ़िल्टर रीसेट करें',
    showingText: 'प्रदर्शित',
    ofText: 'में से',
    schemesText: 'योजनाएं',
    pageText: 'पृष्ठ',
    mhPriorityTag: '(महाराष्ट्र प्राथमिकता)',
    loadingDatabase: 'सरकारी कल्याणकारी योजना डेटाबेस लोड हो रहा है...',
    noSchemesFound: 'कोई योजना नहीं मिली',
    noSchemesDesc: 'कृपया अपने खोज शब्द बदलें, श्रेणी चुनें अथवा पूरे 4,709+ राष्ट्रीय योजनाओं को देखने के लिए महाराष्ट्र प्रतिबंध हटाएं।',
    clearFilters: 'फ़िल्टर हटाएं',
    mhStateBadge: 'महाराष्ट्र राज्य',
    estimatedBenefit: 'अनुमानित प्रत्यक्ष लाभ:',
    zeroUploadAdapters: 'महासेतु शून्य-अपलोड एडॉप्टर्स:',
    viewDetails: 'विवरण देखें',
    apply: 'आवेदन करें',
    mhFlagship: 'महाराष्ट्र फ्लैगशिप',
    centralDbt: 'केंद्रीय DBT',
    directBenefitValue: 'प्रत्यक्ष योजना लाभ:',
    eligibilityRules: 'पात्रता नियम व शर्तें:',
    incomeLimit: 'आय सीमा:',
    minAge: 'न्यूनतम आयु:',
    years: 'वर्ष',
    gender: 'लिंग:',
    zeroUploadFlowTitle: 'महासेतु अंतर-विभागीय इंटरऑपरेबिलिटी (शून्य कागजी कार्रवाई):',
    zeroUploadFlowDesc: 'महासेतु द्वारा आवेदन करने पर, हमारे एडॉप्टर्स आधिकारिक सरकारी रजिस्ट्री से आपके प्रमाण पत्र स्वतः प्राप्त कर सत्यापित करते हैं:',
    openOfficialPortal: 'आधिकारिक पोर्टल खोलें',
    close: 'बंद करें',
    applyViaMahasetu: 'महासेतु द्वारा आवेदन करें',
    zeroUploadsBadge: 'शून्य कागजी कार्रवाई',
    oneClickTag: 'शून्य कागजी कार्रवाई • 1-क्लिक सत्यापन',
    point1: '7/12 भूमि रिकॉर्ड, आय एवं जाति प्रमाण पत्र सीधे रजिस्ट्री से सत्यापित',
    point2: 'दस्तावेज स्कैन करने या प्रमाण पत्र अपलोड करने की आवश्यकता नहीं',
    point3: 'अपरिवर्तनीय डिजिटल लेजर द्वारा नागरिक सहमति प्रमाणित',
    continueViaMahasetu: 'महासेतु द्वारा आगे बढ़ें (शून्य कागजी कार्रवाई)',
    goToOfficialPortal: 'सरकारी आधिकारिक पोर्टल पर जाएं',
    externalBadge: 'बाहरी पोर्टल',
    officialPortalDesc: 'सरकारी आधिकारिक पोर्टल पर आवेदन करें',
    destination: 'पोर्टल:',
    externalNote: '* नोट: इसके लिए मैन्युअल खाता पंजीकरण और स्कैन किए गए PDF दस्तावेजों की आवश्यकता होती है।',
    openOfficialPortalBtn: 'आधिकारिक पोर्टल खोलें (External)',
    footerGovtTag: 'महाराष्ट्र शासन डिजिटल महासेतु',
    cancel: 'रद्द करें / वापस जाएं'
  },
  en: {
    heroBadge: '4,709+ Verified Government Welfare Schemes • Maharashtra Flagships',
    heroTitle: 'Government Welfare Schemes Directory',
    heroSubtitle: 'All Indian Government & Maharashtra State DBT Schemes Repository',
    heroDesc: 'Explore 4,709+ verified state and national welfare schemes. Pre-verify eligibility through Mahasetu zero-upload digital infrastructure and apply with zero paperwork.',
    totalSchemes: 'Total Schemes',
    totalSchemesSub: '100% Govt Verified',
    mhSchemes: 'Maharashtra State',
    mhSchemesSub: 'Flagships & State DBT',
    centralSchemes: 'Central / National',
    centralSchemesSub: 'All India Coverage',
    zeroUploadMesh: 'Zero-Upload Mesh',
    zeroUploadMeshSub: '6 Peer Adapters',
    aiAdvisorTitle: 'AI Scheme Advisor',
    aiAdvisorBadge: 'Powered by Gemini & Kaggle Schemes',
    aiAdvisorPlaceholder: 'E.g., I am a farmer with 2 acres of land in Maharashtra, which schemes can I apply for?',
    aiAdvisorBtn: 'Ask AI Sahayak',
    aiAdvisorAnalyzing: 'Analyzing 4,709 Schemes...',
    aiBenefitsSummary: 'Key Scheme Benefits:',
    aiEligibilityChecklist: 'Eligibility Checklist:',
    aiRecommendedSchemes: 'Recommended Matching Schemes:',
    detailsBtn: 'Details',
    applyBtn: 'Apply',
    searchPlaceholder: 'Search 4,709+ schemes by name, department, category, benefit...',
    mhOnlyFilter: 'Maharashtra Only Schemes',
    filtersBtn: 'Filters',
    genderFilterLabel: 'Gender Restriction',
    genderAll: 'All Genders',
    genderFemale: 'Women / Female Only',
    genderMale: 'Male Only',
    occupationFilterLabel: 'Occupation / Target Group',
    occupationAll: 'All Occupations',
    occupationFarmer: 'Farmers / Agriculture',
    occupationStudent: 'Students & Scholars',
    occupationEntrepreneur: 'Entrepreneurs / MSME',
    occupationUnemployed: 'Unemployed / Destitute',
    resetFilters: 'Reset All Filters',
    showingText: 'Showing',
    ofText: 'of',
    schemesText: 'schemes',
    pageText: 'Page',
    mhPriorityTag: '(Maharashtra Priority)',
    loadingDatabase: 'Loading government welfare schemes database...',
    noSchemesFound: 'No schemes found',
    noSchemesDesc: 'Try adjusting your search terms, changing the category filter, or clearing the Maharashtra restriction to view all 4,709+ national schemes.',
    clearFilters: 'Clear Filters',
    mhStateBadge: 'Maharashtra State',
    estimatedBenefit: 'Estimated Direct Benefit:',
    zeroUploadAdapters: 'Mahasetu Zero-Upload Adapters:',
    viewDetails: 'View Details',
    apply: 'Apply',
    mhFlagship: 'Maharashtra Flagship',
    centralDbt: 'Central DBT',
    directBenefitValue: 'Direct Scheme Benefit:',
    eligibilityRules: 'Eligibility Rules & Criteria:',
    incomeLimit: 'Income Limit:',
    minAge: 'Min Age:',
    years: 'Years',
    gender: 'Gender:',
    zeroUploadFlowTitle: 'Mahasetu Interoperability Flow (Zero Uploads):',
    zeroUploadFlowDesc: 'When applying through Mahasetu, sovereign federated peer adapters automatically fetch and verify your proofs from official government registries:',
    openOfficialPortal: 'Open Official Portal',
    close: 'Close',
    applyViaMahasetu: 'Apply via Mahasetu',
    zeroUploadsBadge: 'ZERO UPLOADS',
    oneClickTag: 'Zero Uploads • 1-Click Federated Verification',
    point1: '7/12 Land, Income & Caste verified directly via registry',
    point2: 'No document scanning or certificate uploads needed',
    point3: 'Citizen consent verified with immutable ledger',
    continueViaMahasetu: 'Continue via Mahasetu (Zero Uploads)',
    goToOfficialPortal: 'Go to Official Government Portal',
    externalBadge: 'External',
    officialPortalDesc: 'Apply on Department Official Website',
    destination: 'Destination:',
    externalNote: '* Note: Requires manual account registration & scanned PDF document uploads.',
    openOfficialPortalBtn: 'Open Official Portal (External)',
    footerGovtTag: 'Government of Maharashtra • Digital Mahasetu',
    cancel: 'Cancel / Go Back'
  }
};
