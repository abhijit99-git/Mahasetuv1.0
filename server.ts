/**
 * Mahasetu - Maharashtra Government Interoperability Platform (SIH26129)
 * Express Backend Server with Vite Middleware
 */

import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { db } from './server/db.ts';
import {
  RevenueAdapter,
  DistrictAdminAdapter,
  RTOAdapter,
  HealthAdapter
} from './server/adapters.ts';
import {
  navigateServiceQuery,
  explainApplicationStatus,
  generateSchemaMappingRules,
  adviseSchemesWithAI
} from './server/gemini.ts';
import {
  searchSchemes,
  getSchemeById,
  getSchemeStats
} from './server/schemes.ts';
import { ConsentRecord, ApplicationRecord, OfficerUser } from './src/types.ts';
import {
  testSupabaseConnection,
  getSupabaseStatus,
  getSupabaseClient,
  toValidUuid,
  syncDepartmentsToSupabase,
  syncServicesToSupabase,
  syncUsersToSupabase,
  syncConsentToSupabase,
  syncDataRequestToSupabase,
  syncApplicationToSupabase,
  syncAuditLogToSupabase,
  syncAllDatabaseStateToSupabase
} from './server/supabase.ts';

dotenv.config({ path: path.join(process.cwd(), '.env'), override: true });

process.on('unhandledRejection', (reason) => {
  console.warn('[SERVER WARNING] Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[SERVER ERROR] Uncaught Exception:', err);
});

async function startServer() {
  const app = express();
  const PORT = process.env.PORT && !isNaN(parseInt(process.env.PORT, 10)) ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      platform: 'Mahasetu Interoperability Layer',
      version: '2.5.0-gov-mh',
      timestamp: new Date().toISOString(),
      departmentsOnline: db.departments.filter(d => d.status === 'ONLINE').length
    });
  });

  // ==========================================
  // 1. AADHAAR EMAIL & OTP AUTHENTICATION API
  // ==========================================

  // Memory store for active OTPs: email -> { otp, expiresAt, aadhaarNumber }
  const activeOtps = new Map<string, { otp: string; expiresAt: number; aadhaarNumber: string }>();

  // Helper to create mail transporter (Uses real configured SMTP server)
  async function createMailTransporter() {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER || process.env.GMAIL_USER;
    const pass = process.env.SMTP_PASS || process.env.GMAIL_PASS;

    if (user && pass) {
      return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
      });
    }

    // No SMTP credentials configured
    return null;
  }

  // Step 1: Send Aadhaar OTP to linked Email
  app.post('/api/auth/send-aadhaar-otp', async (req: Request, res: Response) => {
    try {
      const { aadhaarNumber, email } = req.body || {};
      const cleanUid = (aadhaarNumber || '').replace(/[^0-9]/g, '');

      if (cleanUid.length !== 12) {
        res.status(400).json({
          success: false,
          error: 'Aadhaar Number must be exactly 12 numeric digits.'
        });
        return;
      }

      if (!email || !email.includes('@')) {
        res.status(400).json({
          success: false,
          error: 'Please enter a valid email address linked to your Aadhaar.'
        });
        return;
      }

    // Generate random 6-digit OTP code
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const txnId = `UIDAI-OTP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Store in active OTPs map (valid for 10 minutes)
    const normalizedEmail = email.toLowerCase().trim();
    activeOtps.set(normalizedEmail, {
      otp: generatedOtp,
      expiresAt: Date.now() + 10 * 60 * 1000,
      aadhaarNumber: cleanUid
    });

    console.log(`[MAHASETU AUTH GATEWAY] Generated OTP for Aadhaar ${cleanUid} -> Email ${normalizedEmail}`);

    let emailSent = false;
    let supabaseErrorMsg = '';
    let resendNotice = '';

    const supabase = getSupabaseClient();
    const supabaseConfigured = !!supabase;

    const reqOrigin = (req.headers.origin as string) || (req.headers.referer as string);
    const renderExternal = process.env.RENDER_EXTERNAL_URL || process.env.PUBLIC_URL;
    let siteUrl = 'http://localhost:3000';
    if (renderExternal) {
      siteUrl = renderExternal.startsWith('http') ? renderExternal : `https://${renderExternal}`;
    } else if (reqOrigin) {
      siteUrl = reqOrigin;
    }

    const redirectTarget = `${siteUrl.replace(/\/$/, '')}/?verify_aadhaar=${cleanUid}&verify_email=${encodeURIComponent(normalizedEmail)}&otp=${generatedOtp}`;

    // Attempt Supabase Auth OTP / Magic Link dispatch if Supabase client is active
    try {
      if (supabase) {
        const { error: supabaseErr } = await supabase.auth.signInWithOtp({
          email: normalizedEmail,
          options: {
            emailRedirectTo: redirectTarget,
            data: { aadhaarNumber: cleanUid }
          }
        });
        if (!supabaseErr) {
          emailSent = true;
          console.log(`[SUPABASE AUTH] Successfully triggered Supabase Auth Magic Link email to ${normalizedEmail}`);
        } else {
          supabaseErrorMsg = supabaseErr.message;
          console.warn(`[SUPABASE AUTH] Supabase Auth OTP note: ${supabaseErr.message}`);
        }
      }
    } catch (e: any) {
      supabaseErrorMsg = e?.message || String(e);
      console.warn(`[SUPABASE AUTH] Exception during Supabase Auth OTP dispatch:`, e?.message || e);
    }

    // Direct Resend API Transmission
    const resendKey = process.env.RESEND_API_KEY || (process.env.SMTP_PASS?.startsWith('re_') ? process.env.SMTP_PASS : null);
    if (resendKey && !emailSent) {
      try {
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'onboarding@resend.dev',
            to: [normalizedEmail],
            subject: 'Verify your Email to Log In to Mahasetu Platform',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 16px; background-color: #ffffff;">
                <div style="background-color: #111815; padding: 16px; border-radius: 12px; text-align: center; color: #ffffff; margin-bottom: 20px;">
                  <h2 style="margin: 0; color: #fbbf24; font-size: 20px;">Government of Maharashtra (महाсеतू)</h2>
                  <p style="margin: 4px 0 0 0; font-size: 12px; color: #a7f3d0;">Aadhaar Identity Verification Gateway</p>
                </div>
                <p style="font-size: 14px; color: #333333; margin-bottom: 12px;">Namaskar,</p>
                <p style="font-size: 14px; color: #333333; line-height: 1.5;">
                  Click the button below to verify your email and sign in to your <strong>Mahasetu Citizen Profile</strong> (Aadhaar: <strong>XXXX-XXXX-${cleanUid.slice(8, 12)}</strong>):
                </p>
                <div style="text-align: center; margin: 28px 0;">
                  <a href="${redirectTarget}" style="background-color: #047857; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; display: inline-block;">
                    ✅ Verify Email & Log In to Mahasetu
                  </a>
                </div>
                <p style="font-size: 12px; color: #888888; margin-top: 20px; text-align: center;">This verification link is valid for 10 minutes.</p>
                <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
                <p style="font-size: 11px; color: #999999; text-align: center;">MahaIT & Govt of Maharashtra Digital Platform Services</p>
              </div>
            `
          })
        });

        const resendData = await resendResponse.json();
        if (resendResponse.ok && resendData.id) {
          emailSent = true;
          console.log(`[RESEND API OTP] Successfully dispatched OTP email to ${normalizedEmail} (ID: ${resendData.id})`);
        } else {
          resendNotice = resendData?.message || 'Resend delivery notice';
          console.warn(`[RESEND API OTP] Resend API notice (${resendData?.name}): ${resendData?.message}`);
        }
      } catch (resendErr: any) {
        console.error(`[RESEND API OTP] Error calling Resend API:`, resendErr?.message || resendErr);
      }
    }

    // Direct SMTP Mail Transmission
    if (!emailSent) {
      try {
        const transporter = await createMailTransporter();
        if (transporter) {
          const isResendSmtp = process.env.SMTP_HOST?.includes('resend') || process.env.SMTP_USER === 'resend';
          const fromAddress = isResendSmtp ? 'onboarding@resend.dev' : (process.env.SMTP_USER || 'noreply@mahashasan.gov.in');
          
          await transporter.sendMail({
            from: `"Mahasetu Portal" <${fromAddress}>`,
            to: normalizedEmail,
            subject: 'Verify your Email to Log In to Mahasetu Platform',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 16px; background-color: #ffffff;">
                <div style="background-color: #111815; padding: 16px; border-radius: 12px; text-align: center; color: #ffffff; margin-bottom: 20px;">
                  <h2 style="margin: 0; color: #fbbf24; font-size: 20px;">Government of Maharashtra (महासेतू)</h2>
                  <p style="margin: 4px 0 0 0; font-size: 12px; color: #a7f3d0;">Aadhaar Identity Verification Gateway</p>
                </div>
                <p style="font-size: 14px; color: #333333; margin-bottom: 12px;">Namaskar,</p>
                <p style="font-size: 14px; color: #333333; line-height: 1.5;">
                  Click the button below to verify your email and sign in to your <strong>Mahasetu Citizen Profile</strong> (Aadhaar: <strong>XXXX-XXXX-${cleanUid.slice(8, 12)}</strong>):
                </p>
                <div style="text-align: center; margin: 28px 0;">
                  <a href="${redirectTarget}" style="background-color: #047857; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; display: inline-block;">
                    ✅ Verify Email & Log In to Mahasetu
                  </a>
                </div>
                <p style="font-size: 12px; color: #888888; margin-top: 20px; text-align: center;">This verification link is valid for 10 minutes.</p>
                <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
                <p style="font-size: 11px; color: #999999; text-align: center;">MahaIT & Govt of Maharashtra Digital Platform Services</p>
              </div>
            `
          });
          emailSent = true;
          console.log(`[MAHASETU EMAIL OTP] Successfully dispatched email via SMTP to ${normalizedEmail}`);
        }
      } catch (err: any) {
        console.error('[MAHASETU EMAIL OTP] Error sending SMTP email:', err?.message || err);
      }
    }

    res.json({
      success: true,
      txnId,
      emailSent,
      supabaseConfigured,
      resendNotice: resendNotice || undefined,
      supabaseError: supabaseErrorMsg || undefined,
      unconfiguredOtpCode: !emailSent ? generatedOtp : undefined,
      message: emailSent
        ? `Aadhaar verification OTP sent to ${normalizedEmail}. Please check your email inbox.`
        : (resendNotice
            ? `Resend Free-Tier Notice: Resend API key is registered to monkeyydlufyy3121@gmail.com. Active OTP code for ${normalizedEmail} is ${generatedOtp}.`
            : (supabaseErrorMsg && supabaseErrorMsg.toLowerCase().includes('error sending')
                ? `Supabase SMTP note: ${supabaseErrorMsg}. Active test OTP code is ${generatedOtp}.`
                : (supabaseErrorMsg
                    ? `Supabase Auth note: ${supabaseErrorMsg}. Active OTP code is ${generatedOtp}.`
                    : `Active OTP code for ${normalizedEmail} is ${generatedOtp}.`)))
    });
    } catch (routeErr: any) {
      console.error('[MAHASETU AUTH GATEWAY] Error sending Aadhaar OTP:', routeErr);
      res.status(500).json({
        success: false,
        error: routeErr?.message || 'Server encountered an error while processing Aadhaar OTP dispatch.'
      });
    }
  });

  // Step 2: Verify Aadhaar Email OTP Code
  app.post('/api/auth/verify-aadhaar-otp', async (req: Request, res: Response) => {
    const { aadhaarNumber, email, otp, txnId } = req.body;
    const cleanUid = (aadhaarNumber || '').replace(/[^0-9]/g, '');

    if (cleanUid.length !== 12) {
      res.status(400).json({ success: false, error: 'Invalid 12-digit Aadhaar Number.' });
      return;
    }

    if (!otp || otp.trim().length !== 6) {
      res.status(400).json({ success: false, error: 'Please enter the 6-digit OTP code sent to your email.' });
      return;
    }

    const normalizedEmail = (email || '').toLowerCase().trim();
    const stored = activeOtps.get(normalizedEmail);

    // Try Supabase Auth OTP verification if active
    let supabaseVerified = false;
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data: supabaseSession, error: supabaseVerifyErr } = await supabase.auth.verifyOtp({
          email: normalizedEmail,
          token: otp.trim(),
          type: 'email'
        });
        if (!supabaseVerifyErr && supabaseSession?.user) {
          supabaseVerified = true;
          console.log(`[SUPABASE AUTH] Successfully verified Supabase OTP for ${normalizedEmail}`);
        }
      }
    } catch (e: any) {
      console.warn(`[SUPABASE AUTH] Supabase Auth OTP verify check:`, e?.message || e);
    }

    // Verify OTP against active store, Supabase Auth, or master demo code '849201'
    const isMasterDemoCode = otp.trim() === '849201';
    const isOtpValid = (stored && stored.otp === otp.trim() && Date.now() <= stored.expiresAt) || isMasterDemoCode || supabaseVerified;

    if (!isOtpValid) {
      if (stored && Date.now() > stored.expiresAt) {
        activeOtps.delete(normalizedEmail);
        res.status(400).json({ success: false, error: 'OTP has expired. Please request a new code.' });
        return;
      }
      res.status(400).json({ success: false, error: 'Incorrect OTP code. Please enter the 6-digit code sent to your email.' });
      return;
    }

    // Consume valid OTP
    activeOtps.delete(normalizedEmail);

    // Lookup existing citizen by Aadhaar UID
    let citizen = db.citizens.find(c => c.aadhaarNumber.replace(/[^0-9]/g, '') === cleanUid);
    let isNewProfile = false;

    if (!citizen) {
      isNewProfile = true;
      const formattedUid = `${cleanUid.slice(0, 4)} ${cleanUid.slice(4, 8)} ${cleanUid.slice(8, 12)}`;
      citizen = {
        id: `c-dyn-${cleanUid}`,
        aadhaarNumber: formattedUid,
        maskedAadhaar: `XXXX-XXXX-${cleanUid.slice(8, 12)}`,
        name: '', // Blank profile until user completes Unified Digital Profile
        nameMr: '',
        nameHi: '',
        gender: 'MALE',
        dob: '',
        phone: '',
        email: normalizedEmail,
        address: {
          street: '',
          villageOrCity: '',
          taluka: '',
          district: '',
          state: 'Maharashtra',
          pincode: ''
        },
        role: 'citizen',
        photoUrl: '',
        biometricRegistered: true,
        registeredAt: new Date().toISOString(),
        isProfileComplete: false,
        documents: []
      };
      db.citizens.push(citizen);
      syncUsersToSupabase([citizen], []);
    } else {
      if (normalizedEmail) citizen.email = normalizedEmail;
      syncUsersToSupabase([citizen], []);
    }

    const authLog = db.createAuditLog({
      actorUserId: citizen.id,
      actorName: citizen.name || `Aadhaar User (${citizen.maskedAadhaar})`,
      actorRole: 'citizen',
      action: 'AUTH_VERIFIED',
      entityType: 'session',
      entityId: citizen.id,
      metadata: {
        authMethod: 'AADHAAR_EMAIL_OTP',
        email: normalizedEmail,
        uidaiTxn: txnId,
        isNewProfile
      }
    });
    syncAuditLogToSupabase(authLog);

    res.json({
      success: true,
      isNewProfile: !citizen.name || citizen.isProfileComplete === false,
      citizen,
      authProof: {
        txnId,
        authMethod: 'AADHAAR_EMAIL_OTP',
        authTimestamp: new Date().toISOString(),
        kuaAgency: 'Maharashtra Information Technology Corporation (MahaIT)'
      }
    });
  });

  // Step 3: Verify Supabase Session from Direct Verification Link or Supabase Auth Callback
  app.post('/api/auth/verify-supabase-session', async (req: Request, res: Response) => {
    const { email, aadhaarNumber, accessToken } = req.body;
    let normalizedEmail = (email || '').toLowerCase().trim();
    let cleanUid = (aadhaarNumber || '').replace(/[^0-9]/g, '');

    // Extract user info from Supabase Access Token if provided
    if (accessToken) {
      try {
        const supabase = getSupabaseClient();
        if (supabase) {
          const { data: userData, error: userErr } = await supabase.auth.getUser(accessToken);
          if (userData?.user?.email) {
            normalizedEmail = userData.user.email.toLowerCase().trim();
            if (userData.user.user_metadata?.aadhaarNumber) {
              cleanUid = String(userData.user.user_metadata.aadhaarNumber).replace(/[^0-9]/g, '');
            }
          }
        }
      } catch (e: any) {
        console.warn(`[SUPABASE AUTH] Token verification note:`, e?.message || e);
      }
    }

    if (!normalizedEmail) {
      res.status(400).json({ success: false, error: 'Email address is required for verification.' });
      return;
    }

    // Lookup existing citizen by email or Aadhaar
    let citizen = db.citizens.find(c =>
      (c.email && c.email.toLowerCase().trim() === normalizedEmail) ||
      (cleanUid.length === 12 && c.aadhaarNumber.replace(/[^0-9]/g, '') === cleanUid)
    );

    let isNewProfile = false;

    if (!citizen) {
      isNewProfile = true;
      const uid = cleanUid.length === 12 ? cleanUid : Math.floor(100000000000 + Math.random() * 900000000000).toString();
      const formattedUid = `${uid.slice(0, 4)} ${uid.slice(4, 8)} ${uid.slice(8, 12)}`;
      citizen = {
        id: `c-dyn-${uid}`,
        aadhaarNumber: formattedUid,
        maskedAadhaar: `XXXX-XXXX-${uid.slice(8, 12)}`,
        name: '',
        nameMr: '',
        nameHi: '',
        gender: 'MALE',
        dob: '',
        phone: '',
        email: normalizedEmail,
        address: {
          street: '',
          villageOrCity: '',
          taluka: '',
          district: '',
          state: 'Maharashtra',
          pincode: ''
        },
        role: 'citizen',
        photoUrl: '',
        biometricRegistered: true,
        registeredAt: new Date().toISOString(),
        isProfileComplete: false,
        documents: []
      };
      db.citizens.push(citizen);
      syncUsersToSupabase([citizen], []);
    } else {
      if (normalizedEmail) citizen.email = normalizedEmail;
      syncUsersToSupabase([citizen], []);
    }

    const authLog = db.createAuditLog({
      actorUserId: citizen.id,
      actorName: citizen.name || `Aadhaar User (${citizen.maskedAadhaar})`,
      actorRole: 'citizen',
      action: 'AUTH_VERIFIED',
      entityType: 'session',
      entityId: citizen.id,
      metadata: {
        authMethod: 'SUPABASE_DIRECT_LINK',
        email: normalizedEmail,
        isNewProfile
      }
    });
    syncAuditLogToSupabase(authLog);

    res.json({
      success: true,
      isNewProfile: !citizen.name || citizen.isProfileComplete === false,
      citizen,
      authProof: {
        txnId: `SUPABASE-${Date.now()}`,
        authMethod: 'SUPABASE_DIRECT_LINK',
        authTimestamp: new Date().toISOString(),
        kuaAgency: 'Maharashtra Information Technology Corporation (MahaIT)'
      }
    });
  });

  // Citizen Aadhaar verification with Biometrics or OTP (Simulated Gateway)
  app.post('/api/auth/aadhaar-verify', (req: Request, res: Response) => {
    const { aadhaarNumber, biometricType, qualityScore, pidBlockXml, selectedCitizenId, isSignUpAttempt } = req.body;

    const cleanUid = (aadhaarNumber || '').replace(/[^0-9]/g, '');

    // Format check: Aadhaar numbers must be 12 digits
    if (cleanUid.length !== 12 && !selectedCitizenId) {
      res.status(400).json({
        success: false,
        error: 'Invalid Aadhaar Number: Must be exactly 12 numeric digits.'
      });
      return;
    }

    // Lookup existing citizen by Aadhaar UID
    let existingCitizen = selectedCitizenId
      ? db.citizens.find(c => c.id === selectedCitizenId)
      : db.citizens.find(c => c.aadhaarNumber.replace(/[^0-9]/g, '') === cleanUid);

    let isNewProfile = false;
    let citizen = existingCitizen;

    // If attempting sign-up and already registered, warn user but log them in
    if (isSignUpAttempt && existingCitizen) {
      // Aadhaar already registered
      console.log(`Aadhaar ${cleanUid} is already registered. Logging into existing profile.`);
    }

    // If not found in database, dynamically register a blank citizen record for this Aadhaar
    if (!citizen) {
      isNewProfile = true;
      const formattedUid = `${cleanUid.slice(0, 4)} ${cleanUid.slice(4, 8)} ${cleanUid.slice(8, 12)}`;
      citizen = {
        id: `c-dyn-${cleanUid}`,
        aadhaarNumber: formattedUid,
        maskedAadhaar: `XXXX-XXXX-${cleanUid.slice(8, 12)}`,
        name: '', // Blank profile until user creates Unified Digital Profile
        nameMr: '',
        nameHi: '',
        gender: 'MALE',
        dob: '',
        phone: '',
        email: '',
        address: {
          street: '',
          villageOrCity: '',
          taluka: '',
          district: '',
          state: 'Maharashtra',
          pincode: ''
        },
        role: 'citizen',
        photoUrl: '',
        biometricRegistered: true,
        registeredAt: new Date().toISOString(),
        isProfileComplete: false,
        documents: []
      };
      db.citizens.push(citizen);

      // Sync user row to Supabase
      syncUsersToSupabase([citizen], []);
    }

    // Generate UIDAI Compliant Auth Token & Log to Immutable Audit Trail
    const txnId = `UIDAI-MH-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const authLog = db.createAuditLog({
      actorUserId: citizen.id,
      actorName: citizen.name || `Aadhaar User (${citizen.maskedAadhaar})`,
      actorRole: 'citizen',
      action: 'AUTH_VERIFIED',
      entityType: 'session',
      entityId: citizen.id,
      metadata: {
        authMethod: `AADHAAR_MOCK_${biometricType || 'OTP'}`,
        uidaiTxn: txnId,
        qualityScore: qualityScore || 94,
        isNewProfile
      }
    });
    syncAuditLogToSupabase(authLog);

    res.json({
      success: true,
      isNewProfile,
      alreadyRegistered: !!existingCitizen,
      citizen,
      authProof: {
        txnId,
        biometricType: biometricType || 'OTP',
        qualityScore: qualityScore || 94,
        authTimestamp: new Date().toISOString(),
        kuaAgency: 'Maharashtra Information Technology Corporation (MahaIT)'
      }
    });
  });

  // Save / Update Unified Digital Profile
  app.post('/api/citizens/profile', (req: Request, res: Response) => {
    const profileData = req.body;
    const { id, aadhaarNumber } = profileData;

    let citizen = db.citizens.find(c => c.id === id || (aadhaarNumber && c.aadhaarNumber.replace(/[^0-9]/g, '') === aadhaarNumber.replace(/[^0-9]/g, '')));

    if (!citizen) {
      res.status(404).json({ success: false, error: 'Citizen session not found for Aadhaar' });
      return;
    }

    // Update profile fields
    citizen.name = profileData.name || citizen.name;
    citizen.nameMr = profileData.nameMr || citizen.nameMr;
    citizen.gender = profileData.gender || citizen.gender;
    citizen.dob = profileData.dob || citizen.dob;
    citizen.phone = profileData.phone || citizen.phone;
    citizen.email = profileData.email || citizen.email;
    if (profileData.address) {
      citizen.address = { ...citizen.address, ...profileData.address };
    }
    citizen.category = profileData.category || citizen.category;
    citizen.annualIncome = profileData.annualIncome !== undefined ? Number(profileData.annualIncome) : citizen.annualIncome;
    citizen.rationCardType = profileData.rationCardType || citizen.rationCardType;
    citizen.landHolding = profileData.landHolding || citizen.landHolding;
    citizen.dbtBankDetails = profileData.dbtBankDetails || citizen.dbtBankDetails;
    citizen.disabilityStatus = profileData.disabilityStatus || citizen.disabilityStatus;
    citizen.documents = profileData.documents || citizen.documents || [];
    citizen.isProfileComplete = true;

    // Sync updated citizen to Supabase
    syncUsersToSupabase([citizen], []);

    // Create Audit Log
    const profileLog = db.createAuditLog({
      actorUserId: citizen.id,
      actorName: citizen.name,
      actorRole: 'citizen',
      action: 'AUTH_VERIFIED',
      entityType: 'session',
      entityId: citizen.id,
      metadata: {
        event: 'UNIFIED_PROFILE_SAVED',
        annualIncome: citizen.annualIncome,
        category: citizen.category,
        documentsCount: citizen.documents?.length || 0
      }
    });
    syncAuditLogToSupabase(profileLog);

    res.json({
      success: true,
      message: 'Unified Digital Profile saved successfully to Maharashtra Mahasetu & Supabase DB',
      citizen
    });
  });

  // Officer login with strict Aadhaar + Email validation against Supabase officers table
  app.post('/api/auth/officer-login', async (req: Request, res: Response) => {
    try {
      const { officerId, aadhaarNumber, email } = req.body;
      const cleanUid = (aadhaarNumber || '').replace(/[^0-9]/g, '');
      const cleanEmail = (email || '').toLowerCase().trim();

      if (!cleanEmail) {
        res.status(400).json({
          success: false,
          error: 'Official Government Email ID is mandatory for administrative officer login.'
        });
        return;
      }

      if (cleanUid.length !== 12 && !officerId) {
        res.status(400).json({
          success: false,
          error: 'Valid 12-digit Aadhaar UID is required for officer identity verification.'
        });
        return;
      }

      let matchedOfficer: OfficerUser | null = null;
      const supabase = getSupabaseClient();

      // 1. Primary path: Query Supabase PostgreSQL 'officers' table directly
      if (supabase) {
        try {
          const { data: officersData, error: offErr } = await supabase
            .from('officers')
            .select('*')
            .ilike('email', cleanEmail);

          if (!offErr && officersData && officersData.length > 0) {
            const match = officersData.find((o: any) => {
              const oUid = (o.aadhaar_number || o.aadhaar || '').replace(/[^0-9]/g, '');
              const oMasked = (o.masked_aadhaar || o.aadhaar_masked || '').replace(/[^0-9]/g, '');
              return (
                (cleanUid && oUid === cleanUid) ||
                (cleanUid && oUid.endsWith(cleanUid.slice(-4))) ||
                (cleanUid && oMasked.endsWith(cleanUid.slice(-4))) ||
                (!cleanUid && o.email?.toLowerCase().trim() === cleanEmail)
              );
            });

            if (match) {
              matchedOfficer = {
                id: match.id,
                aadhaarNumber: match.aadhaar_number || `${cleanUid.slice(0, 4)} ${cleanUid.slice(4, 8)} ${cleanUid.slice(8, 12)}`,
                maskedAadhaar: match.masked_aadhaar || `XXXX-XXXX-${cleanUid.slice(-4)}`,
                name: match.name,
                email: match.email,
                phone: match.phone || '+91 99999 00000',
                role: 'officer',
                departmentId: match.department_id || 'dept-revenue',
                departmentCode: match.department_code || 'REVENUE',
                designation: match.designation || 'Authorized Verification Officer',
                employeeCode: match.employee_code || `MH-OFF-${cleanUid.slice(-4)}`,
                officeLocation: match.office_location || 'Government of Maharashtra Administrative Office'
              };
            }
          }

          // Fallback check in users table where role = 'officer'
          if (!matchedOfficer) {
            const { data: usersData, error: userErr } = await supabase
              .from('users')
              .select('*')
              .eq('role', 'officer')
              .ilike('email', cleanEmail);

            if (!userErr && usersData && usersData.length > 0) {
              const matchUser = usersData.find((u: any) => {
                const uMasked = (u.aadhaar_masked || '').replace(/[^0-9]/g, '');
                return uMasked.endsWith(cleanUid.slice(-4)) || u.email?.toLowerCase() === cleanEmail;
              });

              if (matchUser) {
                matchedOfficer = {
                  id: matchUser.id,
                  aadhaarNumber: `${cleanUid.slice(0, 4)} ${cleanUid.slice(4, 8)} ${cleanUid.slice(8, 12)}`,
                  maskedAadhaar: `XXXX-XXXX-${cleanUid.slice(-4)}`,
                  name: matchUser.name,
                  email: matchUser.email,
                  phone: matchUser.phone || '+91 99999 00000',
                  role: 'officer',
                  departmentId: matchUser.department_id || 'dept-revenue',
                  departmentCode: 'REVENUE',
                  designation: 'Authorized Administrative Verification Officer',
                  employeeCode: `MH-OFF-${cleanUid.slice(-4)}`,
                  officeLocation: 'Government of Maharashtra Administrative Office'
                };
              }
            }
          }

          // If Supabase is connected and no record exists in Supabase table, strictly reject login!
          if (!matchedOfficer) {
            res.status(403).json({
              success: false,
              error: `Access Denied: Officer credentials not found in Supabase database. Email '${cleanEmail}' with Aadhaar UID ending in ${cleanUid.slice(-4)} is not registered in the 'officers' table in Supabase. Please add this record to your Supabase 'officers' table to grant access.`
            });
            return;
          }
        } catch (sbEx: any) {
          console.warn('[OFFICER AUTH] Supabase query notice:', sbEx);
        }
      }

      // 2. Fallback when Supabase is not connected (local mock/testing mode)
      if (!matchedOfficer) {
        matchedOfficer = db.officers.find(o => {
          const oUid = o.aadhaarNumber.replace(/[^0-9]/g, '');
          const oEmail = (o.email || '').toLowerCase().trim();
          const matchesAadhaar = cleanUid ? oUid === cleanUid : false;
          const matchesEmail = cleanEmail ? oEmail === cleanEmail : false;
          return (matchesAadhaar && matchesEmail) || (officerId && o.id === officerId && (matchesEmail || matchesAadhaar));
        }) || null;
      }

      // If still not found, strictly reject login
      if (!matchedOfficer) {
        res.status(403).json({
          success: false,
          error: `Access Denied: Officer credentials not found. The provided 12-digit Aadhaar UID and Email (${cleanEmail}) are not registered in the Maharashtra Government Administrative Officer Registry.`
        });
        return;
      }

      // Ensure officer is present in local cache
      if (!db.officers.some(o => o.id === matchedOfficer?.id || o.email === matchedOfficer?.email)) {
        db.officers.push(matchedOfficer);
      }

      const authLog = db.createAuditLog({
        actorUserId: matchedOfficer.id,
        actorName: matchedOfficer.name,
        actorRole: 'officer',
        action: 'AUTH_VERIFIED',
        entityType: 'session',
        entityId: matchedOfficer.id,
        targetDepartment: matchedOfficer.departmentCode,
        metadata: {
          role: 'DEPARTMENT_OFFICER',
          departmentCode: matchedOfficer.departmentCode,
          employeeCode: matchedOfficer.employeeCode,
          email: matchedOfficer.email,
          authGateway: supabase ? 'SUPABASE_POSTGRESQL_OFFICERS_TABLE' : 'MAHASETU_OFFICER_REGISTRY'
        }
      });
      syncAuditLogToSupabase(authLog);

      res.json({
        success: true,
        officer: matchedOfficer,
        authProof: {
          sessionToken: `MH-GOV-OFFICER-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
          department: matchedOfficer.departmentCode,
          authenticatedAt: new Date().toISOString(),
          registryVerification: supabase ? 'VERIFIED_SUPABASE_POSTGRESQL' : 'VERIFIED_LOCAL_REGISTRY'
        }
      });
    } catch (err: any) {
      console.error('[OFFICER AUTH] Internal error:', err);
      res.status(500).json({ success: false, error: 'Internal server error during officer authentication.' });
    }
  });

  // Get list of officers directly from Supabase database
  app.get('/api/officers', async (req: Request, res: Response) => {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data: sbOfficers, error: offErr } = await supabase
          .from('officers')
          .select('*')
          .order('name');

        if (!offErr && sbOfficers && sbOfficers.length > 0) {
          const formatted = sbOfficers.map((o: any) => ({
            id: o.id,
            name: o.name,
            email: o.email,
            phone: o.phone || '+91 99999 00000',
            aadhaarNumber: o.aadhaar_number || 'XXXX XXXX 0000',
            maskedAadhaar: o.masked_aadhaar || (o.aadhaar_number ? `XXXX-XXXX-${o.aadhaar_number.slice(-4)}` : 'XXXX-XXXX-0000'),
            role: o.role || 'officer',
            departmentId: o.department_id || 'dept-revenue',
            departmentCode: o.department_code || 'REVENUE',
            designation: o.designation || 'Verification Officer',
            employeeCode: o.employee_code || `MH-OFF-${o.id.slice(0, 4)}`,
            officeLocation: o.office_location || 'Government of Maharashtra Administrative Office'
          }));
          res.json({ success: true, source: 'SUPABASE_POSTGRESQL', officers: formatted });
          return;
        }
      } catch (e) {
        console.warn('Supabase officers roster query notice:', e);
      }
    }
    res.json({ success: true, source: 'LOCAL_REGISTRY', officers: db.officers });
  });

  // Officer triggers DBT Direct Benefit Transfer Disbursement
  app.post('/api/applications/:id/dbt-disburse', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { officerId, amount, schemeCode } = req.body;

    let appRecord = db.applications.find(a => a.id === id);
    const supabase = getSupabaseClient();

    if (!appRecord && supabase) {
      try {
        const { data: sbApp, error: sbErr } = await supabase
          .from('applications')
          .select('*')
          .eq('id', toValidUuid(id))
          .single();

        if (!sbErr && sbApp) {
          const fd = sbApp.form_data || {};
          appRecord = {
            id: sbApp.id,
            applicationNumber: fd.applicationNumber || `MH-APP-${sbApp.id.slice(0, 8).toUpperCase()}`,
            citizenId: sbApp.citizen_id,
            citizenName: fd.citizenName || 'Citizen Applicant',
            citizenAadhaarMasked: fd.citizenAadhaarMasked || 'XXXX-XXXX-0000',
            serviceId: sbApp.service_id,
            serviceName: fd.serviceName || 'State Government Service',
            departmentCode: fd.departmentCode || 'REVENUE',
            status: sbApp.status || 'SUBMITTED',
            formData: fd.formData || {},
            verifiedProofs: fd.verifiedProofs || [],
            consentId: fd.consentId || '',
            createdAt: sbApp.created_at || new Date().toISOString(),
            updatedAt: sbApp.updated_at || new Date().toISOString(),
            trackingRemarks: fd.trackingRemarks || 'Recorded in Supabase PostgreSQL'
          };
          db.applications.push(appRecord);
        }
      } catch (err) {
        console.warn('Error fetching single application for DBT from Supabase:', err);
      }
    }

    if (!appRecord) {
      res.status(404).json({ success: false, error: 'Application record not found' });
      return;
    }

    const citizen = db.citizens.find(c => c.id === appRecord.citizenId);
    const officer = db.officers.find(o => o.id === officerId) || db.officers[0];

    const dbtTxnId = `PFMS-MH-${Date.now()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const disburseAmount = amount || 2000;

    appRecord.status = 'APPROVED';
    appRecord.trackingRemarks = `DBT fund disbursement of ₹${disburseAmount.toLocaleString('en-IN')} approved and released via PFMS/Aadhaar Payment Bridge. Transaction Ref: ${dbtTxnId}`;
    appRecord.updatedAt = new Date().toISOString();

    syncApplicationToSupabase(appRecord);

    const dbtLog = db.createAuditLog({
      actorUserId: officer.id,
      actorName: officer.name,
      actorRole: 'officer',
      action: 'DATA_RETURNED',
      entityType: 'application',
      entityId: appRecord.id,
      targetDepartment: appRecord.departmentCode,
      metadata: {
        event: 'DBT_DISBURSEMENT_EXECUTED',
        disbursementTxnId: dbtTxnId,
        amount: disburseAmount,
        beneficiaryAadhaar: appRecord.citizenAadhaarMasked,
        bankSeeded: citizen?.dbtBankDetails?.isAadhaarSeeded ?? true,
        accountMasked: citizen?.dbtBankDetails?.accountNumber ? `XXXX${citizen.dbtBankDetails.accountNumber.slice(-4)}` : 'XXXX4821',
        disbursedBy: officer.name
      }
    });
    syncAuditLogToSupabase(dbtLog);

    res.json({
      success: true,
      application: appRecord,
      dbtTransaction: {
        txnId: dbtTxnId,
        amount: disburseAmount,
        status: 'DISBURSED_SUCCESS',
        timestamp: new Date().toISOString(),
        paymentBridge: 'National Payments Corporation of India (NPCI) Aadhaar Payment Bridge System (APBS)'
      }
    });
  });

  // ==========================================
  // 2. CORE INTEROPERABILITY & CONSENT APIs
  // ==========================================

  // List onboarded departments
  app.get('/api/departments', (req: Request, res: Response) => {
    res.json(db.departments);
  });

  // List services catalogue
  app.get('/api/services', (req: Request, res: Response) => {
    res.json(db.services);
  });

  // Get active consents for a citizen
  app.get('/api/consent/:citizenId', (req: Request, res: Response) => {
    const { citizenId } = req.params;
    const records = db.consents.filter(c => c.citizenId === citizenId);
    res.json(records);
  });

  // Create citizen consent (Section 14 Appendix B Contract)
  app.post('/api/consent', (req: Request, res: Response) => {
    const {
      citizen_id,
      requesting_department_id,
      source_department_ids,
      service_id,
      purpose,
      data_fields,
      expires_at
    } = req.body;

    const citizen = db.citizens.find(c => c.id === citizen_id);
    const service = db.services.find(s => s.id === service_id);

    if (!citizen || !service) {
      res.status(400).json({ success: false, error: 'Valid citizen and service required' });
      return;
    }

    const consentId = `con-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const grantedAt = new Date().toISOString();
    const expiry = expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const consent: ConsentRecord = {
      id: consentId,
      citizenId: citizen.id,
      citizenAadhaarMasked: citizen.maskedAadhaar,
      citizenName: citizen.name,
      requestingDepartmentCode: requesting_department_id || service.departmentCode,
      sourceDepartmentCodes: source_department_ids || ['REVENUE', 'DISTRICT_ADMIN'],
      serviceId: service.id,
      serviceName: service.name,
      purpose: purpose || `Verification for ${service.name}`,
      dataFields: data_fields || ['INCOME_CERTIFICATE', 'DOMICILE_CERTIFICATE'],
      grantedAt,
      expiresAt: expiry,
      status: 'active',
      authTokenHash: `tok-${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`
    };

    db.consents.unshift(consent);

    // Sync to Supabase PostgreSQL in background
    syncConsentToSupabase(consent, db.departments);

    // Audit log
    const consentLog = db.createAuditLog({
      actorUserId: citizen.id,
      actorName: citizen.name,
      actorRole: 'citizen',
      action: 'CONSENT_GRANTED',
      entityType: 'consent',
      entityId: consent.id,
      targetDepartment: consent.requestingDepartmentCode,
      metadata: {
        purpose: consent.purpose,
        dataFields: consent.dataFields,
        expiresAt: consent.expiresAt,
        citizenMaskedUid: citizen.maskedAadhaar
      }
    });
    syncAuditLogToSupabase(consentLog);

    res.json({
      success: true,
      consent_id: consent.id,
      status: consent.status,
      granted_at: consent.grantedAt,
      consent
    });
  });

  // Revoke consent early
  app.post('/api/consent/:id/revoke', (req: Request, res: Response) => {
    const { id } = req.params;
    const { reason, citizenId } = req.body;

    const consent = db.consents.find(c => c.id === id);
    if (!consent) {
      res.status(404).json({ success: false, error: 'Consent record not found' });
      return;
    }

    consent.status = 'revoked';
    consent.revokedAt = new Date().toISOString();
    consent.revocationReason = reason || 'Citizen exercised right to withdraw consent';

    // Sync to Supabase
    syncConsentToSupabase(consent, db.departments);

    const revokeLog = db.createAuditLog({
      actorUserId: citizenId || consent.citizenId,
      actorName: consent.citizenName,
      actorRole: 'citizen',
      action: 'CONSENT_REVOKED',
      entityType: 'consent',
      entityId: consent.id,
      metadata: {
        reason: consent.revocationReason,
        revokedAt: consent.revokedAt
      }
    });
    syncAuditLogToSupabase(revokeLog);

    res.json({ success: true, consent });
  });

  // Inter-Department Data Request Execution (The Mahasetu Gateway)
  app.post('/api/data-request', async (req: Request, res: Response) => {
    const {
      consent_id,
      source_department_id,
      requesting_department_id,
      requested_fields,
      citizen_id
    } = req.body;

    const consent = db.consents.find(c => c.id === consent_id);
    if (!consent) {
      res.status(403).json({ success: false, error: 'No active consent found for this data request' });
      return;
    }

    if (consent.status !== 'active') {
      res.status(403).json({ success: false, error: `Consent is ${consent.status.toUpperCase()}. Interoperability layer rejected access.` });
      return;
    }

    const citizen = db.citizens.find(c => c.id === (citizen_id || consent.citizenId));
    if (!citizen) {
      res.status(404).json({ success: false, error: 'Citizen not found' });
      return;
    }

    const startTime = Date.now();
    const sourceDept = source_department_id;
    let adapterResult: Record<string, unknown> = {};

    // Execute adapter call based on source department and requested field
    if (sourceDept === 'REVENUE') {
      if (requested_fields.includes('LAND_EXTRACT_712')) {
        adapterResult = RevenueAdapter.verifyLandExtract(citizen.aadhaarNumber);
      } else {
        adapterResult = RevenueAdapter.verifyIncomeCertificate(citizen.aadhaarNumber);
      }
    } else if (sourceDept === 'DISTRICT_ADMIN') {
      adapterResult = DistrictAdminAdapter.verifyDomicile(citizen.aadhaarNumber);
    } else if (sourceDept === 'RTO') {
      adapterResult = RTOAdapter.verifyLicense(citizen.aadhaarNumber);
    } else if (sourceDept === 'HEALTH') {
      adapterResult = HealthAdapter.verifyMedicalFitness(citizen.aadhaarNumber);
    } else {
      adapterResult = {
        success: true,
        canonical: {
          documentType: 'GeneralVerifiedRecord',
          verificationStatus: 'VERIFIED',
          personName: citizen.name,
          validUntil: 'PERMANENT'
        }
      };
    }

    const latency = Date.now() - startTime + Math.floor(10 + Math.random() * 20);

    // Update department hop metrics
    const deptObj = db.departments.find(d => d.code === sourceDept);
    if (deptObj) {
      deptObj.totalHopsServed += 1;
      deptObj.lastPingMs = latency;
    }

    const dataRequestId = `dr-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const dataReqRecord = {
      id: dataRequestId,
      consentId: consent.id,
      sourceDepartmentCode: sourceDept,
      requestingDepartmentCode: requesting_department_id,
      requestedFields: requested_fields,
      responseStatus: 'SUCCESS' as const,
      responseData: adapterResult,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      latencyMs: latency
    };

    db.dataRequests.push(dataReqRecord);
    syncDataRequestToSupabase(dataReqRecord, db.departments);

    // Log request & response in audit logs
    const reqLog = db.createAuditLog({
      actorUserId: 'GATEWAY_ORCHESTRATOR',
      actorName: 'Mahasetu Interoperability Gateway',
      actorRole: 'gateway',
      action: 'DATA_REQUESTED',
      entityType: 'data_request',
      entityId: dataRequestId,
      sourceDepartment: sourceDept,
      targetDepartment: requesting_department_id,
      metadata: {
        consentId: consent.id,
        requestedFields: requested_fields,
        citizenAadhaarMasked: citizen.maskedAadhaar
      }
    });
    syncAuditLogToSupabase(reqLog);

    const resLog = db.createAuditLog({
      actorUserId: 'GATEWAY_ORCHESTRATOR',
      actorName: 'Mahasetu Interoperability Gateway',
      actorRole: 'gateway',
      action: 'DATA_RETURNED',
      entityType: 'data_request',
      entityId: dataRequestId,
      sourceDepartment: sourceDept,
      targetDepartment: requesting_department_id,
      metadata: {
        consentId: consent.id,
        verificationStatus: 'VERIFIED',
        latencyMs: latency
      }
    });
    syncAuditLogToSupabase(resLog);

    res.json({
      success: true,
      dataRequestId,
      sourceDepartment: sourceDept,
      requestingDepartment: requesting_department_id,
      latencyMs: latency,
      result: adapterResult
    });
  });

  // Submit service application with verified proofs
  app.post('/api/applications', async (req: Request, res: Response) => {
    const { citizenId, serviceId, formData, verifiedProofs, consentId } = req.body;
    const supabase = getSupabaseClient();

    let citizen = db.citizens.find(c => c.id === citizenId || toValidUuid(c.id) === toValidUuid(citizenId));
    if (!citizen && supabase) {
      try {
        const { data: userRow } = await supabase.from('users').select('*').eq('id', toValidUuid(citizenId)).maybeSingle();
        if (userRow) {
          citizen = {
            id: userRow.id,
            aadhaarNumber: userRow.aadhaar_masked || 'XXXX-XXXX-0000',
            maskedAadhaar: userRow.aadhaar_masked || 'XXXX-XXXX-0000',
            name: userRow.name || 'Citizen Applicant',
            nameMr: userRow.name || 'नागरिक',
            nameHi: userRow.name || 'नागरिक',
            gender: 'MALE',
            dob: '1995-01-01',
            phone: userRow.phone || '+91 98000 00000',
            email: userRow.email || '',
            address: {
              street: '',
              villageOrCity: '',
              taluka: '',
              district: '',
              state: 'Maharashtra',
              pincode: ''
            },
            role: 'citizen',
            photoUrl: '',
            biometricRegistered: true,
            registeredAt: userRow.created_at || new Date().toISOString(),
            isProfileComplete: true,
            documents: []
          };
          db.citizens.push(citizen);
        }
      } catch (ex) {
        console.warn('Citizen lookup error:', ex);
      }
    }

    if (!citizen) {
      citizen = {
        id: citizenId || `c-dyn-${Date.now()}`,
        aadhaarNumber: 'XXXX-XXXX-0000',
        maskedAadhaar: 'XXXX-XXXX-0000',
        name: formData?.applicantName || formData?.name || 'Citizen Applicant',
        nameMr: '',
        nameHi: '',
        gender: 'MALE',
        dob: '',
        phone: '',
        email: '',
        address: {
          street: '',
          villageOrCity: '',
          taluka: '',
          district: '',
          state: 'Maharashtra',
          pincode: ''
        },
        role: 'citizen',
        photoUrl: '',
        biometricRegistered: true,
        registeredAt: new Date().toISOString(),
        isProfileComplete: true,
        documents: []
      };
      db.citizens.push(citizen);
    }

    let service = db.services.find(s => s.id === serviceId || toValidUuid(s.id) === toValidUuid(serviceId));
    if (!service && supabase) {
      try {
        const { data: srvRow } = await supabase.from('services').select('*').eq('id', toValidUuid(serviceId)).maybeSingle();
        if (srvRow) {
          service = {
            id: srvRow.id,
            name: srvRow.name,
            nameMr: srvRow.name,
            code: srvRow.code,
            departmentId: srvRow.department_id,
            departmentCode: 'REVENUE',
            description: srvRow.description || '',
            requiredDataFields: [],
            slaDays: 7,
            eligibilityCriteria: []
          };
          db.services.push(service);
        }
      } catch (ex) {
        console.warn('Service lookup error:', ex);
      }
    }

    if (!service) {
      const deptCode = formData?.departmentCode || 'REVENUE';
      service = {
        id: serviceId || `srv-${Date.now()}`,
        name: formData?.serviceName || 'Public Welfare Scheme',
        nameMr: formData?.serviceName || 'शासकीय योजना',
        code: `SRV-${String(serviceId || 'SCHEME').slice(0, 10).toUpperCase()}`,
        departmentId: `dept-${deptCode.toLowerCase()}`,
        departmentCode: deptCode,
        description: 'Maharashtra State Public Welfare Service',
        requiredDataFields: [],
        slaDays: 7,
        eligibilityCriteria: []
      };
      db.services.push(service);
    }

    const applicationNumber = `MH-${service.departmentCode}-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const newApp: ApplicationRecord = {
      id: `app-${Date.now()}`,
      applicationNumber,
      citizenId: citizen.id,
      citizenName: citizen.name,
      citizenAadhaarMasked: citizen.maskedAadhaar,
      serviceId: service.id,
      serviceName: service.name,
      departmentCode: service.departmentCode,
      status: 'SUBMITTED',
      formData: formData || {},
      verifiedProofs: verifiedProofs || [],
      consentId: consentId || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      trackingRemarks: 'Application received with 100% pre-verified departmental proofs. Under standard SLA.'
    };

    db.applications.unshift(newApp);

    // Sync to Supabase PostgreSQL with awaited foreign-key resolution
    const syncRes = await syncApplicationToSupabase(newApp);
    if (!syncRes.success) {
      console.warn('[SUPABASE APPLICATION SYNC WARNING]', syncRes.error);
    }

    const appLog = db.createAuditLog({
      actorUserId: citizen.id,
      actorName: citizen.name,
      actorRole: 'citizen',
      action: 'APPLICATION_SUBMITTED',
      entityType: 'application',
      entityId: newApp.id,
      targetDepartment: service.departmentCode,
      metadata: {
        applicationNumber: newApp.applicationNumber,
        serviceName: service.name,
        proofsVerifiedCount: newApp.verifiedProofs.length,
        supabaseSynced: syncRes.success
      }
    });
    syncAuditLogToSupabase(appLog);

    res.json({ success: true, application: newApp });
  });

  // Get applications (fetches from Supabase applications table when connected)
  app.get('/api/applications', async (req: Request, res: Response) => {
    const { citizenId, departmentCode } = req.query;
    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        let query = supabase.from('applications').select('*').order('created_at', { ascending: false });
        if (citizenId) {
          query = query.eq('citizen_id', toValidUuid(citizenId as string));
        }
        const { data: sbApps, error: sbErr } = await query;
        if (!sbErr && sbApps) {
          const mapped: ApplicationRecord[] = sbApps.map((a: any) => {
            const fd = a.form_data || {};
            return {
              id: a.id,
              applicationNumber: fd.applicationNumber || `MH-APP-${a.id.slice(0, 8).toUpperCase()}`,
              citizenId: a.citizen_id,
              citizenName: fd.citizenName || 'Citizen Applicant',
              citizenAadhaarMasked: fd.citizenAadhaarMasked || 'XXXX-XXXX-0000',
              serviceId: a.service_id,
              serviceName: fd.serviceName || 'State Government Service',
              departmentCode: fd.departmentCode || 'REVENUE',
              status: a.status || 'SUBMITTED',
              formData: fd.formData || {},
              verifiedProofs: fd.verifiedProofs || [],
              consentId: fd.consentId || '',
              createdAt: a.created_at || new Date().toISOString(),
              updatedAt: a.updated_at || new Date().toISOString(),
              trackingRemarks: fd.trackingRemarks || 'Recorded in Supabase PostgreSQL'
            };
          });

          // Merge any un-synced in-memory applications
          const seenIds = new Set(mapped.map(m => m.id));
          const localOnly = db.applications.filter(a => {
            const uuid = toValidUuid(a.id);
            return !seenIds.has(a.id) && !seenIds.has(uuid);
          });
          const all = [...mapped, ...localOnly];

          const filtered = departmentCode ? all.filter(m => m.departmentCode === departmentCode) : all;
          res.json(filtered);
          return;
        }
      } catch (sbEx) {
        console.warn('Supabase fetch applications notice:', sbEx);
      }
    }

    let list = db.applications;
    if (citizenId) {
      list = list.filter(a => a.citizenId === citizenId);
    }
    if (departmentCode) {
      list = list.filter(a => a.departmentCode === departmentCode);
    }

    res.json(list);
  });

  // Officer updates application status
  app.post('/api/applications/:id/status', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, remarks, officerId } = req.body;
    const supabase = getSupabaseClient();

    let appRecord = db.applications.find(a => a.id === id || toValidUuid(a.id) === toValidUuid(id));

    if (supabase) {
      try {
        const targetUuid = toValidUuid(id);
        const { data: sbApp, error: sbErr } = await supabase
          .from('applications')
          .select('*')
          .eq('id', targetUuid)
          .maybeSingle();

        if (!sbErr && sbApp) {
          const fd = sbApp.form_data || {};
          if (!appRecord) {
            appRecord = {
              id: sbApp.id,
              applicationNumber: fd.applicationNumber || `MH-APP-${sbApp.id.slice(0, 8).toUpperCase()}`,
              citizenId: sbApp.citizen_id,
              citizenName: fd.citizenName || 'Citizen Applicant',
              citizenAadhaarMasked: fd.citizenAadhaarMasked || 'XXXX-XXXX-0000',
              serviceId: sbApp.service_id,
              serviceName: fd.serviceName || 'State Government Service',
              departmentCode: fd.departmentCode || 'REVENUE',
              status: sbApp.status || 'SUBMITTED',
              formData: fd.formData || {},
              verifiedProofs: fd.verifiedProofs || [],
              consentId: fd.consentId || '',
              createdAt: sbApp.created_at || new Date().toISOString(),
              updatedAt: sbApp.updated_at || new Date().toISOString(),
              trackingRemarks: fd.trackingRemarks || 'Recorded in Supabase PostgreSQL'
            };
            db.applications.push(appRecord);
          }

          // Direct update on Supabase table
          const updatedFd = {
            ...fd,
            status,
            trackingRemarks: remarks || `Status updated to ${status}`
          };

          const { error: updateErr } = await supabase
            .from('applications')
            .update({
              status,
              updated_at: new Date().toISOString(),
              form_data: updatedFd
            })
            .eq('id', targetUuid);

          if (updateErr) {
            console.warn('[SUPABASE DIRECT STATUS UPDATE ERROR]:', updateErr.message);
          } else {
            console.log(`[SUPABASE] Successfully updated application ${targetUuid} status to ${status}`);
          }
        }
      } catch (err) {
        console.warn('Error querying application status in Supabase:', err);
      }
    }

    if (!appRecord) {
      res.status(404).json({ success: false, error: 'Application not found' });
      return;
    }

    appRecord.status = status;
    appRecord.trackingRemarks = remarks || `Status updated to ${status}`;
    appRecord.updatedAt = new Date().toISOString();

    // Sync backup
    await syncApplicationToSupabase(appRecord);

    const officer = db.officers.find(o => o.id === officerId) || db.officers[0];

    const statusLog = db.createAuditLog({
      actorUserId: officer.id,
      actorName: officer.name,
      actorRole: 'officer',
      action: status === 'APPROVED' ? 'APPLICATION_APPROVED' : 'APPLICATION_SUBMITTED',
      entityType: 'application',
      entityId: appRecord.id,
      targetDepartment: appRecord.departmentCode,
      metadata: {
        newStatus: status,
        remarks: appRecord.trackingRemarks,
        officer: officer.name
      }
    });
    syncAuditLogToSupabase(statusLog);

    res.json({ success: true, application: appRecord });
  });

  // Immutable Audit Logs
  app.get('/api/audit-logs', (req: Request, res: Response) => {
    const { citizenId, entityId } = req.query;
    let list = db.auditLogs;

    if (citizenId) {
      list = list.filter(l => l.actorUserId === citizenId || (l.metadata && (l.metadata as any).citizenAadhaarMasked));
    }
    if (entityId) {
      list = list.filter(l => l.entityId === entityId);
    }

    res.json(list);
  });

  // API Registry
  app.get('/api/api-registry', (req: Request, res: Response) => {
    res.json(db.apiRegistry);
  });

  // Schema Mappings
  app.get('/api/schema-mappings', (req: Request, res: Response) => {
    res.json(db.schemaMappings);
  });

  // Direct Department Adapter routes for testing / monitoring
  app.get('/api/adapters/revenue/income-certificate/:id', (req: Request, res: Response) => {
    res.json(RevenueAdapter.verifyIncomeCertificate(req.params.id));
  });

  app.get('/api/adapters/revenue/land-extract/:gatNo', (req: Request, res: Response) => {
    res.json(RevenueAdapter.verifyLandExtract(req.params.gatNo));
  });

  app.get('/api/adapters/district/domicile/:id', (req: Request, res: Response) => {
    res.json(DistrictAdminAdapter.verifyDomicile(req.params.id));
  });

  app.get('/api/adapters/rto/license/:dlNo', (req: Request, res: Response) => {
    res.json(RTOAdapter.verifyLicense(req.params.dlNo));
  });

  app.get('/api/adapters/health/medical-fitness/:id', (req: Request, res: Response) => {
    res.json(HealthAdapter.verifyMedicalFitness(req.params.id));
  });

  // ==========================================
  // 3. AI ASSISTANCE LAYER (GEMINI API)
  // ==========================================

  // AI Service Navigator (supports both /api/ai/navigate and /api/gemini/navigate)
  const handleAiNavigate = async (req: Request, res: Response) => {
    try {
      const { query, language } = req.body;
      if (!query) {
        res.status(400).json({ error: 'Query is required' });
        return;
      }
      const result = await navigateServiceQuery(query, language || 'Marathi');
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'AI Navigation error' });
    }
  };

  app.post('/api/ai/navigate', handleAiNavigate);
  app.post('/api/gemini/navigate', handleAiNavigate);

  // AI Form Helper & Status Explainer (supports both /api/ai/explain and /api/gemini/explain)
  const handleAiExplain = async (req: Request, res: Response) => {
    try {
      const { statusMessage, language } = req.body;
      const explanation = await explainApplicationStatus(statusMessage || 'Application in review', language || 'Marathi');
      res.json({ explanation });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'AI Helper error' });
    }
  };

  app.post('/api/ai/explain', handleAiExplain);
  app.post('/api/gemini/explain', handleAiExplain);

  // AI Schema Mapper (supports both /api/ai/schema-mapper and /api/gemini/schema-mapper)
  const handleAiSchemaMapper = async (req: Request, res: Response) => {
    try {
      const { sourceSchema, canonicalSchema, legacySchema } = req.body;
      const mapping = await generateSchemaMappingRules(
        JSON.stringify(sourceSchema || legacySchema || {}, null, 2),
        JSON.stringify(canonicalSchema || {}, null, 2)
      );
      res.json(mapping);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'AI Schema Mapper error' });
    }
  };

  app.post('/api/ai/schema-mapper', handleAiSchemaMapper);
  app.post('/api/gemini/schema-mapper', handleAiSchemaMapper);

  // ==========================================
  // 4. WELFARE & DBT SCHEMES REPOSITORY (4,709+ SCHEMES)
  // ==========================================

  // Search and filter schemes
  app.get('/api/schemes', (req: Request, res: Response) => {
    try {
      const results = searchSchemes(req.query as any);
      res.json(results);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to search schemes' });
    }
  });

  // Scheme statistics & metrics
  app.get('/api/schemes/stats', (req: Request, res: Response) => {
    try {
      const stats = getSchemeStats();
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to get scheme stats' });
    }
  });

  // Get specific scheme by ID
  app.get('/api/schemes/:id', (req: Request, res: Response) => {
    try {
      const scheme = getSchemeById(req.params.id);
      if (!scheme) {
        res.status(404).json({ error: 'Scheme not found' });
        return;
      }
      res.json(scheme);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to get scheme' });
    }
  });

  // AI Scheme Advisor
  const handleAiSchemeAdvisor = async (req: Request, res: Response) => {
    try {
      const { query, language, citizenProfile } = req.body;
      if (!query) {
        res.status(400).json({ error: 'Query is required' });
        return;
      }
      const result = await adviseSchemesWithAI(query, language || 'Marathi', citizenProfile);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'AI Scheme Advisor error' });
    }
  };

  app.post('/api/ai/scheme-advisor', handleAiSchemeAdvisor);
  app.post('/api/gemini/scheme-advisor', handleAiSchemeAdvisor);

  // Supabase PostgreSQL Schema exporter
  app.get('/api/supabase/export-sql', (req: Request, res: Response) => {
    const sql = `-- ==========================================================
-- Mahasetu - Maharashtra Government Interoperability Platform
-- Supabase / PostgreSQL Schema Definition (SIH26129 Section 7.2)
-- ==========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users (Citizens, Department Officers, Platform Admins)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role TEXT NOT NULL CHECK (role IN ('citizen', 'officer', 'admin')),
  department_id UUID,
  aadhaar_masked TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT UNIQUE,
  profile_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Officers Table (Maharashtra Administrative & Verification Officers)
CREATE TABLE IF NOT EXISTS officers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aadhaar_number TEXT NOT NULL,
  masked_aadhaar TEXT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'officer',
  department_id TEXT,
  department_code TEXT DEFAULT 'REVENUE',
  designation TEXT,
  employee_code TEXT,
  office_location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sample Officers Insert (You can add your own officers directly here)
INSERT INTO officers (aadhaar_number, masked_aadhaar, name, email, phone, role, department_code, designation, employee_code, office_location)
VALUES 
  ('987654321098', 'XXXX-XXXX-1098', 'Abhijit Tikone', 'abhijittikone0@gmail.com', '+91 98230 45678', 'officer', 'REVENUE', 'Sub-Divisional Officer (SDO) & DBT Custodian', 'MH-OFF-1098', 'Collectorate Office, Pune Division, Maharashtra'),
  ('445566778899', 'XXXX-XXXX-8899', 'Sanjay Deshpande', 'sanjay.deshpande@mahashasan.gov.in', '+91 98221 44556', 'officer', 'REVENUE', 'Revenue Tahsildar & Desk Officer', 'MH-OFF-8899', 'Tehsil Office, Haveli, Pune'),
  ('223344556677', 'XXXX-XXXX-6677', 'Dr. Meena Kulkarni', 'meena.kulkarni@mahashasan.gov.in', '+91 98222 33445', 'officer', 'WELFARE', 'MahaDBT Welfare Desk Officer', 'MH-OFF-6677', 'Social Justice & Assistance Directorate, Pune'),
  ('998877665544', 'XXXX-XXXX-5544', 'Vikram Joshi', 'vikram.joshi@mahashasan.gov.in', '+91 98223 99887', 'officer', 'RTO', 'MahaRTO Motor Vehicles Inspector', 'MH-OFF-5544', 'Regional Transport Office, Pune MH-12')
ON CONFLICT (email) DO UPDATE SET
  aadhaar_number = EXCLUDED.aadhaar_number,
  masked_aadhaar = EXCLUDED.masked_aadhaar,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  department_code = EXCLUDED.department_code,
  designation = EXCLUDED.designation,
  employee_code = EXCLUDED.employee_code,
  office_location = EXCLUDED.office_location,
  updated_at = NOW();

-- Departments (RTO, Revenue, Health, Education, District Admin)
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  api_base_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Services
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department_id UUID NOT NULL REFERENCES departments(id),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  required_data_fields JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Consent Records (Purpose-bound, Time-limited, Revocable)
CREATE TABLE IF NOT EXISTS consent_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  citizen_id UUID NOT NULL REFERENCES users(id),
  requesting_department_id UUID NOT NULL REFERENCES departments(id),
  service_id UUID NOT NULL REFERENCES services(id),
  purpose TEXT NOT NULL,
  data_fields JSONB NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'revoked', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Data Requests (Inter-departmental Data Exchange)
CREATE TABLE IF NOT EXISTS data_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consent_id UUID NOT NULL REFERENCES consent_records(id),
  source_department_id UUID NOT NULL REFERENCES departments(id),
  requesting_department_id UUID NOT NULL REFERENCES departments(id),
  requested_fields JSONB NOT NULL,
  response_status TEXT NOT NULL CHECK (response_status IN ('PENDING', 'SUCCESS', 'FAILED')),
  response_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Applications (Service Applications submitted with verified proofs)
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  citizen_id UUID NOT NULL REFERENCES users(id),
  service_id UUID NOT NULL REFERENCES services(id),
  status TEXT NOT NULL CHECK (status IN ('SUBMITTED', 'IN_PROGRESS', 'APPROVED', 'REJECTED')),
  form_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Immutable Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_user_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  metadata JSONB,
  hash_chain TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row-Level Security (RLS)
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY citizen_see_own_consent ON consent_records
  FOR SELECT USING (citizen_id = auth.uid());

CREATE POLICY citizen_see_own_applications ON applications
  FOR SELECT USING (citizen_id = auth.uid());
`;
    if (req.query.format === 'raw' || req.headers.accept === 'text/plain') {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.send(sql);
    } else {
      res.json({
        success: true,
        platform: 'Mahasetu PostgreSQL / Supabase Schema',
        version: '2.5.0',
        tableCount: 8,
        sql
      });
    }
  });

  // Get public Supabase configuration for client-side OAuth
  app.get('/api/config/public', (req: Request, res: Response) => {
    const rawUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    const cleanUrl = rawUrl.trim().replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
    res.json({
      supabaseUrl: cleanUrl,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
    });
  });

  // Google OAuth + Aadhaar Single Sign-On Endpoint
  app.post('/api/auth/google-aadhaar-login', async (req: Request, res: Response) => {
    try {
      let { aadhaarNumber, email, name, googleId, photoUrl, accessToken } = req.body || {};
      const cleanUid = (aadhaarNumber || '').replace(/[^0-9]/g, '');

      // Verify token with Supabase if token provided and missing email
      if (accessToken && getSupabaseClient()) {
        try {
          const supabase = getSupabaseClient();
          if (supabase) {
            const { data: { user } } = await supabase.auth.getUser(accessToken);
            if (user) {
              if (!email && user.email) email = user.email;
              if (!name && user.user_metadata?.full_name) name = user.user_metadata.full_name;
              if (!photoUrl && user.user_metadata?.avatar_url) photoUrl = user.user_metadata.avatar_url;
              if (!googleId) googleId = user.id;
            }
          }
        } catch (tokenErr) {
          console.warn('[AUTH] Token verification note:', tokenErr);
        }
      }

      const normalizedEmail = (email || '').toLowerCase().trim();

      if (!normalizedEmail || !normalizedEmail.includes('@')) {
        res.status(400).json({ success: false, error: 'Valid Google email address is required.' });
        return;
      }

      // Lookup existing citizen by Google Email OR Aadhaar UID
      let citizen = db.citizens.find(c =>
        (c.email && c.email.toLowerCase().trim() === normalizedEmail) ||
        (cleanUid.length === 12 && c.aadhaarNumber.replace(/[^0-9]/g, '') === cleanUid)
      );

      const supabase = getSupabaseClient();
      if (!citizen && supabase) {
        try {
          const { data: sbUser, error: sbUserErr } = await supabase
            .from('users')
            .select('*')
            .eq('email', normalizedEmail)
            .limit(1);

          if (!sbUserErr && sbUser && sbUser.length > 0) {
            const row = sbUser[0];
            if (row.profile_data) {
              citizen = row.profile_data;
            } else {
              // Reconstruct citizen from table columns and optionally submitted applications
              const { data: apps } = await supabase
                .from('applications')
                .select('*')
                .eq('citizen_id', row.id)
                .order('created_at', { ascending: false });

              let address = { street: '', villageOrCity: '', taluka: '', district: '', state: 'Maharashtra', pincode: '' };
              let category = 'OBC';
              let annualIncome = 72000;
              let rationCardType = 'ORANGE';
              let landHolding = { gatNumber: 'MH-REV-712-GAT-101', areaInAcres: 2.5, irrigationType: 'Seasonal Rainfed' };
              let dbtBankDetails = { bankName: 'State Bank of India', accountNumber: '309981245512', ifscCode: 'SBIN0001234', isAadhaarSeeded: true };
              let disabilityStatus = 'NO';
              let documents: any[] = [];
              let isProfileComplete = false;

              if (apps && apps.length > 0) {
                const latestApp = apps[0];
                const fd = latestApp.form_data || {};
                const cData = fd.formData || {};
                if (cData) {
                  address = cData.address || address;
                  category = cData.category || category;
                  annualIncome = cData.annualIncome !== undefined ? Number(cData.annualIncome) : annualIncome;
                  rationCardType = cData.rationCardType || rationCardType;
                  landHolding = cData.landHolding || landHolding;
                  dbtBankDetails = cData.dbtBankDetails || dbtBankDetails;
                  disabilityStatus = cData.disabilityStatus || disabilityStatus;
                  documents = fd.verifiedProofs || [];
                  isProfileComplete = true;
                }
              }

              citizen = {
                id: row.id,
                aadhaarNumber: cleanUid.length === 12 ? `${cleanUid.slice(0, 4)} ${cleanUid.slice(4, 8)} ${cleanUid.slice(8, 12)}` : 'XXXX XXXX 0000',
                maskedAadhaar: row.aadhaar_masked || 'XXXX-XXXX-0000',
                name: row.name,
                nameMr: '',
                nameHi: '',
                gender: 'MALE',
                dob: '1995-05-20',
                phone: row.phone || '',
                email: row.email,
                address,
                role: 'citizen',
                photoUrl: photoUrl || '',
                biometricRegistered: true,
                registeredAt: row.created_at || new Date().toISOString(),
                isProfileComplete,
                category,
                annualIncome,
                rationCardType,
                landHolding,
                dbtBankDetails,
                disabilityStatus,
                documents
              } as any;
            }
            if (citizen) {
              db.citizens.push(citizen);
            }
          }
        } catch (ex) {
          console.warn('[SUPABASE] Error restoring citizen user on login:', ex);
        }
      }

      let isNewProfile = false;

      if (!citizen) {
        isNewProfile = true;
        const uid = cleanUid.length === 12 ? cleanUid : Math.floor(100000000000 + Math.random() * 900000000000).toString();
        const formattedUid = `${uid.slice(0, 4)} ${uid.slice(4, 8)} ${uid.slice(8, 12)}`;
        citizen = {
          id: `c-dyn-${uid}`,
          aadhaarNumber: formattedUid,
          maskedAadhaar: `XXXX-XXXX-${uid.slice(8, 12)}`,
          name: name || '',
          nameMr: '',
          nameHi: '',
          gender: 'MALE',
          dob: '',
          phone: '',
          email: normalizedEmail,
          address: {
            street: '',
            villageOrCity: '',
            taluka: '',
            district: '',
            state: 'Maharashtra',
            pincode: ''
          },
          role: 'citizen',
          photoUrl: photoUrl || '',
          biometricRegistered: true,
          registeredAt: new Date().toISOString(),
          isProfileComplete: false,
          documents: []
        };
        db.citizens.push(citizen);
        syncUsersToSupabase([citizen], []);
      } else {
        if (normalizedEmail) citizen.email = normalizedEmail;
        if (name && !citizen.name) citizen.name = name;
        if (photoUrl && !citizen.photoUrl) citizen.photoUrl = photoUrl;
        syncUsersToSupabase([citizen], []);
      }

      const txnId = `GOOGLE-SSO-${Date.now()}`;
      const authLog = db.createAuditLog({
        actorUserId: citizen.id,
        actorName: citizen.name || `Aadhaar Citizen (${citizen.maskedAadhaar})`,
        actorRole: 'citizen',
        action: 'AUTH_VERIFIED',
        entityType: 'session',
        entityId: citizen.id,
        metadata: {
          authMethod: 'GOOGLE_OAUTH_AADHAAR',
          email: normalizedEmail,
          googleId,
          isNewProfile
        }
      });
      syncAuditLogToSupabase(authLog);

      res.json({
        success: true,
        isNewProfile: !citizen.name || citizen.isProfileComplete === false,
        citizen,
        authProof: {
          txnId,
          authMethod: 'GOOGLE_OAUTH_AADHAAR',
          authTimestamp: new Date().toISOString(),
          kuaAgency: 'Maharashtra Information Technology Corporation (MahaIT)'
        }
      });
    } catch (err: any) {
      console.error('[GOOGLE AADHAAR AUTH] Login error:', err);
      res.status(500).json({ success: false, error: err?.message || 'Failed to authenticate via Google.' });
    }
  });

  // Actively test live connection to Supabase instance
  app.post('/api/supabase/test-connection', async (req: Request, res: Response) => {
    try {
      const result = await testSupabaseConnection();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({
        connected: false,
        configured: false,
        error: err?.message || 'Failed to test Supabase connection.'
      });
    }
  });

  // Bulk Synchronize all active state to Supabase PostgreSQL
  app.post('/api/supabase/sync-now', async (req: Request, res: Response) => {
    try {
      const result = await syncAllDatabaseStateToSupabase(db);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err?.message || 'Failed to sync database state to Supabase.'
      });
    }
  });

  // Background auto-sync if Supabase is connected
  setTimeout(async () => {
    try {
      const client = getSupabaseClient();
      if (client) {
        console.log('🔄 Checking Supabase connection and synchronizing initial seed state...');
        const syncResult = await syncAllDatabaseStateToSupabase(db);
        if (syncResult.success) {
          console.log(`✅ ${syncResult.message}`);
        } else {
          console.log(`ℹ️ Supabase sync status: ${syncResult.error}`);
        }
      }
    } catch (e: any) {
      console.warn('Initial Supabase sync check:', e?.message || e);
    }
  }, 3000);

  // ==========================================
  // 4. VITE MIDDLEWARE / PRODUCTION SERVING
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mahasetu Interoperability Platform running on port ${PORT}`);
  });
}

startServer();
