# TrustChain — Evidence Integrity & Authentication Platform

## Complete System Documentation

---

# PHASE 1: Brief Overview

---

## 1.1 Problem Statement

Deepfake technology — AI-generated images, videos, and audio that swap faces, clone voices, or fabricate entire media — is advancing faster than our ability to detect it with the naked eye. In India alone, deepfake-related fraud costs an estimated **₹70,000 crores annually**.

The legal system is struggling to keep up:

- Under **BSA §63** (formerly Indian Evidence Act §65B), electronic evidence is inadmissible without a certificate proving its authenticity through an immutable audit trail.
- Existing deepfake detection tools only tell you *if* something is fake — they don't produce anything a court can accept as evidence.
- There is no system that bridges the gap between **detection** and **legal admissibility**.
- There is no standardised way to assign **liability** across the three parties involved: the person who created/distributed the deepfake, the platform that hosted it, and the AI company whose model generated it.

---

## 1.2 Solution

**TrustChain** is an end-to-end evidence integrity and authentication platform that combines:

| Capability | What it does |
|------------|-------------|
| **Multi-Modal AI Detection** | 4 independent AI models (FFT, CNN, RCN, ELA) analyse every uploaded file for manipulation |
| **Blockchain Anchoring** | SHA-256 hash is permanently registered on Ethereum Sepolia with immutable timestamps |
| **Content Provenance (C2PA)** | Standards-compliant manifest traces evidence from capture to court with trust tier classification |
| **SMS Beacon** | Telecom-timestamped backup anchor that works offline — no internet required |
| **Liability Scoring** | Quantitative responsibility distribution across User, Platform, and AI Architect with legal basis |
| **Chain of Custody** | Digitally signed custodian transfer log meeting forensic evidence standards |
| **Court-Ready Certification** | PDF/A certificate with all findings, blockchain proof, QR verification, and legal compliance |

**One upload → seven layers of integrity → court-ready output.**

---

## 1.3 Stakeholders

| Stakeholder | Role | How they use TrustChain |
|-------------|------|------------------------|
| **Law Enforcement** | Investigating Officers, Forensic Analysts | Upload seized digital evidence, generate chain of custody logs, produce court-ready certificates |
| **Judiciary** | Judges, Court Registrars | Verify evidence authenticity via blockchain lookup, review multi-model detection reports, assess liability distribution |
| **Legal Professionals** | Prosecutors, Defense Counsel | Download PDF certificates, verify evidence integrity, use liability scores in arguments |
| **Social Media Platforms** | Content Moderators | Integrate detection API for pre-screening uploads, benchmark takedown response times |
| **Journalists / Newsrooms** | Reporters, Editors | Verify leaked audio/video authenticity before publishing |
| **Banks / Financial Institutions** | KYC Teams, Fraud Analysts | Scan video-call KYC recordings for deepfake manipulation |
| **Government Agencies** | Digital Governance Officers | Certify digitised public records with blockchain-backed authenticity |
| **Content Creators** | Artists, Musicians | Timestamp original work on blockchain to establish copyright proof |

---

## 1.4 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite 5, TailwindCSS 3, React Router 6, Axios |
| **Backend** | Python, FastAPI, Uvicorn |
| **AI Detection** | Google Gemini 2.0 Flash (powering 4 model personas) |
| **Blockchain** | Ethereum Sepolia, Web3.py |
| **Database** | SQLite |
| **PDF Generation** | ReportLab |
| **Provenance** | C2PA v2.2 standard (custom implementation) |
| **Hashing** | SHA-256 (hashlib) |

---

## 1.5 Pipeline Overview

```
Upload File
    ↓
[1] SHA-256 Hash Generation
    ↓
[2] Gemini-Powered 4-Model AI Detection
    │   ├── FFT Spectral Analysis (frequency domain)
    │   ├── CNN Spatial Detection (pixel-level)
    │   ├── RCN Temporal Analysis (temporal consistency)
    │   └── ELA Compression Analysis (error levels)
    ↓
[3] Blockchain Registration (Ethereum Sepolia)
    ↓
[4] Liability Scoring (User / Platform / AI Architect)
    ↓
[5] C2PA Provenance Manifest Generation
    ↓
[6] SMS Beacon Anchor (telecom timestamp)
    ↓
[7] Chain of Custody Initialisation
    ↓
[8] Court-Ready PDF Certificate Generation
    ↓
Results Page (all data displayed)
```

---

## 1.6 Legal Compliance

| Statute | Provision | How TrustChain complies |
|---------|-----------|------------------------|
| **BSA §63** | Electronic evidence admissibility | Blockchain TX + PDF certificate form the §63 certificate |
| **IT Act §66D** | Cheating by personation using computer resources | Liability scorer maps directly to this offence |
| **IT Act §66E** | Privacy violation via deepfake | User liability scoring covers this |
| **IT Act §79** | Safe Harbor for intermediaries | Platform liability assessed under safe harbor erosion |
| **DPDPA §17(2)(a)** | Law enforcement exemption | Evidence processed under LE exemption |
| **EU AI Act Art. 9** | Risk management for AI systems | AI Architect safeguard scoring |

---

## 1.7 Running the System

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables (backend/.env)
```
DETECTION_MODE=mock
HF_API_TOKEN=your_huggingface_token
GEMINI_API_KEY=your_gemini_api_key
WEB3_PROVIDER=https://sepolia.infura.io/v3/YOUR_KEY
ETH_PRIVATE_KEY=your_private_key
FRONTEND_URL=http://localhost:5173
```

---
---

# PHASE 2: Detailed Technical Documentation

---

## 2.1 System Architecture

### Directory Structure

```
Trust_Chain/
├── backend/
│   ├── main.py                    # FastAPI application & API routes
│   ├── database.py                # SQLite database operations
│   ├── hash_engine.py             # SHA-256 file hashing
│   ├── requirements.txt           # Python dependencies
│   ├── .env / .env.example        # Environment configuration
│   ├── detection/
│   │   ├── gemini_detector.py     # Gemini-powered 4-agent detection
│   │   ├── image_detector.py      # HuggingFace ViT image detector (fallback)
│   │   ├── video_detector.py      # Video detection (mock/fallback)
│   │   └── audio_detector.py      # Audio detection (mock/fallback)
│   ├── blockchain/
│   │   └── contract.py            # Ethereum Sepolia smart contract interaction
│   ├── beacon/
│   │   └── sms_beacon.py          # GSM SMS timestamp beacon simulator
│   ├── custody/
│   │   └── custody_manager.py     # Chain of custody management
│   ├── legal/
│   │   └── pdf_generator.py       # Court-ready PDF certificate generation
│   ├── liability/
│   │   ├── scorer.py              # 3-party liability scoring engine
│   │   └── model_registry.json    # AI model safety profiles
│   └── provenance/
│       └── manifest.py            # C2PA v2.2 content provenance manifest
├── frontend/
│   ├── index.html                 # Entry HTML
│   ├── vite.config.ts             # Vite config with API proxy
│   ├── package.json               # Node dependencies
│   └── src/
│       ├── App.tsx                 # Router & Navbar
│       ├── main.tsx                # React entry point
│       ├── index.css               # Global styles & animations
│       ├── components/
│       │   ├── FileUpload.tsx      # Drag-and-drop file upload
│       │   └── LiabilityCard.tsx   # Liability distribution display
│       └── pages/
│           ├── Landing.tsx         # Homepage with hero, stats, how-it-works
│           ├── Upload.tsx          # File upload with liability context form
│           ├── Results.tsx         # Full analysis results display
│           ├── Verify.tsx          # Evidence verification (by ID or file)
│           ├── Dashboard.tsx       # Evidence listing with filters
│           ├── Industries.tsx      # Industry use cases showcase
│           └── Custody.tsx         # Chain of custody viewer
└── architecture_diagram.html       # Visual architecture diagram
```

---

## 2.2 Backend Modules — Detailed

### 2.2.1 Main Application (main.py)

**Purpose:** Central FastAPI application serving all API endpoints.

**API Endpoints:**

| Method | Endpoint | Function | Description |
|--------|----------|----------|-------------|
| `GET` | `/api/health` | `health()` | Health check — returns `{"status": "ok"}` |
| `POST` | `/api/upload` | `upload_evidence()` | Main pipeline — accepts file + liability context, runs full 7-step analysis |
| `GET` | `/api/evidence/{id}` | `get_evidence_record()` | Retrieve single evidence record with all computed data |
| `GET` | `/api/evidence` | `list_all_evidence()` | List all evidence records for dashboard |
| `POST` | `/api/verify` | `verify_file()` | Verify a file's hash against the blockchain |
| `GET` | `/api/custody/{evidence_id}` | `get_custody()` | Get full chain of custody for evidence |
| `POST` | `/api/custody/{evidence_id}/transfer` | `transfer_custody()` | Log a custody transfer event |
| `GET` | `/api/report/{id}/pdf` | `download_pdf()` | Download the court-ready PDF certificate |

**Upload Pipeline (Step by Step):**

1. Receive file + liability context form fields via multipart upload
2. Save file temporarily to disk
3. Generate SHA-256 hash using `hash_engine.hash_file()`
4. Determine media type from file extension (image/video/audio)
5. Run Gemini-powered 4-model detection via `detect_with_gemini()`
6. Register hash on Ethereum blockchain via `register_evidence()`
7. Compute 3-party liability scores via `compute_liability()`
8. Generate court-ready PDF via `generate_pdf()`
9. Save complete record to SQLite database
10. Auto-register initial chain of custody entry
11. Generate C2PA provenance manifest
12. Generate SMS beacon anchor
13. Return complete results JSON to frontend

**Form Fields Accepted:**

| Field | Type | Description |
|-------|------|-------------|
| `file` | File | The media file to analyse |
| `disclosure_stripped` | bool | Whether AI disclosure was removed |
| `content_distributed` | bool | Whether content was widely shared |
| `victim_impersonated` | bool | Whether a real person is impersonated |
| `repeat_offender` | bool | Whether the uploader is a repeat offender |
| `platform_name` | string | Source platform (YouTube, Instagram, WhatsApp, X, Telegram, Other) |
| `takedown_requested` | bool | Whether a takedown was filed |
| `response_hours` | float | Platform response time in hours |
| `content_removed` | bool | Whether the platform removed the content |
| `estimated_reach` | int | Estimated number of views |
| `model_name` | string | Name of the AI model that generated the content |

---

### 2.2.2 Gemini-Powered Detection (detection/gemini_detector.py)

**Purpose:** Replace mock/random detection data with real AI analysis from Google Gemini.

**How it works:**

1. The file is sent to Google Gemini 2.0 Flash with a structured prompt
2. Gemini analyses the file from 4 independent perspectives
3. Returns structured JSON with per-model confidence scores
4. The system weights and combines results into an ensemble verdict

**The 4 AI Model Personas:**

| Model | Weight | Analysis Type | XAI Method |
|-------|--------|---------------|------------|
| **FFT Spectral Analysis** | 25% | Frequency domain — detects GAN fingerprints, unnatural frequency distributions | Spectral comparison chart |
| **CNN Spatial Detection** | 30% | Spatial patterns — pixel-level artifacts, blending boundaries, lighting inconsistencies | Grad-CAM heatmap |
| **RCN Temporal Analysis** | 25% | Temporal consistency — unnatural movements, blink patterns, lip-sync issues | Timeline anomaly graph |
| **ELA Compression Analysis** | 20% | Compression artifacts — inconsistent error levels indicating splicing/AI generation | Error level overlay |

**Ensemble Method:** Weighted vote — each model's confidence is multiplied by its weight, then summed to produce the final ensemble confidence.

**Fallback Behaviour:**
- If `GEMINI_API_KEY` is not set → returns mock random data with all 4 model structures
- If `google-generativeai` package is not installed → returns mock data
- If Gemini API call fails → returns mock data
- The explanation text clearly states when mock mode is active

**Output Structure:**
```json
{
  "confidence": 0.7825,
  "is_synthetic": true,
  "explanation": "Multi-modal AI ensemble analysis across 4 detection models...",
  "model_breakdown": [
    {
      "name": "FFT Spectral Analysis",
      "confidence": 0.82,
      "weight": 0.25,
      "is_flagged": true,
      "xai_method": "Spectral comparison chart with GAN frequency signatures"
    },
    ...
  ],
  "agreement": "3/4",
  "ensemble_method": "Weighted Vote (Gemini-Powered)"
}
```

---

### 2.2.3 Hash Engine (hash_engine.py)

**Purpose:** Generate SHA-256 cryptographic fingerprint of uploaded files.

**How it works:**
- Reads the file in 8KB chunks
- Produces a 64-character hexadecimal hash
- This hash is the immutable identifier used across all downstream operations (blockchain, beacon, C2PA manifest)

---

### 2.2.4 Blockchain Module (blockchain/contract.py)

**Purpose:** Register evidence hashes on the Ethereum Sepolia testnet for tamper-proof timestamping.

**Functions:**

| Function | Description |
|----------|-------------|
| `register_evidence(file_hash, case_id, uploader)` | Registers the hash on-chain, returns transaction hash |
| `verify_evidence(file_hash)` | Checks if a hash exists on-chain, returns (exists, timestamp, case_id) |

**Mock Mode:** When `SEPOLIA_RPC_URL`, `WALLET_PRIVATE_KEY`, or `CONTRACT_ADDRESS` environment variables are not set, all blockchain operations return mock transaction hashes. This allows the full system to run without real Ethereum keys.

---

### 2.2.5 Liability Scoring (liability/scorer.py)

**Purpose:** Distribute legal responsibility across three parties involved in a deepfake incident.

**Three-Party Model:**

#### User / Distributor (max 1.0 points)
| Factor | Max Points | Legal Basis |
|--------|-----------|-------------|
| Intent (disclosure stripped, distribution) | 0.35 | IPC §66E / IT Act §72A |
| Action (distribution + disclosure removed) | 0.30 | IPC §500 / Defamation Act |
| Consent violation (impersonation) | 0.20 | IT Act §43A |
| Prior offences | 0.15 | CrPC §110 / Repeat Offender doctrine |

#### Platform (max 1.0 points)
| Factor | Max Points | Legal Basis |
|--------|-----------|-------------|
| Detection capability (platform-specific) | 0.25 | IT Rules 2021 Rule 4(4) |
| Response time (12h/24h/36h thresholds) | 0.35 | IT Rules 2021 Rule 4(1)(d) — 36h takedown |
| Amplification (reach-based scaling) | 0.25 | EU DSA Art. 34 — Systemic risk |
| Safe Harbor erosion | 0.15 | IT Act §79 Safe Harbor conditions |

#### AI Architect (max 1.0 points)
| Factor | Max Points | Legal Basis |
|--------|-----------|-------------|
| Safeguards (watermark + content filter) | 0.40 | EU AI Act Art. 9 — Risk management |
| Access control (gated vs open source) | 0.30 | EU AI Act Art. 13 — Transparency |
| Incident history (known misuse count) | 0.30 | Product Liability — negligent design |

**Model Registry:** Contains safety profiles for known AI models:
- **ElevenLabs** — has watermark + content filter, API-gated with identity, 2 known incidents
- **Stable Diffusion** — no watermark, open source, 120 known incidents
- **DALL-E 3** — has both safeguards, API-gated with identity, 8 known incidents
- **DeepFaceLab** — no safeguards, open source, 156 known incidents
- And more (Midjourney, HiFi-GAN v2, FaceSwap, Unknown Model)

**Output:** Percentage distribution summing to 100%, raw scores, factor breakdowns, and explanations with legal basis citations.

---

### 2.2.6 C2PA Provenance Manifest (provenance/manifest.py)

**Purpose:** Generate a C2PA v2.2 compatible content provenance manifest.

**What it includes:**

| Field | Value |
|-------|-------|
| Manifest ID | `urn:c2pa:trustchain:{evidence_id}` |
| C2PA Version | 2.2 |
| Claim Generator | TrustChain/1.0.0 |
| Signature Algorithm | COSE_Sign1 |
| Hash Algorithm | SHA-256 |

**Assertions:**
- `c2pa.actions` — capture action with timestamp and software agent
- `stds.schema.org` — author credentials
- `c2pa.hash.data` — file hash
- `le.station_context` — station ID, device ID, camera ID, GPS coordinates
- `le.ai_triage` — AI detection result and confidence
- `le.device_attestation` — TEE type, secure boot status, platform



---

### 2.2.7 SMS Beacon (beacon/sms_beacon.py)

**Purpose:** Provide a non-blockchain, telecom-timestamped anchor for evidence integrity that works offline.

**How it works:**
1. Takes the first 16 characters of the file hash as a prefix
2. Constructs an SMS message: `EVD|STN{code}|{date}|{time}|{hash_prefix}`
3. Simulates sending via GSM network with telecom timestamp
4. Performs cross-validation:
   - Hash prefix matches full hash ✓
   - Timestamp within 5-second tolerance ✓
   - Station key signature valid ✓

**Why it matters:** In rural India and areas without internet, evidence can still be timestamp-sealed via a simple SMS from any basic phone. Cost: ₹0.50 per beacon.

---

### 2.2.8 Chain of Custody (custody/custody_manager.py)

**Purpose:** Track every custodian transfer for evidence from capture to court.

**Valid Custodian Roles:**
1. Investigating Officer
2. Forensic Analyst
3. Station House Officer
4. Public Prosecutor
5. Court Registrar
6. Defense Counsel

**How it works:**
- Each transfer is logged with custodian name, role, badge number, timestamp, and a digital signature (0x-prefixed 256-bit hex)
- When evidence is first uploaded, an automatic "registered" event is created
- The full chain is queryable via API and displayed on the frontend

---

### 2.2.9 PDF Certificate (legal/pdf_generator.py)

**Purpose:** Generate court-ready PDF/A certificates with all forensic findings.

**Page 1 contains:**
- TrustChain header with certificate subtitle
- Event metadata table (Event ID, File SHA-256, Blockchain TX, Timestamp)
- Detection results (verdict, confidence, explanation)
- Multi-Modal AI breakdown table (all 4 models with confidence, weight, status, XAI method)
- Liability attribution table with percentages and explanations

**Page 2 contains:**
- C2PA Provenance Manifest section with trust tier table
- SMS Beacon Anchor details
- Chain of Custody information
- Legal framework reference table (BSA §63, IT Act §66E, IT Act §79, DPDPA §17(2)(a), EU AI Act Art. 9)
- QR code linking to the verification URL
- Auto-generated footer disclaimer

---

### 2.2.10 Database (database.py)

**Purpose:** SQLite persistence for all evidence records.

**Schema:**

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PRIMARY KEY | UUID event identifier |
| `filename` | TEXT | Original filename |
| `file_hash` | TEXT | SHA-256 hash |
| `timestamp` | TEXT | UTC ISO timestamp |
| `detection_type` | TEXT | image / video / audio |
| `detection_confidence` | REAL | Ensemble confidence score |
| `detection_result` | TEXT (JSON) | Full detection result |
| `is_synthetic` | BOOLEAN | Final synthetic verdict |
| `blockchain_tx_id` | TEXT | Ethereum transaction hash |
| `liability_scores` | TEXT (JSON) | Full liability breakdown |
| `pdf_path` | TEXT | Path to generated PDF |
| `status` | TEXT | Processing status |
| `created_at` | TEXT | Creation timestamp |

---

## 2.3 Frontend Pages — Detailed

### 2.3.1 Landing Page (Landing.tsx)

**Sections:**
1. **Hero** — Headline "Evidence integrity you can prove" with CTA buttons
2. **Stats Bar** — ₹70K Cr fraud, 4 AI models, 3 C2PA tiers, §63 compliance
3. **How It Works** — 7-step numbered pipeline walkthrough
4. **Why It Matters** — 4 cards: What is a deepfake, The courtroom gap, Multi-modal AI, Content provenance
5. **Legal Framework** — BSA §63, IT Act §66D, DPDPA cards
6. **CTA** — "Ready to get started?" with upload link
7. **Footer** — TrustChain branding

### 2.3.2 Upload Page (Upload.tsx)

**Flow:**
1. Drag-and-drop or click-to-select file upload (FileUpload component)
2. Once file selected, contextual form appears:
   - **Content toggles:** AI disclosure stripped, widely distributed, real person impersonated
   - **Platform details:** Platform selector, takedown requested, response time, content removed, estimated reach
   - **AI model:** Optional text field for the model name
3. Submit sends multipart form data to `/api/upload`
4. On success, navigates to Results page

### 2.3.3 Results Page (Results.tsx)

**Displays (in order):**
1. **Detection** — Confidence ring (animated SVG circle), synthetic/authentic badge, ensemble confidence percentage, model agreement
2. **Multi-Modal AI Analysis** — 4 model cards (FFT, CNN, RCN, ELA), each showing confidence bar, weight, flagged/pass status, XAI method
3. **C2PA Provenance** — Manifest ID, C2PA version, station, device, AI triage result, trust tier badge, expandable raw JSON
4. **SMS Beacon** — Beacon reference, hash prefix, station code, network delay, SMS cost, cross-validation checks (✓/✗)
5. **Liability** — LiabilityCard component with User/Platform/AI Architect percentages
6. **Blockchain Proof** — Transaction hash (linked to Etherscan Sepolia), timestamp, file hash
7. **Chain of Custody** — Horizontal timeline of custodians with roles
8. **Actions** — Download PDF, Custody log, Copy verify link, New analysis

### 2.3.4 Verify Page (Verify.tsx)

**Two modes:**
1. **By Event ID** — Paste an event UUID, looks up via `/api/evidence/{id}`
2. **By File** — Upload a file, its hash is checked against blockchain via `/api/verify`

**Status banners:**
- ✅ **Verified** — File is unmodified since recorded time
- ❌ **Mismatch** — Hash mismatch, possible tampering
- ⚠️ **Not Found** — No record on blockchain

### 2.3.5 Dashboard Page (Dashboard.tsx)

**Features:**
- Filterable list of all evidence records (All / Video / Audio)
- Each row shows: filename, event ID, detection type badge, confidence with color-coded dot, trust tier badge, date
- Click any row to navigate to full Results page
- Summary stats grid: Total Evidence, Authentic count, Flagged count, Beacon Anchored count

### 2.3.6 Industries Page (Industries.tsx)

**Showcases 4 core modules × 4 industries each = 16 use cases:**

1. **AI Detection Engine** → Social Media, Journalism, Banking, Education
2. **Blockchain Anchoring** → Legal/Law Enforcement, Intellectual Property, Healthcare, Supply Chain
3. **Liability Scoring** → Insurance, Regulatory Compliance, Platform Governance, Legal Tech
4. **PDF Certification** → Government, Corporate Audit, Media & Entertainment, Real Estate

### 2.3.7 Custody Page (Custody.tsx)

**Displays:**
- Full chain of custody timeline for a specific evidence item
- Each entry shows: custodian name, role, badge, action type, digital signature, timestamp
- Form to add new custody transfer events (name, role, badge, notes)

---

## 2.4 Data Flow Diagram

```
┌──────────┐     POST /api/upload     ┌───────────────────────┐
│  Upload  │ ──────────────────────→  │   FastAPI (main.py)   │
│  Page    │                          │                       │
│ (React)  │                          │  1. Save temp file    │
└──────────┘                          │  2. SHA-256 hash      │
                                      │  3. Gemini detection  │
                                      │  4. Blockchain reg    │
                                      │  5. Liability score   │
                                      │  6. PDF generate      │
                                      │  7. Save to SQLite    │
                                      │  8. Init custody      │
                                      │  9. C2PA manifest     │
                                      │ 10. SMS beacon        │
                                      └───────┬───────────────┘
                                              │
                        JSON response         │
              ┌───────────────────────────────┘
              ↓
┌──────────────────────┐
│   Results Page       │
│                      │
│  • Detection ring    │
│  • 4 model cards     │
│  • C2PA manifest     │
│  • SMS beacon        │
│  • Liability card    │
│  • Blockchain proof  │
│  • Custody chain     │
│  • PDF download      │
└──────────────────────┘
```

---

## 2.5 API Response Schema

### POST /api/upload — Response

```json
{
  "event_id": "uuid",
  "id": "uuid",
  "file_hash": "sha256_hex",
  "detection_type": "image|video|audio",
  "detection": {
    "confidence": 0.0-1.0,
    "is_synthetic": true|false,
    "label": "SYNTHETIC|AUTHENTIC",
    "explanation": "string",
    "model_breakdown": [
      {
        "name": "FFT Spectral Analysis",
        "confidence": 0.0-1.0,
        "weight": 0.25,
        "is_flagged": true|false,
        "xai_method": "string"
      }
    ],
    "agreement": "X/4",
    "ensemble_method": "Weighted Vote (Gemini-Powered)"
  },
  "liability_scores": {
    "user": { "percentage": 0-100, "raw_score": 0.0-1.0, "factors": {}, "explanation": "" },
    "platform": { "percentage": 0-100, "raw_score": 0.0-1.0, "factors": {}, "explanation": "" },
    "architect": { "percentage": 0-100, "raw_score": 0.0-1.0, "factors": {}, "explanation": "" }
  },
  "blockchain": { "tx_id": "0x...", "timestamp": "ISO8601" },
  "c2pa_manifest": { "manifest_id": "urn:c2pa:...", "trust_tier": {}, "assertions": {} },
  "sms_beacon": { "beacon_ref": "AG-2026-XXXX", "status": "ANCHORED", "cross_validation": {} },
  "custody_chain": [ { "custodian_name": "", "custodian_role": "", "timestamp": "" } ],
  "pdf_download_url": "/api/report/{id}/pdf",
  "timestamp": "ISO8601"
}
```

---

## 2.6 Security Considerations

| Aspect | Implementation |
|--------|---------------|
| **File integrity** | SHA-256 hashing ensures any modification is detectable |
| **Immutability** | Blockchain registration provides tamper-proof timestamps |
| **API keys** | All sensitive keys stored in `.env` file, never committed |
| **CORS** | Configurable origins in FastAPI middleware |
| **Temp files** | Uploaded files are deleted immediately after processing |
| **Digital signatures** | Custody transfers include cryptographic signatures |

---

## 2.7 Supported File Formats

| Type | Extensions |
|------|-----------|
| **Image** | .jpg, .jpeg, .png, .webp, .bmp |
| **Video** | .mp4, .avi, .mov, .mkv |
| **Audio** | .mp3, .wav, .flac, .m4a, .ogg |

---

## 2.8 Future Enhancements

1. **Real Ethereum Mainnet** deployment for production evidence registration
2. **Real SMS gateway** integration (Twilio / BSNL) for actual beacon transmission
4. **Multi-language support** for the frontend (Hindi, Marathi, etc.)
5. **Role-based authentication** for custody management
6. **Batch upload** support for processing multiple files
7. **Webhook notifications** for custody transfer alerts
8. **Export to NCRB** format for Indian police records
