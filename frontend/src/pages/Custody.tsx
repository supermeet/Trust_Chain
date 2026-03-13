import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'

/* eslint-disable @typescript-eslint/no-explicit-any */

const VALID_ROLES = [
    'Investigating Officer',
    'Forensic Analyst',
    'Station House Officer',
    'Public Prosecutor',
    'Court Registrar',
    'Defense Counsel',
]

const ROLE_ICONS: Record<string, string> = {
    'Investigating Officer': '🔍',
    'Forensic Analyst': '🔬',
    'Station House Officer': '🏛️',
    'Public Prosecutor': '⚖️',
    'Court Registrar': '📋',
    'Defense Counsel': '🛡️',
}

const ACTION_STYLES: Record<string, string> = {
    registered: 'badge-accent',
    transfer: 'badge-success',
}

function TimelineEvent({ event, isLast, index }: { event: any; isLast: boolean; index: number }) {
    const actionCls = ACTION_STYLES[event.action] || ACTION_STYLES.transfer

    return (
        <div
            className="flex gap-4 animate-enter"
            style={{ animationDelay: `${index * 100}ms` }}
        >
            {/* Timeline line + dot */}
            <div className="flex flex-col items-center">
                <div
                    className="w-3 h-3 rounded-full bg-[--accent] border-2 border-[--bg] shrink-0 mt-1.5"
                    style={{ boxShadow: '0 0 10px var(--accent-glow)' }}
                />
                {!isLast && <div className="w-px flex-1 border-l border-dashed border-[rgba(79,142,255,0.3)] min-h-[40px]" />}
            </div>

            {/* Event content */}
            <div className="pb-8 flex-1">
                <div className="glass-card-static p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">{ROLE_ICONS[event.custodian_role] || '👤'}</span>
                            <div>
                                <p className="text-sm font-semibold text-[--text]">{event.custodian_name}</p>
                                <p className="text-[10px] text-[--text-dim]">{event.custodian_role}</p>
                            </div>
                        </div>
                        <span className={`badge ${actionCls} text-[10px]`}>
                            {event.action}
                        </span>
                    </div>

                    {event.custodian_badge && (
                        <p className="text-xs text-[--text-dim] mb-2">
                            Badge: <span className="font-mono">{event.custodian_badge}</span>
                        </p>
                    )}

                    {event.notes && (
                        <p className="text-xs text-[--text-secondary] mb-3">{event.notes}</p>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-[--text-dim]">
                        <span>{event.timestamp ? new Date(event.timestamp).toLocaleString() : '—'}</span>
                        <span className="font-mono truncate max-w-[180px]" title={event.signature}>
                            Sig: {event.signature?.slice(0, 14)}…
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function Custody() {
    const { id } = useParams<{ id: string }>()
    const [chain, setChain] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [showForm, setShowForm] = useState(false)
    const [formName, setFormName] = useState('')
    const [formRole, setFormRole] = useState(VALID_ROLES[0])
    const [formBadge, setFormBadge] = useState('')
    const [formNotes, setFormNotes] = useState('')
    const [submitting, setSubmitting] = useState(false)

    function fetchChain() {
        if (!id) return
        setLoading(true)
        axios
            .get(`/api/custody/${id}`)
            .then((res) => setChain(res.data.chain || []))
            .catch(() => setError('Failed to load custody chain.'))
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        fetchChain()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    async function handleTransfer(e: React.FormEvent) {
        e.preventDefault()
        if (!formName.trim() || !id) return
        setSubmitting(true)
        try {
            const form = new FormData()
            form.append('custodian_name', formName)
            form.append('custodian_role', formRole)
            form.append('custodian_badge', formBadge)
            form.append('notes', formNotes)
            await axios.post(`/api/custody/${id}/transfer`, form)
            setFormName('')
            setFormBadge('')
            setFormNotes('')
            setShowForm(false)
            fetchChain()
        } catch {
            setError('Failed to log transfer.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto py-16 animate-enter">
            <div className="flex items-center justify-between mb-2">
                <h1 className="font-display text-3xl font-bold text-[--text] tracking-tight">Chain of Custody</h1>
                <Link
                    to={`/results/${id}`}
                    className="text-xs text-[--link] hover:text-[--link-hover] font-medium transition-colors"
                >
                    ← Back to results
                </Link>
            </div>
            <p className="text-xs text-[--text-dim] font-mono mb-10">{id}</p>

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
            ) : error ? (
                <div className="rounded-2xl border border-[rgba(255,77,109,0.3)] bg-[var(--danger-glow)] px-6 py-5 text-[--danger]">
                    <p className="text-sm">{error}</p>
                </div>
            ) : (
                <>
                    {/* Summary */}
                    <div className="flex gap-4 mb-10">
                        <div className="glass-card flex-1 text-center !p-5">
                            <div className="text-2xl font-bold text-[--text]">{chain.length}</div>
                            <div className="text-xs text-[--text-dim] mt-1">Total Custodians</div>
                        </div>
                        <div className="glass-card flex-1 text-center !p-5">
                            <div className="text-2xl font-bold text-[--success]">✓</div>
                            <div className="text-xs text-[--text-dim] mt-1">No Gaps</div>
                        </div>
                        <div className="glass-card flex-1 text-center !p-5">
                            <div className="text-2xl font-bold text-[--accent]">{chain.length}</div>
                            <div className="text-xs text-[--text-dim] mt-1">Signatures</div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="mb-8">
                        <h2 className="text-sm font-semibold text-[--text] mb-6">Custody Timeline</h2>
                        {chain.map((event: any, i: number) => (
                            <TimelineEvent key={i} event={event} isLast={i === chain.length - 1} index={i} />
                        ))}
                    </div>

                    {/* Transfer */}
                    {!showForm ? (
                        <button
                            onClick={() => setShowForm(true)}
                            className="btn-glow w-full"
                        >
                            Log custody transfer
                        </button>
                    ) : (
                        <form onSubmit={handleTransfer} className="space-y-4 animate-enter">
                            <h3 className="text-sm font-semibold text-[--text]">New Custody Transfer</h3>

                            <input
                                type="text"
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                                placeholder="Custodian name"
                                className="input-dark"
                                required
                            />

                            <select
                                value={formRole}
                                onChange={(e) => setFormRole(e.target.value)}
                                className="input-dark"
                            >
                                {VALID_ROLES.map((role) => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>

                            <input
                                type="text"
                                value={formBadge}
                                onChange={(e) => setFormBadge(e.target.value)}
                                placeholder="Badge number (optional)"
                                className="input-dark"
                            />

                            <textarea
                                value={formNotes}
                                onChange={(e) => setFormNotes(e.target.value)}
                                placeholder="Transfer notes (optional)"
                                className="input-dark min-h-[80px] resize-none"
                            />

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={submitting || !formName.trim()}
                                    className="btn-glow flex-1"
                                >
                                    {submitting ? 'Submitting…' : 'Submit Transfer'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="btn-ghost"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </>
            )}
        </div>
    )
}
