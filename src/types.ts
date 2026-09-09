/**
 * Mahasetu - Maharashtra Government Interoperability Platform
 * Shared TypeScript Definitions
 */

export type UserRole = 'citizen' | 'officer' | 'admin';

export type BiometricType = 'FINGERPRINT' | 'IRIS';

export interface CitizenDocument {
  id: string;
  documentType: '712_LAND_EXTRACT' | 'INCOME_CERTIFICATE' | 'CASTE_CERTIFICATE' | 'BANK_PASSBOOK' | 'RATION_CARD';
  title: string;
  fileName?: string;
  fileSize?: string;
  uploadedAt?: string;
  status: 'VERIFIED_DIGILOCKER' | 'UPLOADED' | 'SUBMIT_MANUALLY_LATER' | 'NOT_PROVIDED';
  isManualOption?: boolean;
}

export interface CitizenUser {
  id: string;
  aadhaarNumber: string; // Formatted XXXX-XXXX-XXXX
  maskedAadhaar: string; // XXXX-XXXX-1234
  name: string;
  nameMr?: string;
  nameHi?: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dob: string;
  phone: string;
  email: string;
  address: {
    street: string;
    villageOrCity: string;
    taluka: string;
    district: string;
    state: string;
    pincode: string;
  };
  role: 'citizen';
  photoUrl?: string;
  biometricRegistered: boolean;
  registeredAt: string;

  // Unified Digital Profile extension fields
  isProfileComplete?: boolean;
  category?: 'GENERAL' | 'OBC' | 'SC' | 'ST' | 'VJNT';
  annualIncome?: number;
  rationCardType?: 'YELLOW_BPL' | 'ORANGE' | 'WHITE';
  landHolding?: {
    gatNumber: string;
    areaInAcres: number;
    irrigationType: string;
    village: string;
    taluka: string;
    district: string;
  };
  dbtBankDetails?: {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    isAadhaarSeeded: boolean;
  };
  disabilityStatus?: 'NO' | 'YES';
  documents?: CitizenDocument[];
}

export interface OfficerUser {
  id: string;
  aadhaarNumber: string;
  maskedAadhaar: string;
  name: string;
  role: 'officer';
  departmentId: string;
  departmentCode: DepartmentCode;
  designation: string;
  employeeCode: string;
  officeLocation: string;
}

export type DepartmentCode =
  | 'REVENUE'
  | 'DISTRICT_ADMIN'
  | 'RTO'
  | 'HEALTH'
  | 'EDUCATION'
  | 'WOMEN_CHILD'
  | 'SOCIAL_JUSTICE'
  | 'ENERGY'
  | 'FOOD_CIVIL';

export interface Department {
  id: string;
  name: string;
  nameMr: string;
  nameHi: string;
  code: DepartmentCode;
  apiBaseUrl: string;
  description: string;
  status: 'ONLINE' | 'DEGRADED' | 'MAINTENANCE';
  lastPingMs: number;
  totalHopsServed: number;
}

export interface RequiredDataField {
  id: string;
  sourceDepartmentCode: DepartmentCode;
  fieldCode: string;
  displayName: string;
  displayNameMr: string;
  displayNameHi: string;
  purpose: string;
  retentionHours: number;
  mandatory: boolean;
}

export type ServiceCategory =
  | 'SCHOLARSHIP'
  | 'FARMER_WELFARE'
  | 'TRANSPORT'
  | 'CIVIL_SERVICES'
  | 'HEALTHCARE'
  | 'WOMEN_WELFARE'
  | 'SOCIAL_WELFARE';

export interface ServiceDefinition {
  id: string;
  code: string;
  departmentId: string;
  departmentCode: DepartmentCode;
  name: string;
  nameMr: string;
  nameHi: string;
  description: string;
  descriptionMr: string;
  descriptionHi: string;
  category: ServiceCategory;
  requiredFields: RequiredDataField[];
  slaDays: number;
  feeInr: number;
  benefit?: string;
  benefitMr?: string;
}

export interface RelatedSchemeSuggestion {
  serviceId: string;
  serviceCode: string;
  serviceName: string;
  serviceNameMr?: string;
  department: string;
  departmentCode: DepartmentCode;
  category: string;
  benefit: string;
  matchReason: string;
  slaDays?: number;
  feeInr?: number;
  requiredDocuments: string[];
}

export type ConsentStatus = 'active' | 'revoked' | 'expired';

export interface ConsentRecord {
  id: string;
  citizenId: string;
  citizenAadhaarMasked: string;
  citizenName: string;
  requestingDepartmentCode: DepartmentCode;
  sourceDepartmentCodes: DepartmentCode[];
  serviceId: string;
  serviceName: string;
  purpose: string;
  dataFields: string[];
  grantedAt: string;
  expiresAt: string;
  status: ConsentStatus;
  authTokenHash: string;
  revokedAt?: string;
  revocationReason?: string;
}

export interface DataRequestRecord {
  id: string;
  consentId: string;
  sourceDepartmentCode: DepartmentCode;
  requestingDepartmentCode: DepartmentCode;
  requestedFields: string[];
  responseStatus: 'PENDING' | 'SUCCESS' | 'FAILED';
  responseData: Record<string, unknown>;
  createdAt: string;
  completedAt?: string;
  latencyMs?: number;
}

export type ApplicationStatus = 'SUBMITTED' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED';

export interface ApplicationRecord {
  id: string;
  applicationNumber: string;
  citizenId: string;
  citizenName: string;
  citizenAadhaarMasked: string;
  serviceId: string;
  serviceName: string;
  departmentCode: DepartmentCode;
  status: ApplicationStatus;
  formData: Record<string, unknown>;
  verifiedProofs: Array<{
    fieldCode: string;
    sourceDepartment: DepartmentCode;
    verificationStatus: 'VERIFIED' | 'UNVERIFIED';
    certificateNumber?: string;
    validUntil?: string;
    verifiedAt: string;
    canonicalPayload: Record<string, unknown>;
  }>;
  consentId: string;
  createdAt: string;
  updatedAt: string;
  trackingRemarks?: string;
}

export interface AuditLog {
  id: string;
  actorUserId: string;
  actorName: string;
  actorRole: 'citizen' | 'officer' | 'gateway';
  action: 'CONSENT_GRANTED' | 'CONSENT_REVOKED' | 'DATA_REQUESTED' | 'DATA_RETURNED' | 'APPLICATION_SUBMITTED' | 'APPLICATION_APPROVED' | 'APPLICATION_REJECTED' | 'AUTH_VERIFIED';
  entityType: 'consent' | 'data_request' | 'application' | 'session';
  entityId: string;
  sourceDepartment?: DepartmentCode;
  targetDepartment?: DepartmentCode;
  metadata: Record<string, unknown>;
  hashChain: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor_id: string;
  action: string;
  entity_id: string;
  requesting_dept?: string;
  source_dept?: string;
  details?: any;
  hash: string;
  previous_hash: string;
}

export interface ApiRegistryItem {
  id: string;
  departmentCode: DepartmentCode;
  serviceName: string;
  endpointPath: string;
  method: 'GET' | 'POST' | 'PUT';
  description: string;
  authType: 'MUTUAL_TLS' | 'JWT_BEARER' | 'API_KEY';
  version: string;
  status: 'ACTIVE' | 'DEPRECATED' | 'DRAFT';
  documentationUrl: string;
}

export interface SchemaMapping {
  id: string;
  departmentCode: DepartmentCode;
  serviceName: string;
  sourceSchema: Record<string, unknown>;
  canonicalSchema: Record<string, unknown>;
  mappingRules: Array<{
    canonicalField: string;
    sourceField: string;
    transformationRule?: string;
    description: string;
  }>;
  updatedAt: string;
}

export interface BiometricVerificationPayload {
  aadhaarNumber: string;
  biometricType: BiometricType;
  qualityScore: number; // 0-100
  pidBlockXml: string;
  deviceInfo: {
    make: string;
    model: string;
    rdsVer: string;
    mi: string;
  };
  hmac: string;
}

export interface WelfareScheme {
  id: string;
  name: string;
  nameMr?: string;
  category: string;
  rawCategory: string;
  issuingAuthority: string;
  state: string;
  isNational: boolean;
  isMaharashtra: boolean;
  benefitSummary: string;
  benefitValue: string;
  eligibility: string;
  minAge?: string;
  maxAge?: string;
  maxAnnualIncome?: string;
  allowedOccupations?: string;
  allowedSocialCategories?: string;
  gender?: string;
  requiredDocuments: string[];
  adapters: string[];
  zeroUploadSupported: boolean;
  officialUrl?: string;
  dataQualityScore?: string;
}

export interface SchemeStats {
  totalSchemes: number;
  maharashtraSchemes: number;
  nationalSchemes: number;
  categoryCounts: Record<string, number>;
  zeroUploadEnabled: number;
  activeAdapters: number;
}

export interface SchemeFilter {
  search: string;
  category: string;
  state: string;
  gender: string;
  occupation: string;
  onlyMaharashtra: boolean;
  zeroUploadOnly: boolean;
}
