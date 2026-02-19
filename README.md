# TrustChain 🔗🛡️

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
│       ├──► SHA-256 Hash  ──────────────────────────────────────┐   │
│       │                                                         │   │
│       ├──► Deepfake Detection                                   │   │
│       │        ├── Audio  (Wav2Vec / mock)                      │   │
│       │        └── Video  (EfficientNet / mock)                 │   │
│       │                                                         │   │
│       ├──► Blockchain Registry ◄───────────────────────────────┘   │
│       │        └── Ethereum Sepolia  (web3.py + Infura)            │
│       │             └── Smart Contract (Solidity)                  │
│       │                                                             │
│       ├──► Liability Scoring Engine                                 │
│       │        └── Weighted model (confidence + metadata)          │
│       │                                                             │
│       └──► PDF Certificate Generator  (ReportLab)                  │
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
2. Create a new file, paste the contents of `backend/contracts/TrustChain.sol`.
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
4. Add to `backend/.env`:
   ```
   INFURA_API_KEY=your_infura_key_here
   WALLET_PRIVATE_KEY=your_wallet_private_key_here
   ```

> ⚠️ **Never commit private keys.** `.env` is in `.gitignore` by default.

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
| `POST` | `/analyze` | Upload a file for deepfake analysis | `multipart/form-data` — field `file` (audio/video) | JSON: `analysis_id`, `is_deepfake`, `confidence`, `liability_score`, `blockchain_tx` |
| `GET` | `/results/{analysis_id}` | Retrieve stored analysis result | Path param `analysis_id` (int) | JSON: full analysis record |
| `GET` | `/certificate/{analysis_id}` | Download the PDF certificate | Path param `analysis_id` (int) | `application/pdf` binary stream |
| `GET` | `/history` | List all past analyses | — | JSON array of analysis summaries |
| `GET` | `/health` | Service health check | — | `{"status": "ok"}` |

### Example — Analyze a file

```bash
curl -X POST http://localhost:8000/analyze \
  -F "file=@/path/to/video.mp4"
```

```json
{
  "analysis_id": 42,
  "filename": "video.mp4",
  "file_hash": "a3f5c9...",
  "is_deepfake": true,
  "confidence": 0.94,
  "liability_score": 87,
  "blockchain_tx": "0xabc123...",
  "certificate_url": "/certificate/42"
}
```

---

## How the Liability Score Is Calculated

The liability score (0 – 100) quantifies the legal risk associated with a piece of media:

```
liability_score = round(
    (deepfake_confidence × 0.60) +
    (metadata_anomaly_score × 0.25) +
    (blockchain_verification_bonus × 0.15)
) × 100
```

| Component | Weight | Description |
|-----------|--------|-------------|
| `deepfake_confidence` | 60 % | Model confidence that the file is synthetic |
| `metadata_anomaly_score` | 25 % | Inconsistencies in EXIF / container metadata |
| `blockchain_verification_bonus` | 15 % | Reward for on-chain hash registration |

### Legal Basis

- **Section 65B, Indian Evidence Act** — a score ≥ 70 triggers generation of a §65B-compliant certificate, satisfying the authenticity requirement for electronic evidence admissibility.
- **BSA §63** — the blockchain transaction hash serves as an immutable audit trail recognised as primary electronic evidence.
- **IT Act §66D** — the liability score assists courts in establishing intent and the degree of personation via computer resources.

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
│   ├── main.py                 # FastAPI application entry point
│   ├── detection.py            # Deepfake detection (mock + real)
│   ├── blockchain.py           # Ethereum interaction via web3.py
│   ├── pdf_generator.py        # ReportLab certificate builder
│   ├── liability.py            # Liability scoring engine
│   ├── database.py             # SQLite helpers
│   ├── contracts/
│   │   └── TrustChain.sol      # Solidity smart contract
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

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">Built with ❤️ for a safer, verifiable internet.</p>
