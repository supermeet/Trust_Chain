import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import LiabilityCard from '../components/LiabilityCard'

/* eslint-disable @typescript-eslint/no-explicit-any */

function ConfidenceRing({ value, isSynthetic }: { value: number; isSynthetic: boolean }) {
  const pct = Math.round(value * 100)
  const radius = 50
  const circumference = 2 * Math.PI * radius
  const dashoffset = circumference - (value * circumference)
  const color = isSynthetic ? 'var(--danger)' : 'var(--success)'
  const glowColor = isSynthetic ? 'var(--danger-glow)' : 'var(--success-glow)'

  return (
    <div className="confidence-ring">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--surface-3)" strokeWidth="8" />
        <circle
          cx="60" cy="60" r={radius} fill="none"
          stroke={color} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          style={{
            transition: 'stroke-dashoffset 1s ease-out',
            filter: `drop-shadow(0 0 8px ${glowColor})`,
          }}
        />
      </svg>
      <div className="value" style={{ color }}>{pct}%</div>
    </div>
  )
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 py-3">
      <span className="text-xs text-[--text-dim] sm:w-28 shrink-0">{label}</span>
      <div className="text-sm text-[--text]">{children}</div>
    </div>
  )
}

function ModelCard({ model }: { model: any }) {
  const pct = Math.round(model.confidence * 100)
  const barColor = model.is_flagged ? 'var(--danger)' : 'var(--success)'
  const barGlow = model.is_flagged ? 'rgba(255,77,109,0.3)' : 'rgba(45,212,191,0.3)'

  return (
    <div className="glass-card-static p-5 animate-tilt-in">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-[--text]">{model.name}</h4>
        <span className={model.is_flagged ? 'badge badge-danger text-[10px]' : 'badge badge-success text-[10px]'}>
          {model.is_flagged ? 'FLAGGED' : 'PASS'}
        </span>
      </div>

      <div className="w-full h-2 bg-[--surface-3] rounded-full mb-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${pct}%`,
            background: barColor,
            boxShadow: `0 0 10px ${barGlow}`,
          }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-[--text-dim]">Confidence: {pct}%</span>
        <span className="text-[10px] text-[--text-dim]">Weight: {(model.weight * 100).toFixed(0)}%</span>
      </div>

      <p className="text-[10px] text-[--text-dim] mt-2">XAI: {model.xai_method}</p>
    </div>
  )
}

function TierBadge({ tier }: { tier: any }) {
  const levelConfig: Record<string, { cls: string }> = {
    TIER_1: { cls: 'badge-success' },
    TIER_2: { cls: 'badge-accent' },
    TIER_3: { cls: 'badge-warn' },
  }
  const cfg = levelConfig[tier?.level] || levelConfig.TIER_3
  return (
    <span className={`badge ${cfg.cls} text-xs`}>
      {tier?.label || 'Unknown Tier'}
    </span>
  )
}

export default function Results() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [manifestOpen, setManifestOpen] = useState(false)

  useEffect(() => {
    if (!id) return
    axios
      .get(`/api/evidence/${id}`)
      .then((res) => setData(res.data))
      .catch((err) => {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.detail ?? 'Failed to load results.')
        } else {
          setError('An unexpected error occurred.')
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  function copyVerifyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/verify?id=${id}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex items-center gap-3 text-[--text-dim] text-sm">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Loading…
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto py-16">
        <div className="rounded-2xl border border-[rgba(255,77,109,0.3)] bg-[var(--danger-glow)] px-6 py-5 text-[--danger]">
          <p className="font-semibold mb-1">Error</p>
          <p className="text-sm">{error ?? 'Result not found.'}</p>
        </div>
      </div>
    )
  }

  const detection = data.detection || data.detection_result || {}
  const confidence = detection.confidence ?? data.detection_confidence ?? 0
  const explanation = detection.explanation ?? ''
  const isSynthetic = confidence >= 0.5
  const label = detection.label || (isSynthetic ? 'SYNTHETIC' : 'AUTHENTIC')
  const blockchain = data.blockchain || {}
  const txId = blockchain.tx_id || data.blockchain_tx_id || ''
  const blockchainTimestamp = blockchain.timestamp || data.timestamp || ''
  const liabilityScores = data.liability_scores || data.liability || null
  const eventId = data.id || id

  const modelBreakdown = detection.model_breakdown || []
  const agreement = detection.agreement || ''
  const c2paManifest = data.c2pa_manifest || null
  const smsBeacon = data.sms_beacon || null
  const custodyChain = data.custody_chain || []

  return (
    <div className="max-w-3xl mx-auto py-16 px-4 animate-enter">
      <h1 className="font-display text-3xl font-bold text-[--text] tracking-tight mb-1">Results</h1>
      <p className="text-xs text-[--text-dim] font-mono mb-12 break-all">{eventId}</p>

      {/* ── Verdict Banner ── */}
      <div
        className={`rounded-2xl p-6 mb-14 animate-extrude ${
          isSynthetic
            ? 'bg-[var(--danger-glow)] border border-[rgba(255,77,109,0.25)]'
            : 'bg-[var(--success-glow)] border border-[rgba(45,212,191,0.25)]'
        }`}
      >
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-sm font-semibold text-[--text]">Detection</h2>
          <span className={isSynthetic ? 'badge badge-danger animate-pulse-slow' : 'badge badge-success'}>
            {label}
          </span>
        </div>

        <div className="flex items-center gap-10 mb-6">
          <ConfidenceRing value={confidence} isSynthetic={isSynthetic} />
          <div>
            <div className="text-xs text-[--text-dim] mb-1">Ensemble Confidence</div>
            <div className={`text-4xl font-bold tracking-tight ${isSynthetic ? 'text-[--danger]' : 'text-[--success]'}`}>
              {(confidence * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-[--text-dim] mt-1">
              {agreement && `Agreement: ${agreement} models`}
              {!agreement && (isSynthetic ? 'Likely synthetic or manipulated' : 'Appears authentic')}
            </div>
          </div>
        </div>

        {explanation && (
          <div className="glass-card-static p-4">
            <p className="text-sm text-[--text-secondary] leading-relaxed">{explanation}</p>
          </div>
        )}
      </div>

      {/* ── Multi-Modal AI Breakdown ── */}
      {modelBreakdown.length > 0 && (
        <div className="mb-14">
          <h2 className="text-sm font-semibold text-[--text] mb-2">Multi-Modal AI Analysis</h2>
          <p className="text-xs text-[--text-dim] mb-6">
            {modelBreakdown.length} independent models · {detection.ensemble_method || 'Weighted Vote'} ensemble
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {modelBreakdown.map((model: any, i: number) => (
              <ModelCard key={i} model={model} />
            ))}
          </div>
        </div>
      )}

      {modelBreakdown.length > 0 && <hr className="mb-14" />}

      {/* ── C2PA Manifest ── */}
      {c2paManifest && (
        <div className="mb-14">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[--text]">Content Provenance (C2PA)</h2>
            <TierBadge tier={c2paManifest.trust_tier} />
          </div>

          <div className="glass-card-static p-5">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-[10px] text-[--text-dim] mb-1">Manifest ID</p>
                <p className="text-xs font-mono text-[--text] break-all">{c2paManifest.manifest_id}</p>
              </div>
              <div>
                <p className="text-[10px] text-[--text-dim] mb-1">C2PA Version</p>
                <p className="text-xs text-[--text]">{c2paManifest.c2pa_version}</p>
              </div>
              <div>
                <p className="text-[10px] text-[--text-dim] mb-1">Station</p>
                <p className="text-xs text-[--text]">{c2paManifest.assertions?.['le.station_context']?.station_id || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] text-[--text-dim] mb-1">Device</p>
                <p className="text-xs text-[--text]">{c2paManifest.assertions?.['le.device_attestation']?.platform || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] text-[--text-dim] mb-1">AI Triage</p>
                <p className={`text-xs font-semibold ${c2paManifest.assertions?.['le.ai_triage']?.result === 'PASS' ? 'text-[--success]' : 'text-[--danger]'}`}>
                  {c2paManifest.assertions?.['le.ai_triage']?.result || '—'}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-[--text-dim] mb-1">Trust Weight</p>
                <p className="text-xs text-[--text]">{c2paManifest.trust_tier?.weight || '—'}</p>
              </div>
            </div>

            <button
              onClick={() => setManifestOpen(!manifestOpen)}
              className="text-xs text-[--link] hover:text-[--link-hover] font-medium transition-colors"
            >
              {manifestOpen ? 'Hide raw manifest ▴' : 'View raw manifest ▾'}
            </button>

            {manifestOpen && (
              <pre className="mt-3 text-[10px] text-[--text-secondary] bg-[--surface-1] rounded-xl p-4 overflow-x-auto border border-[--border-subtle] max-h-[300px] overflow-y-auto">
                {JSON.stringify(c2paManifest, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}

      {c2paManifest && <hr className="mb-14" />}

      {/* ── SMS Beacon ── */}
      {smsBeacon && (
        <div className="mb-14">
          <h2 className="text-sm font-semibold text-[--text] mb-4">SMS Beacon Anchor</h2>

          <div className="glass-card-static p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] text-[--text-dim] mb-1">Beacon Reference</p>
                <p className="text-base font-semibold font-mono text-[--text]">{smsBeacon.beacon_ref}</p>
              </div>
              <span className={smsBeacon.status === 'ANCHORED' ? 'badge badge-success text-[10px]' : 'badge badge-danger text-[10px]'}>
                {smsBeacon.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-[10px] text-[--text-dim] mb-1">Hash Prefix (SMS)</p>
                <p className="text-xs font-mono text-[--text]">{smsBeacon.hash_prefix}</p>
              </div>
              <div>
                <p className="text-[10px] text-[--text-dim] mb-1">Station Code</p>
                <p className="text-xs text-[--text]">{smsBeacon.station_code}</p>
              </div>
              <div>
                <p className="text-[10px] text-[--text-dim] mb-1">Network Delay</p>
                <p className="text-xs text-[--text]">{smsBeacon.network_delay_ms}ms</p>
              </div>
              <div>
                <p className="text-[10px] text-[--text-dim] mb-1">SMS Cost</p>
                <p className="text-xs text-[--text]">₹{smsBeacon.sms_cost_inr}</p>
              </div>
            </div>

            {/* Cross-validation */}
            <div className="bg-[--surface-1] rounded-xl p-4 border border-[--border-subtle]">
              <p className="text-[10px] text-[--text-dim] font-semibold mb-3 uppercase tracking-wider">Cross-Validation</p>
              <div className="space-y-2">
                {[
                  { label: 'Hash prefix matches full hash', ok: smsBeacon.cross_validation?.hash_prefix_match },
                  { label: 'Timestamp within tolerance', ok: smsBeacon.cross_validation?.timestamp_within_tolerance },
                  { label: 'Station key signature valid', ok: smsBeacon.cross_validation?.station_key_valid },
                ].map((check, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className={`text-xs ${check.ok ? 'text-[--success]' : 'text-[--danger]'}`}>
                      {check.ok ? '✓' : '✗'}
                    </span>
                    <span className="text-xs text-[--text-secondary]">{check.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-[--text-dim] mt-3 font-mono">
              SMS: {smsBeacon.sms_content}
            </p>
          </div>
        </div>
      )}

      {smsBeacon && <hr className="mb-14" />}

      {/* ── Liability ── */}
      {liabilityScores && liabilityScores.user && (
        <div className="mb-14">
          <LiabilityCard scores={liabilityScores} />
        </div>
      )}

      {/* ── Blockchain ── */}
      {liabilityScores && liabilityScores.user && <hr className="mb-14" />}
      <div className="mb-14">
        <h2 className="text-sm font-semibold text-[--text] mb-4">Blockchain proof</h2>
        <div className="divide-y divide-[--border-subtle]">
          <InfoRow label="Transaction">
            {txId ? (
              <a
                href={`https://sepolia.etherscan.io/tx/${txId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[--link] hover:text-[--link-hover] font-mono text-xs break-all"
              >
                {txId}
              </a>
            ) : (
              <span className="text-[--text-dim] text-xs">Not available</span>
            )}
          </InfoRow>
          <InfoRow label="Timestamp">
            {blockchainTimestamp ? new Date(blockchainTimestamp).toLocaleString() : 'N/A'}
          </InfoRow>
          <InfoRow label="File hash">
            <span className="font-mono text-xs break-all">{data.file_hash || '—'}</span>
          </InfoRow>
        </div>
      </div>

      <hr className="mb-14" />

      {/* ── Chain of Custody Preview ── */}
      {custodyChain.length > 0 && (
        <div className="mb-14">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[--text]">Chain of Custody</h2>
            <Link
              to={`/custody/${eventId}`}
              className="text-xs text-[--link] hover:text-[--link-hover] font-medium transition-colors"
            >
              View full chain →
            </Link>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {custodyChain.map((evt: any, i: number) => (
              <div key={i} className="flex items-center gap-2 shrink-0">
                <div className="glass-card-static rounded-xl px-3 py-2 !p-3">
                  <p className="text-[10px] font-semibold text-[--text]">{evt.custodian_role}</p>
                  <p className="text-[10px] text-[--text-dim]">{evt.custodian_name}</p>
                </div>
                {i < custodyChain.length - 1 && (
                  <span className="text-[--accent]">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {custodyChain.length > 0 && <hr className="mb-6" />}

      {/* ── Actions ── */}
      <div className="flex flex-wrap gap-3 animate-enter animate-enter-d4">
        <a
          href={`/api/report/${eventId}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-gold"
        >
          Download PDF Certificate
        </a>
        <Link to={`/custody/${eventId}`} className="btn-ghost">
          Custody log
        </Link>
        <button onClick={copyVerifyLink} className="btn-ghost">
          {copied ? '✓ Copied' : 'Copy verify link'}
        </button>
        <Link to="/upload" className="px-5 py-2.5 text-[--link] hover:text-[--link-hover] text-sm font-medium transition-colors">
          ← New analysis
        </Link>
      </div>
    </div>
  )
}
