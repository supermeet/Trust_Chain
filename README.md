# TrustChain 🔗

> **Deepfake Detection · Blockchain Evidence Locking · Court-Ready Certificates**

TrustChain is a full-stack platform that detects deepfakes in audio and video files, permanently locks the evidence hash on the Ethereum Sepolia blockchain, computes an AI-driven liability score, and generates court-ready PDF certificates — all in a single workflow. Designed for legal proceedings, regulatory compliance, and forensic investigations where tamper-proof evidence integrity is non-negotiable.

---

## The Problem

| Stat | Detail |
|------|--------|
| **₹70,000 Cr** | Estimated annual deepfake-related fraud losses in India (NASSCOM, 2024) |
| **India IT Act §66D** | Criminalises cheating by personation using computer resources |
| **BSA §63** | Recognises electronic records as primary evidence when authenticity is provable |
| **Section 65B, Indian Evidence Act** | Requires a certificate of authenticity for electronic evidence to be admissible in court |

Current tools either detect deepfakes *or* preserve evidence — TrustChain does both, bridging the gap between forensic analysis and legal admissibility.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                     │
│              React 18 + Vite + Tailwind CSS                         │
│   Upload UI ──► Results Dashboard ──► Certificate Viewer            │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTP / REST
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     FASTAPI BACKEND  :8000                          │
│                                                                     │
│  POST /analyze                                                      │
│       │                                                             │
│       ├──► SHA-256 Hash  ───────────────────────────────────────┐   │
│       │                                                         │   │
│       ├──► Deepfake Detection                                   │   │
│       │        ├── Audio  (Wav2Vec / mock)                      │   │
│       │        └── Video  (EfficientNet / mock)                 │   │
│       │                                                         │   │
│       ├──► Blockchain Registry ◄────────────────────────────────┘   │
│       │        └── Ethereum Sepolia  (web3.py + Infura)             │
│       │             └── Smart Contract (Solidity)                   │
│       │                                                             │
│       ├──► Liability Scoring Engine                                 │
│       │        └── Weighted model (confidence + metadata)           │
│       │                                                             │
│       └──► PDF Certificate Generator  (ReportLab)                   │
│                └── Stored in /tmp/trustchain_pdfs                   │
│                                                                     │
│  SQLite DB  ──  stores analysis records & certificate paths         │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS, Axios |
| **Backend** | Python 3.11, FastAPI, Uvicorn |
| **AI / Detection** | PyTorch, EfficientNet (video), Wav2Vec2 (audio), OpenCV |
| **Blockchain** | Solidity 0.8, Ethereum Sepolia Testnet, web3.py, Infura |
| **PDF Generation** | ReportLab |
| **Database** | SQLite (via Python `sqlite3`) |
| **Containerisation** | Docker, Docker Compose |
| **Proxy / Static** | Nginx (Alpine) |

---

## Quick Start

### Option A — Docker (recommended)

**Prerequisites:** Docker ≥ 24, Docker Compose ≥ 2.

```bash
git clone https://github.com/your-org/Trust_Chain.git
cd Trust_Chain

# Start both services
docker compose up --build

# Frontend → http://localhost:5173
# Backend  → http://localhost:8000/docs
```

To run in detached mode:

```bash
docker compose up --build -d
docker compose logs -f          # tail logs
docker compose down             # stop & remove containers
```

---

### Option B — Manual Setup

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt

# Run with mock AI detection (no GPU required)
DETECTION_MODE=mock uvicorn main:app --reload --port 8000
```

#### Frontend

```bash
cd frontend
npm install
npm run dev                     # http://localhost:5173
```

---

## Deploy the Solidity Smart Contract (Remix IDE)

1. Open [https://remix.ethereum.org](https://remix.ethereum.org).
2. Create a new file, paste the contents of `backend/blockchain/EvidenceRegistry.sol`.
3. In **Solidity Compiler** tab, select version `0.8.x` and click **Compile**.
4. In **Deploy & Run** tab:
   - Environment → **Injected Provider - MetaMask**
   - Network → **Sepolia Testnet** (Chain ID 11155111)
   - Click **Deploy** and confirm the MetaMask transaction.
5. Copy the deployed **contract address** from the Remix console.
6. Set it in `backend/.env`:
   ```
   CONTRACT_ADDRESS=0xYourDeployedContractAddress
   ```

---

## Get Sepolia ETH & Infura Key

### Sepolia ETH (free testnet)

1. Visit [https://sepoliafaucet.com](https://sepoliafaucet.com) or [https://faucet.quicknode.com/ethereum/sepolia](https://faucet.quicknode.com/ethereum/sepolia).
2. Paste your MetaMask wallet address and request funds.
3. Funds arrive within ~1 minute.

### Infura API Key

1. Sign up at [https://app.infura.io](https://app.infura.io).
2. Create a new project → **Web3 API**.
3. Copy the **API Key** from the project dashboard.
4. Add to `backend/.env` — replace `YOUR_KEY` in the pre-configured URL:
   ```
   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
   WALLET_PRIVATE_KEY=your_wallet_private_key_here
   CONTRACT_ADDRESS=0xYourDeployedContractAddress
   ```


---

## Switch from Mock to Real AI Detection

By default `DETECTION_MODE=mock` returns deterministic demo results without requiring a GPU. To enable real AI models:

1. Ensure you have a CUDA-capable GPU (or sufficient RAM for CPU inference).
2. Install the full model dependencies:
   ```bash
   pip install torch torchvision torchaudio transformers
   ```
3. Update `backend/.env` (or Docker environment):
   ```
   DETECTION_MODE=real
   ```
4. On first run, models are downloaded automatically from Hugging Face (~2 GB).

---

## API Endpoints

| Method | Endpoint | Description | Request | Response |
|--------|----------|-------------|---------|----------|
| `GET`  | `/api/health` | Service health check | — | `{"status": "ok"}` |
| `POST` | `/api/upload` | Upload a file for deepfake analysis and evidence registration | `multipart/form-data` — field `file` (audio/video) | JSON: `id`, `sha256`, `is_deepfake`, `confidence`, `liability`, `tx_hash`, `pdf_url` |
| `GET`  | `/api/evidence/{id}` | Retrieve a stored evidence record | Path param `id` (string) | JSON: full evidence record |
| `POST` | `/api/verify` | Re-hash an uploaded file and confirm on-chain integrity | `multipart/form-data` — field `file` | JSON: `match`, `sha256`, `on_chain_hash` |
| `GET`  | `/api/report/{id}/pdf` | Download the court-ready PDF certificate | Path param `id` (string) | `application/pdf` binary stream |

### Example — Upload a file for analysis

```bash
curl -X POST http://localhost:8000/api/upload \
  -F "file=@/path/to/video.mp4"
```

```json
{
  "id": "a3f5c9d1",
  "filename": "video.mp4",
  "sha256": "a3f5c9...",
  "is_deepfake": true,
  "confidence": 0.94,
  "liability": {
    "user": {"percentage": 52, "raw_score": 0.77},
    "platform": {"percentage": 31, "raw_score": 0.46},
    "architect": {"percentage": 17, "raw_score": 0.25}
  },
  "tx_hash": "0xabc123...",
  "pdf_url": "/api/report/a3f5c9d1/pdf"
}
```

---

## How the Liability Score Is Calculated

TrustChain computes liability across **three independent parties** — the end user, the platform, and the AI model architect — each scored on weighted sub-factors. Scores are then normalised to percentage shares that sum to 100 %.

### User liability (max raw score 1.00)

| Factor | Max pts | Legal basis |
|--------|---------|-------------|
| Intent (disclosure stripped, distributed) | 0.35 | IPC §66E / IT Act §72A |
| Action (distribution + stripping) | 0.30 | IPC §500 / Defamation Act |
| Victim impersonation (consent) | 0.20 | IT Act §43A |
| Prior offences | 0.15 | CrPC §110 / Repeat Offender doctrine |

### Platform liability (max raw score 1.00)

| Factor | Max pts | Legal basis |
|--------|---------|-------------|
| Detection capability gap | 0.25 | IT Rules 2021 Rule 4(4) |
| Takedown response time (>36 h = max penalty) | 0.35 | IT Rules 2021 Rule 4(1)(d) |
| Amplification reach | 0.25 | EU DSA Art. 34 — Systemic risk |
| Safe harbour erosion | 0.15 | IT Act §79 |

### AI Architect liability (max raw score 1.00)

| Factor | Max pts | Legal basis |
|--------|---------|-------------|
| Safeguards (watermark / content filter) | 0.40 | EU AI Act Art. 9 |
| Access control model | 0.30 | EU AI Act Art. 13 |
| Known incident history | 0.30 | Product liability — negligent design |

### Normalisation

```
user_pct     = round(raw_user     / (raw_user + raw_platform + raw_architect) * 100)
platform_pct = round(raw_platform / (raw_user + raw_platform + raw_architect) * 100)
architect_pct = 100 − user_pct − platform_pct
```

### Legal admissibility

- **Section 65B, Indian Evidence Act** — the PDF certificate satisfies the §65B authenticity requirement for electronic evidence.
- **BSA §63** — the blockchain transaction hash serves as an immutable audit trail recognised as primary electronic evidence.
- **IT Act §66D / §72A** — the user liability factors map directly to personalisation and privacy-breach offences.

---

## Screenshots / Demo

> 📸 *Screenshots and a live demo video will be added here before the v1.0 release.*
>
> In the meantime, spin up the stack with `docker compose up --build` and navigate to [http://localhost:5173](http://localhost:5173) to explore the UI.

---

## Project Structure

```
Trust_Chain/
├── backend/
│   ├── main.py                 # FastAPI application & all route handlers
│   ├── hash_engine.py          # SHA-256 file hashing
│   ├── database.py             # SQLite helpers
│   ├── blockchain/
│   │   ├── contract.py         # web3.py Ethereum interaction
│   │   └── EvidenceRegistry.sol  # Solidity smart contract
│   ├── detection/
│   │   ├── audio_detector.py   # Wav2Vec2 / mock audio deepfake detector
│   │   └── video_detector.py   # EfficientNet / mock video deepfake detector
│   ├── legal/
│   │   └── pdf_generator.py    # ReportLab court-ready certificate builder
│   ├── liability/
│   │   ├── scorer.py           # Three-party liability scoring engine
│   │   └── model_registry.json # Known AI model metadata
│   ├── .env.example
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   └── pages/
│   ├── package.json
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feat/your-feature`.
3. Commit your changes: `git commit -m "feat: describe your change"`.
4. Push and open a Pull Request.

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.


