import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import LiabilityCard from '../components/LiabilityCard'

interface PartyScore {
  percentage: number
  raw_score: number
  factors: Record<string, number>
}

interface EvidenceResult {
  id: string
  detection: {
    confidence: number
    label: string
    explanation: string
  }
  liability_scores: {
    user: PartyScore
    platform: PartyScore
    architect: PartyScore
  }
  blockchain: {
    tx_id: string
    timestamp: string
  }
}

export default function Results() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<EvidenceResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

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
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center gap-3 text-gray-400">
          <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Loading results…
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-950 border border-red-700 rounded-xl px-6 py-5 text-red-300">
          <p className="font-semibold mb-1">Error</p>
          <p className="text-sm">{error ?? 'Result not found.'}</p>
        </div>
      </div>
    )
  }

  const isSynthetic = data.detection.confidence >= 0.5
  const confidencePct = (data.detection.confidence * 100).toFixed(1)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Analysis Results</h1>
        <p className="text-gray-500 text-sm font-mono">Event ID: {data.id}</p>
      </div>

      {/* Detection result */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-200">Detection Result</h2>
          <span
            className={`px-3 py-1 rounded-full text-sm font-bold ${
              isSynthetic
                ? 'bg-red-900 text-red-300 border border-red-700'
                : 'bg-green-900 text-green-300 border border-green-700'
            }`}
          >
            {isSynthetic ? '⚠ SYNTHETIC' : '✓ AUTHENTIC'}
          </span>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-400">Synthetic confidence</span>
            <span className={`text-lg font-bold ${isSynthetic ? 'text-red-400' : 'text-green-400'}`}>
              {confidencePct}%
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all ${isSynthetic ? 'bg-red-500' : 'bg-green-500'}`}
              style={{ width: `${confidencePct}%` }}
            />
          </div>
        </div>

        <p className="text-gray-300 text-sm leading-relaxed">{data.detection.explanation}</p>
      </div>

      {/* Liability */}
      <LiabilityCard scores={data.liability_scores} />

      {/* Blockchain proof */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h2 className="text-base font-semibold text-gray-200 mb-4">🔗 Blockchain Proof</h2>
        <div className="space-y-2 text-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1">
            <span className="text-gray-400 sm:w-28 shrink-0">Transaction</span>
            <a
              href={`https://sepolia.etherscan.io/tx/${data.blockchain.tx_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 font-mono text-xs break-all underline underline-offset-2"
            >
              {data.blockchain.tx_id}
            </a>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1">
            <span className="text-gray-400 sm:w-28 shrink-0">Timestamp</span>
            <span className="text-gray-200">{new Date(data.blockchain.timestamp).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <a
          href={`/api/report/${data.id}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          📄 Download PDF Report
        </a>
        <button
          onClick={copyVerifyLink}
          className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          {copied ? '✅ Copied!' : '🔗 Copy Verification Link'}
        </button>
      </div>
    </div>
  )
}
