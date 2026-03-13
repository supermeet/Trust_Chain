import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

/* eslint-disable @typescript-eslint/no-explicit-any */

function TierBadge({ tier }: { tier: string }) {
    const config: Record<string, { cls: string; label: string }> = {
        TIER_1: { cls: 'badge-success', label: 'Tier 1 · Hardware' },
        TIER_2: { cls: 'badge-accent', label: 'Tier 2 · Software' },
        TIER_3: { cls: 'badge-warn', label: 'Tier 3 · Citizen' },
    }
    const c = config[tier] || config.TIER_3
    return (
        <span className={`badge ${c.cls} text-[10px]`}>
            {c.label}
        </span>
    )
}

function StatusDot({ synthetic }: { synthetic: boolean }) {
    return (
        <span className={`inline-block w-2 h-2 rounded-full ${synthetic ? 'bg-[--danger]' : 'bg-[--success]'}`}
              style={{ boxShadow: synthetic ? '0 0 8px var(--danger-glow)' : '0 0 8px var(--success-glow)' }}
        />
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
            <section className="pt-16 pb-8 animate-enter">
                <h1 className="font-display text-3xl font-bold text-[--text] tracking-tight mb-1">Evidence Dashboard</h1>
                <p className="text-base text-[--text-secondary] mb-8">
                    All registered evidence with integrity status and trust tiers.
                </p>

                {/* Filter tabs */}
                <div className="flex gap-2 mb-8">
                    {(['all', 'video', 'audio'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${filter === f
                                ? 'bg-[--accent] text-white shadow-[0_0_15px_rgba(79,142,255,0.3)]'
                                : 'text-[--text-secondary] hover:text-[--text] bg-[--surface-2] border border-[--border-subtle]'
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
                    <Link to="/upload" className="btn-glow">
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
                                className="block glass-card-static !p-5 transition-all hover:border-[--accent] hover:shadow-[0_0_20px_rgba(79,142,255,0.1)] group"
                            >
                                <div className="sm:grid grid-cols-12 gap-4 items-center">
                                    <div className="col-span-4 mb-2 sm:mb-0">
                                        <p className="text-sm font-medium text-[--text] truncate group-hover:text-[--accent] transition-colors">{record.filename || 'Unknown'}</p>
                                        <p className="text-[10px] text-[--text-dim] font-mono truncate">{record.id}</p>
                                    </div>
                                    <div className="col-span-2 mb-2 sm:mb-0">
                                        <span className="badge badge-accent text-xs">
                                            {record.detection_type || 'unknown'}
                                        </span>
                                    </div>
                                    <div className="col-span-2 mb-2 sm:mb-0 flex items-center gap-2">
                                        <StatusDot synthetic={isSynthetic} />
                                        <span className={`text-xs font-semibold ${isSynthetic ? 'text-[--danger]' : 'text-[--success]'}`}>
                                            {(confidence * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="col-span-2 mb-2 sm:mb-0">
                                        <TierBadge tier={tier} />
                                    </div>
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
                        <div className="glass-card text-center !p-5">
                            <div className="text-2xl font-bold text-[--text]">{records.length}</div>
                            <div className="text-xs text-[--text-dim] mt-1">Total Evidence</div>
                        </div>
                        <div className="glass-card text-center !p-5">
                            <div className="text-2xl font-bold text-[--success]">
                                {records.filter((r: any) => !r.detection?.is_synthetic).length}
                            </div>
                            <div className="text-xs text-[--text-dim] mt-1">Authentic</div>
                        </div>
                        <div className="glass-card text-center !p-5">
                            <div className="text-2xl font-bold text-[--danger]">
                                {records.filter((r: any) => r.detection?.is_synthetic).length}
                            </div>
                            <div className="text-xs text-[--text-dim] mt-1">Flagged</div>
                        </div>
                        <div className="glass-card text-center !p-5">
                            <div className="text-2xl font-bold text-[--accent]">
                                {records.filter((r: any) => r.sms_beacon?.status === 'ANCHORED').length}
                            </div>
                            <div className="text-xs text-[--text-dim] mt-1">Beacon Anchored</div>
                        </div>
                    </div>
                </section>
            )}

            <footer className="border-t border-[--border-subtle] py-8 text-center">
                <p className="text-xs text-[--text-dim]">
                    TrustChain · Evidence Integrity & Authentication · MIT License
                </p>
            </footer>
        </div>
    )
}
