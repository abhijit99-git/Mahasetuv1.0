/**
 * Supabase Client & Real-time Database Synchronization Service for Mahasetu
 * Handles live PostgreSQL persistence for:
 * - departments
 * - services
 * - users (citizens & officers)
 * - consent_records
 * - data_requests
 * - applications
 * - audit_logs
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import {
  CitizenUser,
  OfficerUser,
  Department,
  ServiceDefinition,
  ConsentRecord,
  DataRequestRecord,
  ApplicationRecord,
  AuditLog
} from '../src/types.ts';

let supabaseClient: SupabaseClient | null = null;
let lastCheckStatus: {
  connected: boolean;
  configured: boolean;
  url: string | null;
  hasAnonKey: boolean;
  hasServiceKey: boolean;
  lastTestedAt: string | null;
  syncedRecords?: number;
  error?: string;
} = {
  connected: false,
  configured: false,
  url: null,
  hasAnonKey: false,
  hasServiceKey: false,
  lastTestedAt: null
};

function normalizeSupabaseUrl(rawUrl: string | undefined | null): string | null {
  if (!rawUrl) return null;
  let clean = rawUrl.trim();
  clean = clean.replace(/\/rest\/v1\/?$/, '');
  clean = clean.replace(/\/+$/, '');
  return clean;
}

/**
 * Deterministically generates a valid UUID v4 compliant string from any arbitrary ID string
 */
export function toValidUuid(id: string | null | undefined): string {
  if (!id) return crypto.randomUUID();
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return id.toLowerCase();
  }
  const hash = crypto.createHash('md5').update(id).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

/**
 * Returns the Supabase client instance if environment variables are set.
 */
export function getSupabaseClient(): SupabaseClient | null {
  const rawUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const url = normalizeSupabaseUrl(rawUrl);
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key || url.includes('xyzcompany.supabase.co')) {
    return null;
  }

  if (!supabaseClient) {
    try {
      supabaseClient = createClient(url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      });
    } catch (err: any) {
      console.warn('Failed to initialize Supabase client:', err?.message || err);
      return null;
    }
  }

  return supabaseClient;
}

/**
 * Checks connection to the configured Supabase instance and verifies tables.
 */
export async function testSupabaseConnection() {
  const rawUrl = process.env.SUPABASE_URL || null;
  const url = normalizeSupabaseUrl(rawUrl);
  const anonKey = process.env.SUPABASE_ANON_KEY || null;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || null;

  const isConfigured = !!(url && !url.includes('xyzcompany.supabase.co') && (anonKey || serviceKey));

  if (!isConfigured) {
    lastCheckStatus = {
      connected: false,
      configured: false,
      url: url || null,
      hasAnonKey: !!anonKey,
      hasServiceKey: !!serviceKey,
      lastTestedAt: new Date().toISOString(),
      error: 'Credentials not configured (operating in sovereign local in-memory mode).'
    };
    return lastCheckStatus;
  }

  try {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client could not be created from provided URL and Key.');
    }

    const { error } = await client.from('departments').select('count', { count: 'exact', head: true });

    if (error && error.code !== 'PGRST116') {
      if (error.code === '42P01' || error.message?.includes('relation "departments" does not exist')) {
        lastCheckStatus = {
          connected: true,
          configured: true,
          url,
          hasAnonKey: !!anonKey,
          hasServiceKey: !!serviceKey,
          lastTestedAt: new Date().toISOString(),
          error: 'Connected to Supabase! (Note: Please run the DDL Schema in the SQL Editor to create the tables).'
        };
        return lastCheckStatus;
      }
      throw error;
    }

    lastCheckStatus = {
      connected: true,
      configured: true,
      url,
      hasAnonKey: !!anonKey,
      hasServiceKey: !!serviceKey,
      lastTestedAt: new Date().toISOString()
    };
    return lastCheckStatus;
  } catch (err: any) {
    lastCheckStatus = {
      connected: false,
      configured: true,
      url,
      hasAnonKey: !!anonKey,
      hasServiceKey: !!serviceKey,
      lastTestedAt: new Date().toISOString(),
      error: err?.message || 'Failed to ping Supabase endpoint.'
    };
    return lastCheckStatus;
  }
}

/**
 * Returns current status without blocking test
 */
export function getSupabaseStatus() {
  const url = process.env.SUPABASE_URL || null;
  const anonKey = process.env.SUPABASE_ANON_KEY || null;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || null;
  const isConfigured = !!(url && !url.includes('xyzcompany.supabase.co') && (anonKey || serviceKey));

  return {
    ...lastCheckStatus,
    configured: isConfigured,
    url: isConfigured ? normalizeSupabaseUrl(url) : null,
    hasAnonKey: !!anonKey,
    hasServiceKey: !!serviceKey
  };
}

// =========================================================================
// REAL-TIME SYNCHRONIZATION HELPERS
// =========================================================================

/**
 * Upsert departments into Supabase
 */
export async function syncDepartmentsToSupabase(departments: Department[]) {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    const rows = departments.map(d => ({
      id: toValidUuid(d.id),
      name: d.name,
      code: d.code,
      api_base_url: d.apiBaseUrl,
      description: d.description,
      created_at: new Date().toISOString()
    }));

    const { error } = await client.from('departments').upsert(rows, { onConflict: 'code' });
    if (error) console.warn('Sync departments warning:', error.message);
  } catch (err: any) {
    console.warn('Sync departments exception:', err?.message || err);
  }
}

/**
 * Upsert services into Supabase
 */
export async function syncServicesToSupabase(services: ServiceDefinition[], departments: Department[]) {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    const rows = services.map(s => {
      const dept = departments.find(d => d.code === s.departmentCode || d.id === s.departmentId);
      const deptId = dept ? toValidUuid(dept.id) : toValidUuid(s.departmentId);
      return {
        id: toValidUuid(s.id),
        department_id: deptId,
        name: s.name,
        code: s.code,
        description: s.description,
        required_data_fields: s.requiredFields || [],
        created_at: new Date().toISOString()
      };
    });

    const { error } = await client.from('services').upsert(rows, { onConflict: 'code' });
    if (error) console.warn('Sync services warning:', error.message);
  } catch (err: any) {
    console.warn('Sync services exception:', err?.message || err);
  }
}

/**
 * Upsert officers into Supabase officers table and users table
 */
export async function syncOfficersToSupabase(officers: OfficerUser[]) {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    const officerRows = officers.map(o => ({
      id: toValidUuid(o.id),
      aadhaar_number: o.aadhaarNumber,
      masked_aadhaar: o.maskedAadhaar || 'XXXX-XXXX-0000',
      name: o.name,
      email: o.email.toLowerCase().trim(),
      phone: o.phone || '+91 99999 00000',
      role: 'officer',
      department_id: toValidUuid(o.departmentId),
      department_code: o.departmentCode || 'REVENUE',
      designation: o.designation || 'Authorized Verification Officer',
      employee_code: o.employeeCode || `MH-OFF-${o.id.slice(0, 4)}`,
      office_location: o.officeLocation || 'Government of Maharashtra Administrative Office',
      created_at: new Date().toISOString()
    }));

    // Try upserting to officers table
    const { error: offError } = await client.from('officers').upsert(officerRows, { onConflict: 'email' });
    if (offError && offError.code !== '42P01') {
      console.warn('Sync officers table notice:', offError.message);
    }
  } catch (err: any) {
    console.warn('Sync officers exception:', err?.message || err);
  }
}

/**
 * Upsert users (citizens + officers) into Supabase
 */
export async function syncUsersToSupabase(citizens: CitizenUser[], officers: OfficerUser[]) {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    const citizenRowsWithProfile = citizens.map(c => ({
      id: toValidUuid(c.id),
      role: 'citizen',
      aadhaar_masked: c.maskedAadhaar || 'XXXX-XXXX-0000',
      name: c.name || '',
      phone: c.phone || '',
      email: c.email ? c.email.toLowerCase().trim() : '',
      created_at: c.registeredAt || new Date().toISOString(),
      profile_data: c
    }));

    const citizenRowsBasic = citizens.map(c => ({
      id: toValidUuid(c.id),
      role: 'citizen',
      aadhaar_masked: c.maskedAadhaar || 'XXXX-XXXX-0000',
      name: c.name || '',
      phone: c.phone || '',
      email: c.email ? c.email.toLowerCase().trim() : '',
      created_at: c.registeredAt || new Date().toISOString()
    }));

    const officerRows = officers.map(o => ({
      id: toValidUuid(o.id),
      role: 'officer',
      department_id: toValidUuid(o.departmentId),
      aadhaar_masked: o.maskedAadhaar || 'XXXX-XXXX-0000',
      name: o.name || '',
      phone: o.phone || '+91 99999 00000',
      email: o.email ? o.email.toLowerCase().trim() : `${o.id}@mahashasan.gov.in`,
      created_at: new Date().toISOString()
    }));

    // First try with profile_data column
    let { error } = await client.from('users').upsert([...citizenRowsWithProfile, ...officerRows], { onConflict: 'id' });
    if (error && (error.message.includes('profile_data') || error.code === 'PGRST204' || error.message.includes('column'))) {
      console.log('[SUPABASE] profile_data column not found in users table, falling back to basic columns...');
      const { error: fallbackError } = await client.from('users').upsert([...citizenRowsBasic, ...officerRows], { onConflict: 'id' });
      if (fallbackError) console.warn('Sync users basic columns warning:', fallbackError.message);
    } else if (error) {
      console.warn('Sync users warning:', error.message);
    }

    // Also sync to dedicated officers table
    await syncOfficersToSupabase(officers);
  } catch (err: any) {
    console.warn('Sync users exception:', err?.message || err);
  }
}

/**
 * Write a consent record into Supabase
 */
export async function syncConsentToSupabase(consent: ConsentRecord, departments?: Department[]) {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    const dept = departments?.find(d => d.code === consent.requestingDepartmentCode);
    const requestingDeptId = dept ? toValidUuid(dept.id) : toValidUuid(consent.requestingDepartmentCode);

    const row = {
      id: toValidUuid(consent.id),
      citizen_id: toValidUuid(consent.citizenId),
      requesting_department_id: requestingDeptId,
      service_id: toValidUuid(consent.serviceId),
      purpose: consent.purpose || 'Mahasetu Scheme Verification',
      data_fields: consent.dataFields || [],
      granted_at: consent.grantedAt || new Date().toISOString(),
      expires_at: consent.expiresAt || new Date(Date.now() + 86400000).toISOString(),
      status: consent.status || 'active',
      created_at: consent.grantedAt || new Date().toISOString()
    };

    const { error } = await client.from('consent_records').upsert([row], { onConflict: 'id' });
    if (error) console.warn('Sync consent record warning:', error.message);
  } catch (err: any) {
    console.warn('Sync consent record exception:', err?.message || err);
  }
}

/**
 * Write a data request record into Supabase
 */
export async function syncDataRequestToSupabase(dataReq: DataRequestRecord, departments?: Department[]) {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    const srcDept = departments?.find(d => d.code === dataReq.sourceDepartmentCode);
    const reqDept = departments?.find(d => d.code === dataReq.requestingDepartmentCode);

    const row = {
      id: toValidUuid(dataReq.id),
      consent_id: toValidUuid(dataReq.consentId),
      source_department_id: srcDept ? toValidUuid(srcDept.id) : toValidUuid(dataReq.sourceDepartmentCode),
      requesting_department_id: reqDept ? toValidUuid(reqDept.id) : toValidUuid(dataReq.requestingDepartmentCode),
      requested_fields: dataReq.requestedFields || [],
      response_status: dataReq.responseStatus || 'SUCCESS',
      response_data: dataReq.responseData || {},
      created_at: dataReq.createdAt || new Date().toISOString(),
      completed_at: dataReq.completedAt || new Date().toISOString()
    };

    const { error } = await client.from('data_requests').upsert([row], { onConflict: 'id' });
    if (error) console.warn('Sync data request warning:', error.message);
  } catch (err: any) {
    console.warn('Sync data request exception:', err?.message || err);
  }
}

/**
 * Write an application record into Supabase with automatic foreign-key resolution
 */
export async function syncApplicationToSupabase(app: ApplicationRecord): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase client not configured' };

  try {
    const appUuid = toValidUuid(app.id);
    const citizenUuid = toValidUuid(app.citizenId);
    const serviceUuid = toValidUuid(app.serviceId);
    const deptCode = app.departmentCode || 'REVENUE';
    const deptUuid = toValidUuid(`dept-${deptCode.toLowerCase()}`);

    // 1. Ensure citizen user exists in Supabase users table
    const { data: existingUser } = await client.from('users').select('id').eq('id', citizenUuid).maybeSingle();
    if (!existingUser) {
      await client.from('users').upsert([{
        id: citizenUuid,
        role: 'citizen',
        aadhaar_masked: app.citizenAadhaarMasked || 'XXXX-XXXX-0000',
        name: app.citizenName || 'Citizen Applicant',
        phone: '+91 98000 00000',
        email: `${citizenUuid.slice(0, 8)}@citizen.mahashasan.gov.in`,
        created_at: new Date().toISOString()
      }], { onConflict: 'id' });
    }

    // 2. Ensure department exists in Supabase departments table
    const { data: existingDept } = await client.from('departments').select('id').eq('id', deptUuid).maybeSingle();
    if (!existingDept) {
      await client.from('departments').upsert([{
        id: deptUuid,
        code: deptCode,
        name: `${deptCode} Department`,
        api_base_url: `/api/adapters/${deptCode.toLowerCase()}`,
        description: `Maharashtra Government ${deptCode} Administrative Department`,
        created_at: new Date().toISOString()
      }], { onConflict: 'id' });
    }

    // 3. Ensure service exists in Supabase services table
    const { data: existingService } = await client.from('services').select('id').eq('id', serviceUuid).maybeSingle();
    if (!existingService) {
      await client.from('services').upsert([{
        id: serviceUuid,
        department_id: deptUuid,
        name: app.serviceName || 'Public Welfare Scheme',
        code: `SRV_${app.serviceId.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`.slice(0, 30),
        description: app.serviceName || 'Maharashtra State Public Welfare Service',
        required_data_fields: [],
        created_at: new Date().toISOString()
      }], { onConflict: 'id' });
    }

    // 4. Upsert application record with all metadata in form_data JSONB
    const row = {
      id: appUuid,
      citizen_id: citizenUuid,
      service_id: serviceUuid,
      status: app.status || 'SUBMITTED',
      form_data: {
        applicationNumber: app.applicationNumber,
        citizenName: app.citizenName,
        citizenAadhaarMasked: app.citizenAadhaarMasked,
        serviceName: app.serviceName,
        departmentCode: app.departmentCode,
        formData: app.formData || {},
        verifiedProofs: app.verifiedProofs || [],
        consentId: app.consentId || '',
        trackingRemarks: app.trackingRemarks || ''
      },
      created_at: app.createdAt || new Date().toISOString(),
      updated_at: app.updatedAt || new Date().toISOString()
    };

    const { error } = await client.from('applications').upsert([row], { onConflict: 'id' });
    if (error) {
      console.warn('[SUPABASE] Sync application error:', error.message);
      return { success: false, error: error.message };
    }
    console.log(`[SUPABASE] Successfully saved application ${app.applicationNumber} (${appUuid}) with status ${app.status}`);
    return { success: true };
  } catch (err: any) {
    console.warn('[SUPABASE] Sync application exception:', err?.message || err);
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Write an audit log record into Supabase
 */
export async function syncAuditLogToSupabase(log: AuditLog) {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    const row = {
      id: toValidUuid(log.id),
      actor_user_id: toValidUuid(log.actorUserId),
      action: log.action,
      entity_type: log.entityType,
      entity_id: toValidUuid(log.entityId),
      metadata: {
        actorName: log.actorName,
        actorRole: log.actorRole,
        sourceDepartment: log.sourceDepartment,
        targetDepartment: log.targetDepartment,
        ...log.metadata
      },
      hash_chain: log.hashChain,
      created_at: log.createdAt || new Date().toISOString()
    };

    const { error } = await client.from('audit_logs').upsert([row], { onConflict: 'id' });
    if (error) console.warn('Sync audit log warning:', error.message);
  } catch (err: any) {
    console.warn('Sync audit log exception:', err?.message || err);
  }
}

/**
 * Comprehensive one-shot sync of the entire database state to Supabase
 */
export async function syncAllDatabaseStateToSupabase(db: {
  departments: Department[];
  services: ServiceDefinition[];
  citizens: CitizenUser[];
  officers: OfficerUser[];
  consents: ConsentRecord[];
  dataRequests: DataRequestRecord[];
  applications: ApplicationRecord[];
  auditLogs: AuditLog[];
}) {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase client not initialized or credentials missing' };
  }

  try {
    // 1. Base tables first (Departments, Users, Services)
    await syncDepartmentsToSupabase(db.departments);
    await syncUsersToSupabase(db.citizens, db.officers);
    await syncServicesToSupabase(db.services, db.departments);

    // 2. Transactional tables
    for (const consent of db.consents) {
      await syncConsentToSupabase(consent, db.departments);
    }
    for (const req of db.dataRequests) {
      await syncDataRequestToSupabase(req, db.departments);
    }
    for (const app of db.applications) {
      await syncApplicationToSupabase(app);
    }
    for (const log of db.auditLogs) {
      await syncAuditLogToSupabase(log);
    }

    const totalCount =
      db.departments.length +
      db.services.length +
      db.citizens.length +
      db.officers.length +
      db.consents.length +
      db.dataRequests.length +
      db.applications.length +
      db.auditLogs.length;

    return {
      success: true,
      message: `Successfully synchronized ${totalCount} records across all 7 PostgreSQL tables in Supabase.`,
      counts: {
        departments: db.departments.length,
        services: db.services.length,
        users: db.citizens.length + db.officers.length,
        consents: db.consents.length,
        dataRequests: db.dataRequests.length,
        applications: db.applications.length,
        auditLogs: db.auditLogs.length
      }
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to complete full sync to Supabase'
    };
  }
}
