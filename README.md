# Mahasetu (महासेतू) - Maharashtra Government Interoperability Platform

> **SIH26129** — *System Integration and Interoperability among Government Digital Platforms*  
> **Target Authority:** Government of Maharashtra (शासन निर्णय / ई-प्रशासन)  
> **Team Category:** Software | Smart India Hackathon  
> **Solution Architecture:** Federated Interoperability & Consent-Driven Data Exchange Layer with Aadhaar Biometric Authentication

---

## 🏛️ Executive Summary

Government of Maharashtra operates dozens of departmental digital platforms (e.g., **Aaple Sarkar / Revenue**, **MahaDBT / Higher Education**, **Mahabhulekh / Land Records**, **Sarathi / Transport & RTO**, and **Civil Health**). Currently, these platforms operate in vertical silos, forcing citizens to repeatedly fetch, scan, attest, and upload identical physical documents.

**Mahasetu (महासेतू)** solves this fragmentation not by building a risky, vulnerable "mega-database" of citizen records, but by introducing a **non-invasive, federated interoperability and consent-driven middleware layer**.

### 🌟 Core Architectural Tenet
> **"Centralize consent, canonical standards, workflow orchestration, and immutable auditability — NEVER centralize every citizen's private records."**

---

## 🚀 Key Features

1. **Aadhaar Biometric Authentication Only**:
   - Strictly authenticates citizens and department officers via 12-digit Aadhaar UID verification.
   - UIDAI Auth 2.5 compliant simulation with live Optical Fingerprint (FMR) & Retinal Iris Scan (IIR) biometric verification, NFIQ score computation, and PID block generation.
   - Eliminates fake credentials, duplicate beneficiary fraud, and repeated manual identity re-validation.

2. **Purpose-Bound, Time-Limited Consent Architecture**:
   - Follows India's **Digital Personal Data Protection Act (DPDP 2023)**.
   - Citizens see explicit consent screens showing the requesting department, source departments, exact fields requested, access duration (e.g. 24 hours), and specific purpose.
   - 1-Click Revocability: Citizens can withdraw consent at any time from their personal consent dashboard.

3. **Canonical Data Exchange & Department Adapters**:
   - Connects legacy databases (Oracle, PostgreSQL, MySQL) without altering existing departmental systems.
   - Microservice adapters translate heterogeneous schemas into the standardized **Mahasetu Canonical JSON Schema** (`personName`, `documentNumber`, `verificationStatus`, `validUntil`, `metadata`).

4. **Tamper-Evident Immutable Audit Log**:
   - Every transaction (`AUTH_VERIFIED`, `CONSENT_GRANTED`, `DATA_REQUESTED`, `DATA_RETURNED`, `CONSENT_REVOKED`) is recorded with an immutable SHA-256 cryptographic chain.
   - Citizens and vigilance officers have complete audit transparency regarding who requested their data, when, and for what verified purpose.

5. **AI Citizen Sahayak (Powered by Google Gemini 3.8 Flash)**:
   - **Multilingual Service Navigator**: Understands natural language citizen queries in Marathi (मराठी), Hindi (हिंदी), and English, auto-routing to the exact government service.
   - **AI Form Helper**: Explains administrative requirements and application statuses in compassionate, simple language.
   - **AI Canonical Schema Mapper**: Data integration assistant that suggests schema mapping rules between legacy department databases and Mahasetu canonical formats.

6. **Full Supabase & PostgreSQL Readiness**:
   - Ready-to-run SQL schema with tables (`users`, `departments`, `services`, `consent_records`, `data_requests`, `applications`, `audit_logs`, `api_registry`, `schema_mappings`) and Row-Level Security (RLS) policies.

---

## 📐 System Architecture Diagram

```
┌────────────────────────────────────────────────────────┐
│             Citizen & Officer Web Portal               │
│          Marathi | Hindi | English (Multilingual)      │
│      [Strict Aadhaar Biometric Authentication]         │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│           Mahasetu Service Orchestrator                │
│    Service Catalogue  |  Workflow Engine  |  Tracking  │
└─────────────┬───────────────────────────┬──────────────┘
              │                           │
              ▼                           ▼
┌───────────────────────────┐ ┌──────────────────────────┐
│   Consent Manager         │ │   AI Assistance Layer    │
│ Purpose, Scope, Expiry,   │ │ (Gemini 3.8 Flash)       │
│ 1-Click Revocation        │ │ Marathi/Hindi/Eng Router │
└─────────────┬─────────────┘ └──────────────────────────┘
              │
              ▼
┌────────────────────────────────────────────────────────┐
│       Mahasetu Interoperability & API Gateway          │
│ Schema Validation | Policy Enforcement | SHA-256 Audit │
└───────┬───────────────┬───────────────┬────────────────┘
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│Revenue Adapter│ │District Adptr│ │ RTO Adapter  │
└───────┬──────┘ └──────┬───────┘ └──────┬───────┘
        │               │                │
        ▼               ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  Mahabhulekh │ │ Civil Reg /  │ │Sarathi / RTO │
│  & Income DB │ │ Domicile DB  │ │  License DB  │
└──────────────┘ └──────────────┘ └──────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS, Motion Animations, Lucide Icons |
| **Backend & Gateway** | Express.js, TypeScript, TSX, REST APIs, Kong Gateway Architecture |
| **Authentication** | Aadhaar Card UIDAI-Compliant Biometric Authentication (Fingerprint & Iris Scan) |
| **Database & ORM** | PostgreSQL / Supabase with Row Level Security (RLS) & Local Persistent Store |
| **AI & NLP** | Google Gemini API (`@google/genai`, `gemini-3.8-flash`) |
| **Security & Privacy** | SHA-256 Hash-Chained Audit Logs, DPDP Act 2023 Consent Management |

---

## 🔑 Required Credentials & Setup

To run Mahasetu in full production mode:

1. **Google Gemini API Key**:
   - Key: `GEMINI_API_KEY`
   - Purpose: Powers the multilingual Service Navigator, Form Explainer, and AI Schema Mapper.
   - Configured via AI Studio Secrets or `.env`.

2. **Supabase PostgreSQL Database**:
   - Keys: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - Purpose: Persistent storage for operational tables (`consent_records`, `audit_logs`, `applications`, `services`).
   - Copy-paste the auto-generated SQL schema from the Mahasetu **Supabase Hub** directly into the Supabase SQL Editor.

3. **UIDAI / KUA Staging Credentials** (Optional for production rollout):
   - Key: `UIDAI_AUTH_MODE` (default: `mock_biometric` for zero-cost SIH evaluation; supports production KUA endpoint).

---

## 🏆 Smart India Hackathon (SIH26129) Presentation Checklist

- [x] **Federated Architecture**: Demonstrates cross-department data exchange without copying citizen records into a central database.
- [x] **Aadhaar Biometric Verification**: Realistic biometric capture interface with quality rating and UIDAI Auth XML 2.5 PID block.
- [x] **Live Interoperability Flow**: End-to-end scholarship application flow with live Revenue & Domicile verification hops.
- [x] **Immutable Audit Trail**: Cryptographic SHA-256 hash log visible to both citizens and officers.
- [x] **Trilingual Accessibility**: Full interface localized in Marathi, Hindi, and English.
- [x] **Zero-Cost Prototype**: Completely functional using free and open-source stacks.

---

## 📄 References & Research Papers

1. *A Framework Design to Develop Integrated Data System for Smart E-Government Based on Big Data Technology* (2017). [ASCEE](http://pubs.ascee.org/index.php/businta/article/download/26/13)
2. *APIs and Emerging Economy: Driving Digital Transformation Through E-Government* (2019). [SHS Web of Conferences](https://www.shs-conferences.org/articles/shsconf/pdf/2019/06/shsconf_m3e22019_04009.pdf)
3. *Interoperability in the E-Government Context* (Figshare report).
4. *Driving Digital Transformation of Comprehensive Primary Health Services at Scale in India* (2021). [PMC8728378](https://pmc.ncbi.nlm.nih.gov/articles/PMC8728378/)
5. *Digital Personal Data Protection Act (DPDP), Government of India* (2023).

---
*Built with pride for the Government of Maharashtra and Smart India Hackathon (SIH26129).*
