/**
 * Mahasetu Interoperability Platform - Operational Database Layer
 * Adheres strictly to the Supabase PostgreSQL Schema in SIH26129 Blueprint Section 7.2
 */

import {
  CitizenUser,
  OfficerUser,
  Department,
  ServiceDefinition,
  ConsentRecord,
  DataRequestRecord,
  ApplicationRecord,
  AuditLog,
  ApiRegistryItem,
  SchemaMapping
} from '../src/types.ts';

// Pre-seeded verified Maharashtra citizen database with Aadhaar & Biometric profiles
export const MOCK_CITIZENS: CitizenUser[] = [
  {
    id: 'c1111111-2222-3333-4444-555555555501',
    aadhaarNumber: '5489 1204 8923',
    maskedAadhaar: 'XXXX-XXXX-8923',
    name: 'Asha Suresh Patil',
    nameMr: 'आशा सुरेश पाटील',
    nameHi: 'आशा सुरेश पाटिल',
    gender: 'FEMALE',
    dob: '2004-05-18',
    phone: '+91 98231 44520',
    email: 'asha.patil@example.com',
    address: {
      street: 'Shivaji Chowk, Lane 4',
      villageOrCity: 'Kothrud, Pune',
      taluka: 'Haveli',
      district: 'Pune',
      state: 'Maharashtra',
      pincode: '411038'
    },
    role: 'citizen',
    photoUrl: '',
    biometricRegistered: true,
    registeredAt: '2023-01-15T09:30:00Z'
  },
  {
    id: 'c1111111-2222-3333-4444-555555555502',
    aadhaarNumber: '7821 9043 1120',
    maskedAadhaar: 'XXXX-XXXX-1120',
    name: 'Ramesh Vitthal Deshmukh',
    nameMr: 'रमेश विठ्ठल देशमुख',
    nameHi: 'रमेश विट्ठल देशमुख',
    gender: 'MALE',
    dob: '1982-11-23',
    phone: '+91 94220 89123',
    email: 'ramesh.deshmukh@example.com',
    address: {
      street: 'Gat No. 142, Shetkari Nagar',
      villageOrCity: 'Paradsinga',
      taluka: 'Katol',
      district: 'Nagpur',
      state: 'Maharashtra',
      pincode: '441305'
    },
    role: 'citizen',
    photoUrl: '',
    biometricRegistered: true,
    registeredAt: '2022-08-10T11:20:00Z'
  },
  {
    id: 'c1111111-2222-3333-4444-555555555503',
    aadhaarNumber: '3198 4402 7761',
    maskedAadhaar: 'XXXX-XXXX-7761',
    name: 'Sunita Manohar Shinde',
    nameMr: 'सुनिता मनोहर शिंदे',
    nameHi: 'सुनीता मनोहर शिंदे',
    gender: 'FEMALE',
    dob: '1995-02-14',
    phone: '+91 97655 33211',
    email: 'sunita.shinde@example.com',
    address: {
      street: 'Panchavati Main Road',
      villageOrCity: 'Nashik',
      taluka: 'Nashik',
      district: 'Nashik',
      state: 'Maharashtra',
      pincode: '422003'
    },
    role: 'citizen',
    photoUrl: '',
    biometricRegistered: true,
    registeredAt: '2023-04-01T14:15:00Z'
  },
  {
    id: 'c1111111-2222-3333-4444-555555555504',
    aadhaarNumber: '9012 3341 5567',
    maskedAadhaar: 'XXXX-XXXX-5567',
    name: 'Rajesh Baburao Gaikwad',
    nameMr: 'राजेश बाबुराव गायकवाड',
    nameHi: 'राजेश बाबूराव गायकवाड़',
    gender: 'MALE',
    dob: '1999-07-30',
    phone: '+91 91588 44901',
    email: 'rajesh.gaikwad@example.com',
    address: {
      street: 'Cidco N-4',
      villageOrCity: 'Chhatrapati Sambhajinagar',
      taluka: 'Aurangabad',
      district: 'Chhatrapati Sambhajinagar',
      state: 'Maharashtra',
      pincode: '431003'
    },
    role: 'citizen',
    photoUrl: '',
    biometricRegistered: true,
    registeredAt: '2024-02-19T16:45:00Z'
  }
];

export const MOCK_OFFICERS: OfficerUser[] = [
  {
    id: 'off-101',
    aadhaarNumber: '4455 6677 8899',
    maskedAadhaar: 'XXXX-XXXX-8899',
    name: 'Sanjay Deshpande, Tahsildar (Haveli)',
    role: 'officer',
    departmentId: 'dept-revenue',
    departmentCode: 'REVENUE',
    designation: 'Sub-Divisional Revenue Officer',
    employeeCode: 'MH-REV-2015-891',
    officeLocation: 'Revenue Office, Shivajinagar, Pune'
  },
  {
    id: 'off-102',
    aadhaarNumber: '2233 4455 6677',
    maskedAadhaar: 'XXXX-XXXX-6677',
    name: 'Dr. Meena Kulkarni, Desk Officer (MahaDBT)',
    role: 'officer',
    departmentId: 'dept-education',
    departmentCode: 'EDUCATION',
    designation: 'Scholarship Verification Officer',
    employeeCode: 'MH-EDU-2018-402',
    officeLocation: 'Higher Education Directorate, Central Building, Pune'
  },
  {
    id: 'off-103',
    aadhaarNumber: '9988 7766 5544',
    maskedAadhaar: 'XXXX-XXXX-5544',
    name: 'Vikram Joshi, RTO Inspector',
    role: 'officer',
    departmentId: 'dept-rto',
    departmentCode: 'RTO',
    designation: 'Motor Vehicle Inspector (Pune Central)',
    employeeCode: 'MH-RTO-2012-105',
    officeLocation: 'RTO Regional Complex, Sangam Bridge, Pune'
  }
];

export const DEPARTMENTS: Department[] = [
  {
    id: 'dept-revenue',
    name: 'Revenue & Forest Department',
    nameMr: 'महसूल व वन विभाग',
    nameHi: 'राजस्व एवं वन विभाग',
    code: 'REVENUE',
    apiBaseUrl: '/api/adapters/revenue',
    description: 'Custodian of Land Records (7/12 Mahabhulekh), Income, Caste & Solvency verification systems.',
    status: 'ONLINE',
    lastPingMs: 14,
    totalHopsServed: 14280
  },
  {
    id: 'dept-district',
    name: 'District Administration & Civil Supplies',
    nameMr: 'जिल्हा प्रशासन व नागरी पुरवठा',
    nameHi: 'जिला प्रशासन एवं नागरिक आपूर्ति',
    code: 'DISTRICT_ADMIN',
    apiBaseUrl: '/api/adapters/district',
    description: 'Issues Domicile certificates, Age/Nationality records, and ration database linkage.',
    status: 'ONLINE',
    lastPingMs: 18,
    totalHopsServed: 9840
  },
  {
    id: 'dept-education',
    name: 'Higher & Technical Education Department',
    nameMr: 'उच्च व तंत्र शिक्षण विभाग (MahaDBT)',
    nameHi: 'उच्च एवं तकनीकी शिक्षा विभाग',
    code: 'EDUCATION',
    apiBaseUrl: '/api/adapters/education',
    description: 'Manages scholarship grants, collegiate enrolment, and Maharashtra State Board mark verification.',
    status: 'ONLINE',
    lastPingMs: 22,
    totalHopsServed: 21950
  },
  {
    id: 'dept-rto',
    name: 'Transport Department (MahaRTO)',
    nameMr: 'परिवहन विभाग (महाRTO)',
    nameHi: 'परिवहन विभाग (महाRTO)',
    code: 'RTO',
    apiBaseUrl: '/api/adapters/rto',
    description: 'Controls Driving Licenses (Sarathi) and Vehicle Registrations (Vahan) interoperability endpoints.',
    status: 'ONLINE',
    lastPingMs: 16,
    totalHopsServed: 8430
  },
  {
    id: 'dept-health',
    name: 'Public Health Department',
    nameMr: 'सार्वजनिक आरोग्य विभाग',
    nameHi: 'सार्वजनिक स्वास्थ्य विभाग',
    code: 'HEALTH',
    apiBaseUrl: '/api/adapters/health',
    description: 'Civil registration of Birth & Death records and Unique Disability ID (UDID) verification.',
    status: 'ONLINE',
    lastPingMs: 25,
    totalHopsServed: 6120
  },
  {
    id: 'dept-women-child',
    name: 'Women & Child Development Department',
    nameMr: 'महिला व बाल विकास विभाग',
    nameHi: 'महिला एवं बाल विकास विभाग',
    code: 'WOMEN_CHILD',
    apiBaseUrl: '/api/adapters/women-child',
    description: 'Empowerment schemes, Ladki Bahin DBT, maternity aid, and Anganwadi service registry.',
    status: 'ONLINE',
    lastPingMs: 15,
    totalHopsServed: 18450
  },
  {
    id: 'dept-social-justice',
    name: 'Social Justice & Special Assistance Department',
    nameMr: 'सामाजिक न्याय व विशेष सहाय्य विभाग',
    nameHi: 'सामाजिक न्याय एवं विशेष सहायता विभाग',
    code: 'SOCIAL_JUSTICE',
    apiBaseUrl: '/api/adapters/social-justice',
    description: 'BARTI Caste validation, Sanjay Gandhi Niradhar social security pensions, and disability welfare.',
    status: 'ONLINE',
    lastPingMs: 19,
    totalHopsServed: 12380
  },
  {
    id: 'dept-energy',
    name: 'Energy Department (MSEDCL / MahaVitaran)',
    nameMr: 'ऊर्जा विभाग (महावितरण)',
    nameHi: 'ऊर्जा विभाग (महावितरण)',
    code: 'ENERGY',
    apiBaseUrl: '/api/adapters/energy',
    description: 'Agricultural pump electricity subsidies, Baliraja power schemes, and consumer connection registry.',
    status: 'ONLINE',
    lastPingMs: 17,
    totalHopsServed: 7920
  },
  {
    id: 'dept-food-civil',
    name: 'Food, Civil Supplies & Consumer Protection',
    nameMr: 'अन्न, नागरी पुरवठा व ग्राहक संरक्षण विभाग',
    nameHi: 'खाद्य, नागरिक आपूर्ति एवं उपभोक्ता संरक्षण विभाग',
    code: 'FOOD_CIVIL',
    apiBaseUrl: '/api/adapters/food-civil',
    description: 'Targeted Public Distribution System (TPDS), digitized ration card allocation, and NFSA records.',
    status: 'ONLINE',
    lastPingMs: 21,
    totalHopsServed: 16400
  }
];

export const SERVICES: ServiceDefinition[] = [
  {
    id: 'srv-scholarship-01',
    code: 'SRV_MAHADBT_SCHOLARSHIP',
    departmentId: 'dept-education',
    departmentCode: 'EDUCATION',
    name: 'Rajarshi Chhatrapati Shahu Maharaj Merit Scholarship',
    nameMr: 'राजर्षी छत्रपती शाहू महाराज गुणवत्ता शिष्यवृत्ती',
    nameHi: 'राजर्षि छत्रपति शाहू महाराज मेरिट छात्रवृत्ति',
    description: 'Direct DBT scholarship disbursed to higher education students based on verified income and state domicile.',
    descriptionMr: 'उत्पन्न व अधिवास पडताळणीवर आधारित उच्च शिक्षणातील विद्यार्थ्यांसाठी थेट DBT शिष्यवृत्ती.',
    descriptionHi: 'आय और अधिवास सत्यापन पर आधारित उच्च शिक्षा के छात्रों के लिए प्रत्यक्ष डीबीटी छात्रवृत्ति।',
    category: 'SCHOLARSHIP',
    benefit: '100% tuition & examination fee reimbursement for professional courses',
    benefitMr: 'व्यावसायिक उच्च शिक्षणासाठी १००% शिक्षण व परीक्षा शुल्क प्रतिपूर्ती',
    requiredFields: [
      {
        id: 'rf-1',
        sourceDepartmentCode: 'REVENUE',
        fieldCode: 'INCOME_CERTIFICATE',
        displayName: 'Annual Family Income Verification',
        displayNameMr: 'वार्षिक कौटुंबिक उत्पन्न पडताळणी',
        displayNameHi: 'वार्षिक पारिवारिक आय सत्यापन',
        purpose: 'Verify that annual family income is under ₹8,00,000 for quota qualification.',
        retentionHours: 24,
        mandatory: true
      },
      {
        id: 'rf-2',
        sourceDepartmentCode: 'DISTRICT_ADMIN',
        fieldCode: 'DOMICILE_CERTIFICATE',
        displayName: 'Maharashtra Domicile Verification',
        displayNameMr: 'महाराष्ट्र अधिवास (डोमिसाईल) पडताळणी',
        displayNameHi: 'महाराष्ट्र अधिवास प्रमाणन',
        purpose: 'Verify candidate is a permanent resident of Maharashtra for at least 15 years.',
        retentionHours: 24,
        mandatory: true
      }
    ],
    slaDays: 7,
    feeInr: 0
  },
  {
    id: 'srv-farmer-02',
    code: 'SRV_SHETKARI_SANMAN',
    departmentId: 'dept-revenue',
    departmentCode: 'REVENUE',
    name: 'Namo Shetkari Mahasanman Nidhi Subsidy',
    nameMr: 'नमो शेतकरी महासन्मान निधी अनुदान',
    nameHi: 'नमो शेतकरी महासम्मान निधि सब्सिडी',
    description: 'Annual financial assistance to verified agricultural landholders across Maharashtra districts.',
    descriptionMr: 'महाराष्ट्रातील प्रमाणित शेतजमीन धारकांसाठी वार्षिक आर्थिक सन्मान निधी.',
    descriptionHi: 'महाराष्ट्र के सत्यापित कृषि भूमिधारकों के लिए वार्षिक वित्तीय सहायता।',
    category: 'FARMER_WELFARE',
    benefit: '₹6,000 annual direct cash transfer directly to farmer bank account',
    benefitMr: 'शेतकऱ्यांच्या थेट बँक खात्यात वार्षिक ₹६,००० चा थेट सन्मान निधी',
    requiredFields: [
      {
        id: 'rf-3',
        sourceDepartmentCode: 'REVENUE',
        fieldCode: 'LAND_EXTRACT_712',
        displayName: 'Mahabhulekh 7/12 Land Record Verification',
        displayNameMr: 'महाभूलेख ७/१२ जमीन उतारा पडताळणी',
        displayNameHi: 'महाभूलेख 7/12 भूमि रिकॉर्ड सत्यापन',
        purpose: 'Verify active ownership of cultivable agricultural land area (Hectares/Ares).',
        retentionHours: 48,
        mandatory: true
      },
      {
        id: 'rf-4',
        sourceDepartmentCode: 'DISTRICT_ADMIN',
        fieldCode: 'RESIDENTIAL_PROOF',
        displayName: 'Rural Residence Certificate',
        displayNameMr: 'ग्रामीण निवास प्रमाणपत्र पडताळणी',
        displayNameHi: 'ग्रामीण निवास सत्यापन',
        purpose: 'Verify ongoing residence in rural gram panchayat jurisdiction.',
        retentionHours: 24,
        mandatory: true
      }
    ],
    slaDays: 5,
    feeInr: 0
  },
  {
    id: 'srv-transport-03',
    code: 'SRV_LEARNER_DL_FAST_TRACK',
    departmentId: 'dept-rto',
    departmentCode: 'RTO',
    name: 'Learner Driving License Fast-Track Issuance',
    nameMr: 'शिकाऊ वाहन चालक परवाना (लर्नर लायसन्स) जलद वितरण',
    nameHi: 'शिक्षार्थी ड्राइविंग लाइसेंस त्वरित जारी',
    description: 'Zero-physical visit issuance of Learner Driving License by cross-verifying medical fitness & domicile.',
    descriptionMr: 'अधिवास व आरोग्य पात्रतेच्या डिजिटल पडताळणीद्वारे थेट शिकाऊ परवाना वितरण.',
    descriptionHi: 'अधिवास और स्वास्थ्य प्रमाणन के डिजिटल सत्यापन द्वारा शिक्षार्थी लाइसेंस।',
    category: 'TRANSPORT',
    benefit: 'Instant digital Learner License issued to phone without RTO queue',
    benefitMr: 'कोणत्याही रांगेविना त्वरित डिजिटल शिकाऊ परवाना थेट मोबाईलवर प्राप्त',
    requiredFields: [
      {
        id: 'rf-5',
        sourceDepartmentCode: 'DISTRICT_ADMIN',
        fieldCode: 'DOMICILE_CERTIFICATE',
        displayName: 'Permanent Resident Age & Address Proof',
        displayNameMr: 'कायमस्वरूपी पत्ता व वयाचा पुरावा',
        displayNameHi: 'स्थायी पता एवं आयु प्रमाण',
        purpose: 'Verify applicant is above 18 years of age and resides within regional RTO jurisdiction.',
        retentionHours: 12,
        mandatory: true
      },
      {
        id: 'rf-6',
        sourceDepartmentCode: 'HEALTH',
        fieldCode: 'MEDICAL_FITNESS_FORM1A',
        displayName: 'Medical Fitness Certificate (Form 1A)',
        displayNameMr: 'वैद्यकीय योग्यता प्रमाणपत्र (फॉर्म १A)',
        displayNameHi: 'चिकित्सा फिटनेस प्रमाणपत्र (फॉर्म 1A)',
        purpose: 'Verify visual acuity and physical fitness from authorized state medical registry.',
        retentionHours: 12,
        mandatory: true
      }
    ],
    slaDays: 2,
    feeInr: 150
  },
  {
    id: 'srv-civil-04',
    code: 'SRV_EWS_CERTIFICATE',
    departmentId: 'dept-district',
    departmentCode: 'DISTRICT_ADMIN',
    name: 'Economically Weaker Section (EWS) Certificate',
    nameMr: 'आर्थिकदृष्ट्या दुर्बल घटक (EWS) पात्रता प्रमाणपत्र',
    nameHi: 'आर्थिक रूप से कमजोर वर्ग (EWS) प्रमाण पत्र',
    description: 'Automated 10% educational & employment reservation eligibility verification.',
    descriptionMr: 'शिक्षण व नोकरीतील १०% आरक्षणासाठी आवश्यक ईडब्ल्यूएस प्रमाणपत्र.',
    descriptionHi: 'शिक्षा और नौकरी में 10% आरक्षण हेतु ईडब्ल्यूएस प्रमाण पत्र।',
    category: 'CIVIL_SERVICES',
    benefit: '10% constitutional quota reservation in education and government jobs',
    benefitMr: 'शिक्षण आणि शासकीय नोकऱ्यांमध्ये १०% आरक्षणाचा कायदेशीर लाभ',
    requiredFields: [
      {
        id: 'rf-7',
        sourceDepartmentCode: 'REVENUE',
        fieldCode: 'INCOME_CERTIFICATE',
        displayName: 'Sub-Divisional Revenue Income Verification',
        displayNameMr: 'उपविभागीय महसूल उत्पन्न दाखला',
        displayNameHi: 'उपमंडलीय राजस्व आय सत्यापन',
        purpose: 'Verify family gross annual income is below ₹8,00,000 for preceding financial year.',
        retentionHours: 72,
        mandatory: true
      },
      {
        id: 'rf-8',
        sourceDepartmentCode: 'REVENUE',
        fieldCode: 'LAND_EXTRACT_712',
        displayName: 'Residential Property / Land Holding Verification',
        displayNameMr: 'स्थावर मालमत्ता व शेतजमीन कमाल मर्यादा पडताळणी',
        displayNameHi: 'अचल संपत्ति एवं भूमि सीमा सत्यापन',
        purpose: 'Verify residential flat does not exceed 1000 sq ft and agricultural land does not exceed 5 acres.',
        retentionHours: 72,
        mandatory: true
      }
    ],
    slaDays: 10,
    feeInr: 50
  },
  {
    id: 'srv-women-05',
    code: 'SRV_LADKI_BAHIN',
    departmentId: 'dept-women-child',
    departmentCode: 'WOMEN_CHILD',
    name: 'Mukhyamantri Majhi Ladki Bahin Yojana',
    nameMr: 'मुख्यमंत्री माझी लाडकी बहीण योजना',
    nameHi: 'मुख्यमंत्री माझी लाडकी बहिन योजना',
    description: 'Direct financial assistance of ₹1,500/month disbursed directly to bank accounts of eligible women aged 21 to 65.',
    descriptionMr: '२१ ते ६५ वयोगटातील पात्र महिलांसाठी दरमहा ₹१,५०० ची थेट बँक खात्यात आर्थिक मदत.',
    descriptionHi: '21 से 65 वर्ष की पात्र महिलाओं के बैंक खाते में ₹1,500 प्रति माह प्रत्यक्ष सहायता।',
    category: 'WOMEN_WELFARE',
    benefit: '₹1,500 per month (₹18,000 annually) direct DBT cash support',
    benefitMr: 'दरमहा ₹१,५०० (वार्षिक ₹१८,०००) थेट बँक खात्यात जमा',
    requiredFields: [
      {
        id: 'rf-w1',
        sourceDepartmentCode: 'DISTRICT_ADMIN',
        fieldCode: 'DOMICILE_CERTIFICATE',
        displayName: 'Maharashtra 15-Year Domicile Record',
        displayNameMr: 'महाराष्ट्र १५ वर्षे अधिवास दाखला',
        displayNameHi: 'महाराष्ट्र 15 वर्ष अधिवास प्रमाण',
        purpose: 'Verify applicant is resident of Maharashtra state.',
        retentionHours: 24,
        mandatory: true
      },
      {
        id: 'rf-w2',
        sourceDepartmentCode: 'REVENUE',
        fieldCode: 'INCOME_CERTIFICATE',
        displayName: 'Annual Family Income Under ₹2.5 Lakh',
        displayNameMr: 'वार्षिक उत्पन्न ₹२.५ लाखांपेक्षा कमी असण्याची नोंद',
        displayNameHi: 'वार्षिक आय ₹2.5 लाख से कम का सत्यापन',
        purpose: 'Verify family income criteria for welfare targeting.',
        retentionHours: 24,
        mandatory: true
      }
    ],
    slaDays: 3,
    feeInr: 0
  },
  {
    id: 'srv-caste-06',
    code: 'SRV_CASTE_VALIDITY',
    departmentId: 'dept-social-justice',
    departmentCode: 'SOCIAL_JUSTICE',
    name: 'Caste Validity & Verification Certificate (BARTI / CCVIS)',
    nameMr: 'जात पडताळणी प्रमाणपत्र (BARTI / CCVIS)',
    nameHi: 'जाति वैधता एवं सत्यापन प्रमाण पत्र (BARTI)',
    description: 'Direct scrutiny and automated genealogical verification for SC, ST, VJNT, and OBC candidates for professional admissions.',
    descriptionMr: 'व्यावसायिक अभ्यासक्रम प्रवेश व आरक्षणासाठी जात प्रमाणपत्राची थेट डिजिटल वैधता.',
    descriptionHi: 'व्यावसायिक पाठ्यक्रमों में प्रवेश और आरक्षण हेतु जाति वैधता सत्यापन।',
    category: 'CIVIL_SERVICES',
    benefit: 'Permanent validity decree confirming reserved category entitlement',
    benefitMr: 'आरक्षित प्रवर्गातील प्रवेश व पदोन्नतीसाठी कायमस्वरूपी जात वैधता दाखला',
    requiredFields: [
      {
        id: 'rf-c1',
        sourceDepartmentCode: 'REVENUE',
        fieldCode: 'CASTE_CERTIFICATE',
        displayName: 'Revenue Issued Caste Certificate',
        displayNameMr: 'तहसीलदार कार्यालयाने दिलेला मूळ जात दाखला',
        displayNameHi: 'तहसीलदार द्वारा जारी मूल जाति प्रमाण पत्र',
        purpose: 'Cross-verify genuine caste serial number and sub-caste entry.',
        retentionHours: 72,
        mandatory: true
      },
      {
        id: 'rf-c2',
        sourceDepartmentCode: 'DISTRICT_ADMIN',
        fieldCode: 'SCHOOL_LEAVING_RECORD',
        displayName: 'Applicant & Paternal School Leaving Record (Pre-1967/1961)',
        displayNameMr: 'अर्जदार व वडिलांची शाळा सोडल्याची अधिकृत नोंद',
        displayNameHi: 'आवेदक एवं पिता का स्कूल रिकॉर्ड',
        purpose: 'Validate historical lineage and residence prior to benchmark cut-off dates.',
        retentionHours: 72,
        mandatory: true
      }
    ],
    slaDays: 14,
    feeInr: 0
  },
  {
    id: 'srv-agri-power-07',
    code: 'SRV_BALIRAJA_FREE_POWER',
    departmentId: 'dept-energy',
    departmentCode: 'ENERGY',
    name: 'Mukhyamantri Baliraja Free Electricity Scheme',
    nameMr: 'मुख्यमंत्री बळीराजा मोफत वीज योजना',
    nameHi: 'मुख्यमंत्री बळीराजा निःशुल्क बिजली योजना',
    description: '100% state tariff subsidy on agricultural water pump connections up to 7.5 HP capacity for verified farmers.',
    descriptionMr: '७.५ अश्वशक्ती (HP) पर्यंतच्या शेतीपंपांच्या चालू वीज बिलात १००% माफी व मोफत वीज.',
    descriptionHi: '7.5 HP तक के कृषि पंपों के बिजली बिल में 100% सब्सिडी और मुफ्त बिजली।',
    category: 'FARMER_WELFARE',
    benefit: 'Zero electricity bill for 7.5 HP farm pumps for complete agricultural seasons',
    benefitMr: 'शेतकऱ्यांना शेतीपंपाचे शून्य वीज बिल आणि अखंड वीज सवलत',
    requiredFields: [
      {
        id: 'rf-e1',
        sourceDepartmentCode: 'REVENUE',
        fieldCode: 'LAND_EXTRACT_712',
        displayName: 'Agricultural Land Title (7/12 Mahabhulekh)',
        displayNameMr: 'शेतजमीन मालकी हक्क ७/१२ नोंद',
        displayNameHi: 'कृषि भूमि 7/12 रिकॉर्ड',
        purpose: 'Verify agricultural parcel ownership and active cultivation.',
        retentionHours: 48,
        mandatory: true
      },
      {
        id: 'rf-e2',
        sourceDepartmentCode: 'ENERGY',
        fieldCode: 'AG_PUMP_CONSUMER_ID',
        displayName: 'MSEDCL Agricultural Pump Consumer Connection',
        displayNameMr: 'महावितरण कृषी ग्राहक क्रमांक (Consumer No)',
        displayNameHi: 'महावितरण कृषि उपभोक्ता संख्या',
        purpose: 'Match meter load <= 7.5 HP to farmer Aadhaar credential.',
        retentionHours: 24,
        mandatory: true
      }
    ],
    slaDays: 2,
    feeInr: 0
  },
  {
    id: 'srv-health-08',
    code: 'SRV_MJPJAY_HEALTH',
    departmentId: 'dept-health',
    departmentCode: 'HEALTH',
    name: 'Mahatma Jyotirao Phule Jan Arogya Yojana (MJPJAY)',
    nameMr: 'महात्मा ज्योतिराव फुले जन आरोग्य योजना (MJPJAY)',
    nameHi: 'महात्मा ज्योतिराव फुले जन आरोग्य योजना',
    description: 'Cashless health insurance coverage of ₹5,00,000 per family per year across 1,356 medical and surgical procedures.',
    descriptionMr: 'प्रति कुटुंब वार्षिक ₹५ लाख रुपयांपर्यंत मोफत कॅशलेस उपचार व शस्त्रक्रिया संरक्षण.',
    descriptionHi: 'प्रति परिवार ₹5 लाख प्रति वर्ष तक निःशुल्क कैशलेस अस्पताल उपचार।',
    category: 'HEALTHCARE',
    benefit: '₹5,00,000 cashless tertiary hospital treatment per family annually',
    benefitMr: 'प्रति कुटुंब वार्षिक ₹५,००,००० पर्यंतचे मोफत कॅशलेस रुग्णालयीन उपचार',
    requiredFields: [
      {
        id: 'rf-h1',
        sourceDepartmentCode: 'FOOD_CIVIL',
        fieldCode: 'RATION_CARD_STATUS',
        displayName: 'Ration Card Food Entitlement Tier (Yellow/Orange/White)',
        displayNameMr: 'रेशन कार्ड वर्गवारी (पिवळे/केशरी/पांढरे)',
        displayNameHi: 'राशन कार्ड पात्रता श्रेणी',
        purpose: 'Verify household eligibility category in state food database.',
        retentionHours: 24,
        mandatory: true
      },
      {
        id: 'rf-h2',
        sourceDepartmentCode: 'DISTRICT_ADMIN',
        fieldCode: 'DOMICILE_CERTIFICATE',
        displayName: 'Maharashtra Residence Proof',
        displayNameMr: 'महाराष्ट्र अधिवास दाखला',
        displayNameHi: 'महाराष्ट्र निवास प्रमाण',
        purpose: 'Verify resident status for state healthcare fund.',
        retentionHours: 24,
        mandatory: true
      }
    ],
    slaDays: 1,
    feeInr: 0
  },
  {
    id: 'srv-social-09',
    code: 'SRV_SANJAY_GANDHI_PENSION',
    departmentId: 'dept-social-justice',
    departmentCode: 'SOCIAL_JUSTICE',
    name: 'Sanjay Gandhi Niradhar Anudan Yojana',
    nameMr: 'संजय गांधी निराधार अनुदान योजना',
    nameHi: 'संजय गांधी निराधार अनुदान योजना',
    description: 'Monthly social security pension of ₹1,500 provided to destitute persons, widows, orphans, and persons with severe medical disabilities.',
    descriptionMr: 'निराधार व्यक्ती, विधवा, अनाथ बालके व दिव्यांग व्यक्तींना दरमहा ₹१,५०० चे आर्थिक निवृत्तीवेतन.',
    descriptionHi: 'निराधार, विधवा और दिव्यांग व्यक्तियों के लिए ₹1,500 प्रति माह सामाजिक पेंशन।',
    category: 'SOCIAL_WELFARE',
    benefit: '₹1,500 monthly recurring life-support pension directly to citizen bank account',
    benefitMr: 'दरमहा ₹१,५०० ची नियमित पेन्शन थेट लाभार्थ्यांच्या बँक खात्यात',
    requiredFields: [
      {
        id: 'rf-s1',
        sourceDepartmentCode: 'HEALTH',
        fieldCode: 'DISABILITY_UDID_OR_AGE',
        displayName: 'Medical Disability / Age Assessment Certificate',
        displayNameMr: 'वैद्यकीय मंडळ दिव्यांग दाखला किंवा वयाचा पुरावा',
        displayNameHi: 'दिव्यांगता अथवा आयु प्रमाण पत्र',
        purpose: 'Verify qualification under destitute or disability criteria (40%+).',
        retentionHours: 48,
        mandatory: true
      },
      {
        id: 'rf-s2',
        sourceDepartmentCode: 'REVENUE',
        fieldCode: 'BPL_INCOME_CERTIFICATE',
        displayName: 'BPL or Destitute Income Status (< ₹50,000/yr)',
        displayNameMr: 'दारिद्र्यरेषेखालील (BPL) किंवा निराधार उत्पन्न दाखला',
        displayNameHi: 'बीपीएल अथवा निराधार आय प्रमाण',
        purpose: 'Verify absence of substantial independent livelihood.',
        retentionHours: 48,
        mandatory: true
      }
    ],
    slaDays: 7,
    feeInr: 0
  },
  {
    id: 'srv-hostel-10',
    code: 'SRV_PUNJABRAO_HOSTEL',
    departmentId: 'dept-education',
    departmentCode: 'EDUCATION',
    name: 'Dr. Punjabrao Deshmukh Hostel Maintenance Allowance',
    nameMr: 'डॉ. पंजाबराव देशमुख वसतिगृह निर्वाह भत्ता योजना',
    nameHi: 'डॉ. पंजाबराव देशमुख छात्रावास निर्वाह भत्ता',
    description: 'Annual cash grant of up to ₹30,000 for hostel lodging and boarding for children of registered marginal farmers and agricultural farm workers pursuing professional degrees.',
    descriptionMr: 'अल्पभूधारक शेतकरी व शेतमजुरांच्या पाल्यांना उच्च शिक्षणासाठी वसतिगृह निर्वाह भत्ता (वार्षिक ₹३०,००० पर्यंत).',
    descriptionHi: 'सीमांत किसानों के बच्चों के लिए छात्रावास हेतु ₹30,000 वार्षिक निर्वाह भत्ता।',
    category: 'SCHOLARSHIP',
    benefit: '₹30,000/yr (Divisional HQ) or ₹20,000/yr (District) hostel lodging & food grant',
    benefitMr: 'वसतिगृह व भोजनासाठी दरवर्षी ₹३०,००० थेट बँक खात्यात साहाय्य',
    requiredFields: [
      {
        id: 'rf-p1',
        sourceDepartmentCode: 'REVENUE',
        fieldCode: 'MARGINAL_FARMER_712',
        displayName: 'Marginal Farmer Holding Proof (< 5 Acres)',
        displayNameMr: 'अल्पभूधारक शेतकरी प्रमाणपत्र व ७/१२ नोंद',
        displayNameHi: 'सीमांत किसान 7/12 प्रमाण पत्र',
        purpose: 'Verify parent agricultural landholding does not exceed marginal threshold.',
        retentionHours: 24,
        mandatory: true
      },
      {
        id: 'rf-p2',
        sourceDepartmentCode: 'EDUCATION',
        fieldCode: 'COLLEGE_BONAFIDE_HOSTEL',
        displayName: 'Collegiate Enrolment & Hostel Residence Record',
        displayNameMr: 'महाविद्यालयीन प्रवेश व वसतिगृह वास्तव्य नोंद',
        displayNameHi: 'कॉलेज प्रवेश एवं छात्रावास निवास प्रमाण',
        purpose: 'Confirm admission in professional graduate course outside native village.',
        retentionHours: 24,
        mandatory: true
      }
    ],
    slaDays: 5,
    feeInr: 0
  },
  {
    id: 'srv-ration-11',
    code: 'SRV_SMART_RATION_CARD',
    departmentId: 'dept-food-civil',
    departmentCode: 'FOOD_CIVIL',
    name: 'Digitized Smart Ration Card & Antyodaya Anna Allocation',
    nameMr: 'डिजिटल स्मार्ट रेशन कार्ड व अंत्योदय अन्न धान्य वाटप',
    nameHi: 'डिजिटल स्मार्ट राशन कार्ड एवं अंत्योदय खाद्यान्न आवंटन',
    description: 'Instant paperless lifecycle issuance of QR-coded Smart Ration Card and subsidized grain allocation under National Food Security Act.',
    descriptionMr: 'क्यूआर-कोड युक्त डिजिटल रेशन कार्ड व स्वस्त धान्य दुकानातून नियमित अन्नधान्य वाटप.',
    descriptionHi: 'क्यूआर-कोड डिजिटल राशन कार्ड एवं रियायती खाद्यान्न आवंटन।',
    category: 'CIVIL_SERVICES',
    benefit: 'Family entitlement to subsidized rice (₹3/kg) & wheat (₹2/kg) with digital card barcode',
    benefitMr: 'कुटुंबासाठी स्वस्त धान्य व डिजिटल क्यूआर-कोड स्मार्ट रेशन कार्ड',
    requiredFields: [
      {
        id: 'rf-r1',
        sourceDepartmentCode: 'DISTRICT_ADMIN',
        fieldCode: 'FAMILY_RESIDENCE_PROOF',
        displayName: 'Local Residential Gas/Electricity Linkage',
        displayNameMr: 'स्थानिक रहिवासी पत्ता व गॅस जोडणी नोंद',
        displayNameHi: 'स्थानीय निवास एवं एलपीजी कनेक्शन प्रमाण',
        purpose: 'Ensure no duplication of ration cards across districts.',
        retentionHours: 48,
        mandatory: true
      },
      {
        id: 'rf-r2',
        sourceDepartmentCode: 'REVENUE',
        fieldCode: 'INCOME_CERTIFICATE',
        displayName: 'Tahsildar Certified Household Annual Income',
        displayNameMr: 'तहसीलदार प्रमाणित कौटुंबिक वार्षिक उत्पन्न',
        displayNameHi: 'तहसीलदार प्रमाणित पारिवारिक आय',
        purpose: 'Categorize into BPL, Priority Household (PHH), or Non-Subsidized tier.',
        retentionHours: 48,
        mandatory: true
      }
    ],
    slaDays: 7,
    feeInr: 20
  },
  {
    id: 'srv-rto-perm-12',
    code: 'SRV_PERMANENT_DRIVING_LICENSE',
    departmentId: 'dept-rto',
    departmentCode: 'RTO',
    name: 'Permanent Driving License (Smart Card Biometric Upgrade)',
    nameMr: 'पक्का वाहन चालक परवाना (स्मार्ट कार्ड बायोमेट्रिक अपग्रेड)',
    nameHi: 'स्थायी ड्राइविंग लाइसेंस (स्मार्ट कार्ड बायोमेट्रिक अपग्रेड)',
    description: 'Direct slotless issuance of chip-embedded permanent Driving License via Sarathi biometric mesh verification without repeat paperwork.',
    descriptionMr: 'शिकाऊ परवान्यानंतर कोणत्याही कागदी प्रक्रियेशिवाय थेट पक्का स्मार्ट वाहन चालक परवाना.',
    descriptionHi: 'शिक्षार्थी लाइसेंस के बाद बिना कागजी औपचारिकता के स्थायी स्मार्ट ड्राइविंग लाइसेंस।',
    category: 'TRANSPORT',
    benefit: 'Official smart-chip Permanent Driving License valid across India for 20 years',
    benefitMr: 'संपूर्ण भारतात २० वर्षांसाठी वैध अधिकृत स्मार्ट चिप वाहन चालक परवाना',
    requiredFields: [
      {
        id: 'rf-d1',
        sourceDepartmentCode: 'RTO',
        fieldCode: 'LEARNER_LICENSE_SARATHI',
        displayName: 'Valid Learner License Record (Sarathi Gateway)',
        displayNameMr: 'वैध शिकाऊ चालक परवाना नोंद (सारथी गेटवे)',
        displayNameHi: 'सत्यापित शिक्षार्थी लाइसेंस रिकॉर्ड',
        purpose: 'Verify mandatory 30-day minimum learner license tenure completed.',
        retentionHours: 12,
        mandatory: true
      },
      {
        id: 'rf-d2',
        sourceDepartmentCode: 'HEALTH',
        fieldCode: 'MEDICAL_FITNESS_FORM1A',
        displayName: 'Medical Fitness Certificate (Civil Surgeon Verified)',
        displayNameMr: 'वैद्यकीय स्वास्थ्य तपासणी प्रमाणपत्र',
        displayNameHi: 'चिकित्सा स्वास्थ्य प्रमाण पत्र',
        purpose: 'Ensure vision and neurological driving fitness.',
        retentionHours: 12,
        mandatory: true
      }
    ],
    slaDays: 3,
    feeInr: 200
  },
  {
    id: 'srv-senior-13',
    code: 'SRV_VAYOSHRI_SENIOR',
    departmentId: 'dept-social-justice',
    departmentCode: 'SOCIAL_JUSTICE',
    name: 'Mukhyamantri Vayoshri Yojana (Senior Citizen Grant & Living Aids)',
    nameMr: 'मुख्यमंत्री वयोश्री योजना (ज्येष्ठ नागरिक आर्थिक साहाय्य व उपकरणे)',
    nameHi: 'मुख्यमंत्री वयोश्री योजना (वरिष्ठ नागरिक सहायता एवं उपकरण)',
    description: 'Financial grant of ₹3,000 and free distribution of physical assistive equipment (hearing aids, spectacles, wheelchairs, knee braces) for citizens aged 65 and above.',
    descriptionMr: '६५ वर्षे व त्यावरील ज्येष्ठ नागरिकांसाठी ₹३,००० थेट साहाय्य व मोफत श्रवणयंत्र, चष्मा, व्हिलचेअर वाटप.',
    descriptionHi: '65 वर्ष से अधिक आयु के वरिष्ठ नागरिकों के लिए ₹3,000 सहायता एवं निःशुल्क सहायक उपकरण वितरण।',
    category: 'SOCIAL_WELFARE',
    benefit: '₹3,000 direct bank grant + 100% free mobility, vision, and hearing aids',
    benefitMr: '₹३,००० थेट रोख अनुदान आणि मोफत श्रवणयंत्र, चष्मा व व्हिलचेअर साहाय्य',
    requiredFields: [
      {
        id: 'rf-v1',
        sourceDepartmentCode: 'DISTRICT_ADMIN',
        fieldCode: 'SENIOR_AGE_DOMICILE',
        displayName: 'Aadhaar Age Proof (65+ Years) & Maharashtra Domicile',
        displayNameMr: 'आधार वयाचा पुरावा (६५+ वर्षे) व महाराष्ट्र वास्तव्य',
        displayNameHi: 'आधार आयु प्रमाण (65+ वर्ष) एवं महाराष्ट्र निवास',
        purpose: 'Verify age requirement and state domicile.',
        retentionHours: 24,
        mandatory: true
      },
      {
        id: 'rf-v2',
        sourceDepartmentCode: 'REVENUE',
        fieldCode: 'INCOME_CERTIFICATE',
        displayName: 'Annual Family Income Under ₹2,00,000',
        displayNameMr: 'वार्षिक उत्पन्न ₹२ लाखांपेक्षा कमी असल्याचा दाखला',
        displayNameHi: 'वार्षिक आय ₹2 लाख से कम प्रमाण पत्र',
        purpose: 'Verify senior citizen income criteria.',
        retentionHours: 24,
        mandatory: true
      }
    ],
    slaDays: 5,
    feeInr: 0
  }
];

export const INITIAL_API_REGISTRY: ApiRegistryItem[] = [
  {
    id: 'api-01',
    departmentCode: 'REVENUE',
    serviceName: 'Income Certificate Verification API',
    endpointPath: '/api/adapters/revenue/income-certificate/:id',
    method: 'GET',
    description: 'Verifies issued revenue certificate and returns Mahasetu Canonical IncomeCertificate payload.',
    authType: 'JWT_BEARER',
    version: 'v1.4',
    status: 'ACTIVE',
    documentationUrl: 'https://mahasetu.gov.in/docs/api/revenue-income'
  },
  {
    id: 'api-02',
    departmentCode: 'REVENUE',
    serviceName: 'Mahabhulekh 7/12 Land Extract API',
    endpointPath: '/api/adapters/revenue/land-extract/:gatNo',
    method: 'GET',
    description: 'Fetches digital 7/12 Land Extract verification with total parcel area and tenure status.',
    authType: 'JWT_BEARER',
    version: 'v2.1',
    status: 'ACTIVE',
    documentationUrl: 'https://mahasetu.gov.in/docs/api/revenue-712'
  },
  {
    id: 'api-03',
    departmentCode: 'DISTRICT_ADMIN',
    serviceName: 'Domicile & Nationality Status API',
    endpointPath: '/api/adapters/district/domicile/:id',
    method: 'GET',
    description: 'Validates permanent domicile record in Maharashtra State Civil Registry.',
    authType: 'JWT_BEARER',
    version: 'v1.1',
    status: 'ACTIVE',
    documentationUrl: 'https://mahasetu.gov.in/docs/api/district-domicile'
  },
  {
    id: 'api-04',
    departmentCode: 'RTO',
    serviceName: 'Sarathi Driving License Verification API',
    endpointPath: '/api/adapters/rto/license/:dlNo',
    method: 'GET',
    description: 'Validates active driving license credential, vehicle categories, and suspension status.',
    authType: 'MUTUAL_TLS',
    version: 'v3.0',
    status: 'ACTIVE',
    documentationUrl: 'https://mahasetu.gov.in/docs/api/rto-sarathi'
  },
  {
    id: 'api-05',
    departmentCode: 'HEALTH',
    serviceName: 'Civil Health & Medical Fitness API',
    endpointPath: '/api/adapters/health/medical-fitness/:id',
    method: 'GET',
    description: 'Validates registered medical fitness Form 1A signed by certified Civil Surgeon.',
    authType: 'JWT_BEARER',
    version: 'v1.0',
    status: 'ACTIVE',
    documentationUrl: 'https://mahasetu.gov.in/docs/api/health-fitness'
  }
];

export const INITIAL_SCHEMA_MAPPINGS: SchemaMapping[] = [
  {
    id: 'sm-rev-01',
    departmentCode: 'REVENUE',
    serviceName: 'Revenue Income to Canonical Schema',
    sourceSchema: {
      applicantName: "string (e.g. 'Asha Suresh Patil')",
      cert_id: "string (e.g. 'INC-MH-2026-10382')",
      annual_income_inr: "number (e.g. 120000)",
      is_valid: "boolean (e.g. true)",
      valid_until: "ISO string (e.g. '2027-03-31T00:00:00Z')",
      issuing_taluka: "string",
      district: "string"
    },
    canonicalSchema: {
      documentType: "'IncomeCertificate'",
      documentNumber: "string",
      personName: "string",
      verificationStatus: "'VERIFIED' | 'NOT_VERIFIED'",
      validUntil: "string",
      metadata: "object containing sanitized attributes"
    },
    mappingRules: [
      {
        canonicalField: 'personName',
        sourceField: 'applicantName',
        description: 'Direct string copy'
      },
      {
        canonicalField: 'documentNumber',
        sourceField: 'cert_id',
        description: 'Revenue specific certificate identifier'
      },
      {
        canonicalField: 'verificationStatus',
        sourceField: 'is_valid',
        transformationRule: 'is_valid === true ? "VERIFIED" : "NOT_VERIFIED"',
        description: 'Boolean flag mapped to Mahasetu canonical status enum'
      },
      {
        canonicalField: 'validUntil',
        sourceField: 'valid_until',
        description: 'Direct ISO date mapping'
      }
    ],
    updatedAt: '2026-09-01T10:00:00Z'
  },
  {
    id: 'sm-dist-02',
    departmentCode: 'DISTRICT_ADMIN',
    serviceName: 'District Domicile to Canonical Schema',
    sourceSchema: {
      resident_name: "string",
      domicile_reg_no: "string",
      years_resident: "number",
      approval_flag: "string ('Y' | 'N')",
      district_code: "string"
    },
    canonicalSchema: {
      documentType: "'DomicileCertificate'",
      documentNumber: "string",
      personName: "string",
      verificationStatus: "'VERIFIED' | 'NOT_VERIFIED'",
      validUntil: "string",
      metadata: "object"
    },
    mappingRules: [
      {
        canonicalField: 'personName',
        sourceField: 'resident_name',
        description: 'Maps resident name'
      },
      {
        canonicalField: 'documentNumber',
        sourceField: 'domicile_reg_no',
        description: 'District domicile registry number'
      },
      {
        canonicalField: 'verificationStatus',
        sourceField: 'approval_flag',
        transformationRule: 'approval_flag === "Y" ? "VERIFIED" : "NOT_VERIFIED"',
        description: 'Translates legacy Y/N flag'
      }
    ],
    updatedAt: '2026-09-02T14:30:00Z'
  }
];

// In-Memory Database Store maintaining live state
class MahasetuDatabase {
  public citizens: CitizenUser[] = [...MOCK_CITIZENS];
  public officers: OfficerUser[] = [...MOCK_OFFICERS];
  public departments: Department[] = [...DEPARTMENTS];
  public services: ServiceDefinition[] = [...SERVICES];
  public consents: ConsentRecord[] = [];
  public dataRequests: DataRequestRecord[] = [];
  public applications: ApplicationRecord[] = [];
  public auditLogs: AuditLog[] = [];
  public apiRegistry: ApiRegistryItem[] = [...INITIAL_API_REGISTRY];
  public schemaMappings: SchemaMapping[] = [...INITIAL_SCHEMA_MAPPINGS];

  constructor() {
    this.seedInitialTransactions();
  }

  private seedInitialTransactions() {
    // Seed initial consent & audit trail for Asha Patil
    const asha = this.citizens[0];
    const initialConsentId = 'con-9901-initial-asha';
    const grantedTime = '2026-09-06T09:15:00Z';
    const expiresTime = '2026-09-07T09:15:00Z';

    const consent: ConsentRecord = {
      id: initialConsentId,
      citizenId: asha.id,
      citizenAadhaarMasked: asha.maskedAadhaar,
      citizenName: asha.name,
      requestingDepartmentCode: 'EDUCATION',
      sourceDepartmentCodes: ['REVENUE', 'DISTRICT_ADMIN'],
      serviceId: 'srv-scholarship-01',
      serviceName: 'Rajarshi Chhatrapati Shahu Maharaj Merit Scholarship',
      purpose: 'Verification of family income & state domicile eligibility',
      dataFields: ['INCOME_CERTIFICATE', 'DOMICILE_CERTIFICATE'],
      grantedAt: grantedTime,
      expiresAt: expiresTime,
      status: 'active',
      authTokenHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    };
    this.consents.push(consent);

    this.auditLogs.push(
      {
        id: 'audit-001',
        actorUserId: asha.id,
        actorName: asha.name,
        actorRole: 'citizen',
        action: 'AUTH_VERIFIED',
        entityType: 'session',
        entityId: asha.id,
        metadata: {
          authMethod: 'AADHAAR_BIOMETRIC_FINGERPRINT',
          uidaiTxn: 'TXN-MH-2026-881920',
          nfiqScore: 92,
          authStatus: 'SUCCESS'
        },
        hashChain: '0000a98f12c4b819f0910243e8812034981fae88129038102381203812039a8f',
        createdAt: '2026-09-06T09:14:30Z'
      },
      {
        id: 'audit-002',
        actorUserId: asha.id,
        actorName: asha.name,
        actorRole: 'citizen',
        action: 'CONSENT_GRANTED',
        entityType: 'consent',
        entityId: initialConsentId,
        sourceDepartment: 'REVENUE',
        targetDepartment: 'EDUCATION',
        metadata: {
          purpose: consent.purpose,
          validityHours: 24,
          requestedFields: consent.dataFields
        },
        hashChain: '14f09a8230948b81204981a8c081293810293801293810293810293810293810',
        createdAt: grantedTime
      },
      {
        id: 'audit-003',
        actorUserId: 'GATEWAY_ORCHESTRATOR',
        actorName: 'Mahasetu Interoperability Gateway',
        actorRole: 'gateway',
        action: 'DATA_REQUESTED',
        entityType: 'data_request',
        entityId: 'dr-88102',
        sourceDepartment: 'REVENUE',
        targetDepartment: 'EDUCATION',
        metadata: {
          adapterUrl: '/api/adapters/revenue/income-certificate/INC-MH-2026-10382',
          consentVerified: true
        },
        hashChain: '38a9012f09812903812093812093810293810293810293810293810293810293',
        createdAt: '2026-09-06T09:15:10Z'
      },
      {
        id: 'audit-004',
        actorUserId: 'GATEWAY_ORCHESTRATOR',
        actorName: 'Mahasetu Interoperability Gateway',
        actorRole: 'gateway',
        action: 'DATA_RETURNED',
        entityType: 'data_request',
        entityId: 'dr-88102',
        sourceDepartment: 'REVENUE',
        targetDepartment: 'EDUCATION',
        metadata: {
          canonicalDocType: 'IncomeCertificate',
          certificateNo: 'INC-MH-2026-10382',
          verificationStatus: 'VERIFIED'
        },
        hashChain: '5f91028309182309182039812039812039812039812039812039812039812039',
        createdAt: '2026-09-06T09:15:22Z'
      }
    );

    // Initial pre-submitted application for Asha
    this.applications.push({
      id: 'app-90182',
      applicationNumber: 'MH-EDU-2026-440192',
      citizenId: asha.id,
      citizenName: asha.name,
      citizenAadhaarMasked: asha.maskedAadhaar,
      serviceId: 'srv-scholarship-01',
      serviceName: 'Rajarshi Chhatrapati Shahu Maharaj Merit Scholarship',
      departmentCode: 'EDUCATION',
      status: 'IN_PROGRESS',
      formData: {
        collegeName: 'COEP Technological University, Pune',
        courseName: 'B.Tech Computer Engineering (Year 3)',
        annualTuitionFee: 85000,
        bankAccountMasked: 'SBIN0001234 - XXXX8910',
        ifscCode: 'SBIN0001234'
      },
      verifiedProofs: [
        {
          fieldCode: 'INCOME_CERTIFICATE',
          sourceDepartment: 'REVENUE',
          verificationStatus: 'VERIFIED',
          certificateNumber: 'INC-MH-2026-10382',
          validUntil: '2027-03-31',
          verifiedAt: '2026-09-06T09:15:22Z',
          canonicalPayload: {
            documentType: 'IncomeCertificate',
            documentNumber: 'INC-MH-2026-10382',
            personName: 'Asha Suresh Patil',
            annualIncomeInr: 120000,
            issuingTaluka: 'Haveli',
            district: 'Pune'
          }
        },
        {
          fieldCode: 'DOMICILE_CERTIFICATE',
          sourceDepartment: 'DISTRICT_ADMIN',
          verificationStatus: 'VERIFIED',
          certificateNumber: 'DOM-MH-2024-88491',
          validUntil: 'PERMANENT',
          verifiedAt: '2026-09-06T09:15:24Z',
          canonicalPayload: {
            documentType: 'DomicileCertificate',
            documentNumber: 'DOM-MH-2024-88491',
            personName: 'Asha Suresh Patil',
            state: 'Maharashtra',
            district: 'Pune'
          }
        }
      ],
      consentId: initialConsentId,
      createdAt: '2026-09-06T09:16:00Z',
      updatedAt: '2026-09-06T09:20:00Z',
      trackingRemarks: 'Cross-department verification successful. Forwarded to Desk Officer for scholarship disbursement approval.'
    });
  }

  // Create an immutable audit log entry with SHA-256 style chaining
  public createAuditLog(entry: Omit<AuditLog, 'id' | 'createdAt' | 'hashChain'>): AuditLog {
    const previousHash = this.auditLogs.length > 0 
      ? this.auditLogs[this.auditLogs.length - 1].hashChain 
      : 'GENESIS_MAHASETU_GOV_MH_BLOCK_00000000000000000000000000000000';

    const timestamp = new Date().toISOString();
    const id = `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Simulate SHA-256 cryptographic digest
    const hashData = `${previousHash}|${entry.actorUserId}|${entry.action}|${entry.entityId}|${timestamp}`;
    let hash = 0;
    for (let i = 0; i < hashData.length; i++) {
      const char = hashData.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    const hashChain = Math.abs(hash).toString(16).padStart(16, '0') + 
      Date.now().toString(16).padStart(16, '0') + 
      'a9b7c8d9e0f123456789abcdef012345';

    const log: AuditLog = {
      id,
      ...entry,
      hashChain,
      createdAt: timestamp
    };
    this.auditLogs.unshift(log);
    return log;
  }
}

export const db = new MahasetuDatabase();
