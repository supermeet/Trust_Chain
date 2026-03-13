import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

/* eslint-disable @typescript-eslint/no-explicit-any */

function TierBadge({ tier }: { tier: string }) {
    const config: Record<string, { bg: string; text: string; label: string }> = {
        TIER_1: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', label: 'Tier 1 · Hardware' },
        TIER_2: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', label: 'Tier 2 · Software' },
        TIER_3: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', label: 'Tier 3 · Citizen' },
    }
    const c = config[tier] || config.TIER_3
    return (
        <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${c.bg} ${c.text}`}>
            {c.label}
        </span>
    )
}

function StatusDot({ synthetic }: { synthetic: boolean }) {
    return (
        <span className={`inline-block w-2 h-2 rounded-full ${synthetic ? 'bg-red-500' : 'bg-emerald-500'}`} />
    )
}

export default function Dashboard() {
    const [records, setRecords] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'video' | 'audio'>('all')

    useEffect(() => {
        axios
            .get('/api/evidence')
            .then((res) => setRecords(res.data))
            .catch(() => setRecords([]))
            .finally(() => setLoading(false))
    }, [])

    const filtered = filter === 'all' ? records : records.filter((r: any) => r.detection_type === filter)

    return (
        <div>
            <hr className="border-[--border-light]" />

            <section className="pt-16 pb-8 animate-enter">
                <h1 className="text-3xl font-semibold text-[--text] tracking-tight mb-1">Evidence Dashboard</h1>
                <p className="text-base text-[--text-secondary] mb-8">
                    All registered evidence with integrity status and trust tiers.
                </p>

                {/* Filter tabs */}
                <div className="flex gap-2 mb-8">
                    {(['all', 'video', 'audio'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${filter === f
                                ? 'bg-[--text] text-white'
                                : 'text-[--text-secondary] hover:text-[--text] bg-[--bg-secondary]'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </section>

            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <div className="flex items-center gap-3 text-[--text-dim] text-sm">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Loading…
                    </div>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-24 animate-enter">
                    <p className="text-[--text-dim] text-sm mb-4">No evidence records found.</p>
                    <Link
                        to="/upload"
                        className="inline-block px-6 py-3 bg-[--text] text-white text-sm font-medium rounded-full hover:bg-[#333336] transition-colors"
                    >
                        Upload evidence
                    </Link>
                </div>
            ) : (
                <div className="space-y-3 pb-16 animate-enter animate-enter-d1">
                    {/* Header */}
                    <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-2 text-[10px] font-semibold text-[--text-dim] uppercase tracking-wider">
                        <div className="col-span-4">Evidence</div>
                        <div className="col-span-2">Type</div>
                        <div className="col-span-2">Detection</div>
                        <div className="col-span-2">Trust Tier</div>
                        <div className="col-span-2">Date</div>
                    </div>

                    {filtered.map((record: any) => {
                        const detection = record.detection || {}
                        const tier = record.c2pa_manifest?.trust_tier?.level || 'TIER_3'
                        const isSynthetic = detection.is_synthetic
                        const confidence = detection.confidence ?? 0

                        return (
                            <Link
                                key={record.id}
                                to={`/results/${record.id}`}
                                className="block bg-[--bg-secondary] rounded-2xl px-5 py-4 transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:bg-white border border-transparent hover:border-[--border-light]"
                            >
                                <div className="sm:grid grid-cols-12 gap-4 items-center">
                                    {/* Filename */}
                                    <div className="col-span-4 mb-2 sm:mb-0">
                                        <p className="text-sm font-medium text-[--text] truncate">{record.filename || 'Unknown'}</p>
                                        <p className="text-[10px] text-[--text-dim] font-mono truncate">{record.id}</p>
                                    </div>

                                    {/* Type */}
                                    <div className="col-span-2 mb-2 sm:mb-0">
                                        <span className="text-xs font-medium text-[--text-secondary] bg-white px-3 py-1 rounded-full border border-[--border-light]">
                                            {record.detection_type || 'unknown'}
                                        </span>
                                    </div>

                                    {/* Detection */}
                                    <div className="col-span-2 mb-2 sm:mb-0 flex items-center gap-2">
                                        <StatusDot synthetic={isSynthetic} />
                                        <span className={`text-xs font-semibold ${isSynthetic ? 'text-red-600' : 'text-emerald-700'}`}>
                                            {(confidence * 100).toFixed(0)}%
                                        </span>
                                    </div>

                                    {/* Trust Tier */}
                                    <div className="col-span-2 mb-2 sm:mb-0">
                                        <TierBadge tier={tier} />
                                    </div>

                                    {/* Date */}
                                    <div className="col-span-2">
                                        <span className="text-xs text-[--text-dim]">
                                            {record.timestamp ? new Date(record.timestamp).toLocaleDateString() : '—'}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            )}

            {/* Stats */}
            {!loading && records.length > 0 && (
                <section className="pb-16 animate-enter animate-enter-d2">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-[--bg-secondary] rounded-2xl p-5 text-center">
                            <div className="text-2xl font-semibold text-[--text]">{records.length}</div>
                            <div className="text-xs text-[--text-dim] mt-1">Total Evidence</div>
                        </div>
                        <div className="bg-[--bg-secondary] rounded-2xl p-5 text-center">
                            <div className="text-2xl font-semibold text-emerald-700">
                                {records.filter((r: any) => !r.detection?.is_synthetic).length}
                            </div>
                            <div className="text-xs text-[--text-dim] mt-1">Authentic</div>
                        </div>
                        <div className="bg-[--bg-secondary] rounded-2xl p-5 text-center">
                            <div className="text-2xl font-semibold text-red-600">
                                {records.filter((r: any) => r.detection?.is_synthetic).length}
                            </div>
                            <div className="text-xs text-[--text-dim] mt-1">Flagged</div>
                        </div>
                        <div className="bg-[--bg-secondary] rounded-2xl p-5 text-center">
                            <div className="text-2xl font-semibold text-[--text]">
                                {records.filter((r: any) => r.sms_beacon?.status === 'ANCHORED').length}
                            </div>
                            <div className="text-xs text-[--text-dim] mt-1">Beacon Anchored</div>
                        </div>
                    </div>
                </section>
            )}

            <footer className="border-t border-[--border-light] py-6 text-center">
                <p className="text-xs text-[--text-dim]">
                    TrustChain · Evidence Integrity & Authentication · MIT License
                </p>
            </footer>
        </div>
    )
}
