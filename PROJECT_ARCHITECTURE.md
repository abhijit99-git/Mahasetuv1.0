# Mahasetu (महासेतू) - Project Architecture & Technical Specification

> **SIH Problem Statement:** SIH26129 - System Integration and Interoperability among Government Digital Platforms  
> **Rebranded from:** Samanvay -> **Mahasetu**  
> **Jurisdiction:** Government of Maharashtra  

---

## 1. Architectural Principles

### 1.1 The Federated Interoperability Paradigm
Rather than migrating millions of citizen records into a single monolithic database (which creates single-point-of-failure risks and inter-departmental political friction), **Mahasetu** implements a **Federated Service & Consent Mesh**:
1. **Departmental Autonomy:** The Revenue Department retains full authority over land and income registries; Transport retains Sarathi/Vahan; District Administration retains civil registries.
2. **Minimal Necessary Data Exchange:** Departments only return the exact verification boolean, certificate identifier, and expiration date requested.
3. **Purpose-Bound Consent:** No data moves across departments without explicit, cryptographic citizen consent.
4. **Zero Physical Document Scans:** Citizens do not scan PDFs; authentic state systems verify records peer-to-peer.

---

## 2. Component Breakdown

### 2.1 Aadhaar Biometric Authentication Module
- **Input:** 12-digit Aadhaar Unique Identification Number (UID).
- **Biometric Modalities:**
  - **FMR (Finger Minutiae Record)**: ISO/IEC 19794-2 standard fingerprint minutiae.
  - **IIR (Iris Image Record)**: ISO/IEC 19794-6 dual iris scan.
- **Verification Engine:**
  - Performs live optical scan animation with image quality scoring (NFIQ > 80%).
  - Generates UIDAI Auth 2.5 XML with timestamp, transaction identifier (`txn`), and encrypted PID data block.
  - Grants access only upon positive biometric match.

### 2.2 Consent Manager
- Stores consent artifacts conforming to the following model:
  - `consent_id`: UUIDv4
  - `citizen_id`: Foreign key to `users(id)`
  - `requesting_department_id`: Department receiving data
  - `source_department_ids`: Array of departments supplying verification
  - `purpose`: Plain-language purpose specification
  - `data_fields`: Specific data attributes authorized for exchange
  - `granted_at` & `expires_at`: Strict time boundaries (e.g. 24 hours)
  - `status`: `active` | `revoked` | `expired`
- **Revocation Protocol:** Immediate revocation invalidates downstream tokens and triggers an immutable audit log entry.

### 2.3 Non-Invasive Department Adapters
Department adapters act as translation bridges between legacy systems and the Mahasetu Gateway:
- **Revenue Adapter (`/api/adapters/revenue`)**:
  - Ingests legacy income tables (`annual_income_inr`, `is_valid`, `issuing_taluka`) and 7/12 land records (`gat_no`, `khata_no`, `total_area_hectares`).
  - Emits Canonical `IncomeCertificate` and `LandExtract712` objects.
- **District Administration Adapter (`/api/adapters/district`)**:
  - Ingests legacy domicile registries (`resident_name`, `domicile_reg_no`, `approval_flag`).
  - Emits Canonical `DomicileCertificate` objects.
- **Transport RTO Adapter (`/api/adapters/rto`)**:
  - Ingests Sarathi driving license databases.
  - Emits Canonical `DrivingLicense` objects.
- **Health Adapter (`/api/adapters/health`)**:
  - Ingests civil surgeon health cards and Form 1A fitness registries.
  - Emits Canonical `MedicalFitnessCertificate` objects.

### 2.4 Mahasetu Canonical Data Contract (Example)
```json
{
  "documentType": "IncomeCertificate",
  "documentNumber": "INC-MH-2026-10382",
  "personName": "Asha Suresh Patil",
  "verificationStatus": "VERIFIED",
  "validUntil": "2027-03-31T23:59:59Z",
  "metadata": {
    "annualIncomeInr": 120000,
    "issuingTaluka": "Haveli",
    "district": "Pune",
    "state": "Maharashtra",
    "sourceDepartment": "REVENUE"
  }
}
```

### 2.5 Cryptographic Audit Trail
Each cross-department data exchange transaction is chained to the preceding log entry:
$$\text{Hash}_n = \text{SHA-256}(\text{Hash}_{n-1} \parallel \text{ActorID} \parallel \text{Action} \parallel \text{EntityID} \parallel \text{Timestamp})$$
This guarantees tamper evidence across all citizen consents and officer reviews.

---

## 3. AI Assistance Layer (Gemini 3.8 Flash)
1. **Multilingual Service Navigator (`POST /api/ai/navigate`)**:
   - Takes free-form citizen queries in Marathi, Hindi, or English.
   - Extracts `intent`, `department`, `serviceName`, `requiredDocuments`, and confidence score.
2. **AI Form Helper (`POST /api/ai/explain`)**:
   - Translates dense administrative status updates into intuitive, reassuring local language guidance.
3. **AI Schema Mapper (`POST /api/ai/schema-mapper`)**:
   - Compares department legacy JSON schemas against the Mahasetu Canonical Schema and proposes transformation rules.

---

## 4. Supabase / PostgreSQL Database Architecture
The platform is fully mapped to PostgreSQL tables:
- `users`: Citizen and Department Officer profiles
- `departments`: Registered government entities
- `services`: Published citizen services
- `consent_records`: Active and historical consent contracts
- `data_requests`: Inter-departmental API exchange telemetry
- `applications`: End-to-end citizen service applications
- `audit_logs`: Immutable ledger
- `api_registry`: Department API documentation and endpoint routing
- `schema_mappings`: Canonical mapping declarations
