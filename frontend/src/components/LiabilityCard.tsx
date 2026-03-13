/* eslint-disable @typescript-eslint/no-explicit-any */

interface LiabilityCardProps {
  scores: any
}

const PARTY_CONFIG = [
  { key: 'user', label: 'User', color: '#1d1d1f' },
  { key: 'platform', label: 'Platform', color: '#86868b' },
  { key: 'architect', label: 'Architect', color: '#d2d2d7' },
]

function formatFactorName(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function getPercentage(party: any): number {
  if (!party) return 0
  return party.percentage ?? 0
}

function getRawScore(party: any): number {
  if (!party) return 0
  return party.raw_score ?? 0
}

function getFactorDisplay(value: any): string {
  if (typeof value === 'number') return value.toFixed(2)
  if (typeof value === 'object' && value !== null) {
    const pts = value.points ?? value.score ?? 0
    const max = value.max ?? 1
    return `${pts.toFixed(2)} / ${max.toFixed(2)}`
  }
  return String(value)
}

function getFactorEntries(factors: any): [string, any][] {
  if (!factors || typeof factors !== 'object') return []
  return Object.entries(factors)
}

export default function LiabilityCard({ scores }: LiabilityCardProps) {
  if (!scores) return null

  return (
    <div>
      <h3 className="text-sm font-semibold text-[--text] mb-5">Liability distribution</h3>

      <div className="flex rounded-full overflow-hidden h-3 mb-4 w-full bg-[--bg-secondary]">
        {PARTY_CONFIG.map(({ key, color }) => {
          const rawPct = getPercentage(scores[key])
          return (
            <div
              key={key}
              className="transition-all"
              style={{ width: `${Math.max(0, rawPct)}%`, backgroundColor: color }}
            />
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-5 mb-8">
        {PARTY_CONFIG.map(({ key, label, color }) => (
          <div key={key} className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-[--text-secondary] text-xs">
              {label}: <span className="text-[--text] font-semibold">{getPercentage(scores[key]).toFixed(1)}%</span>
            </span>
          </div>
        ))}
      </div>

      {/* Per-party breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PARTY_CONFIG.map(({ key, label }) => {
          const party = scores[key]
          if (!party) return null
          const factors = getFactorEntries(party.factors)
          return (
            <div key={key}>
              <h4 className="text-xs font-semibold mb-3 text-[--text]">{label}</h4>
              <div className="space-y-1.5">
                {factors.map(([factor, value]) => (
                  <div key={factor} className="flex justify-between text-xs gap-2">
                    <span className="text-[--text-dim] truncate">{formatFactorName(factor)}</span>
                    <span className="text-[--text-secondary] font-medium whitespace-nowrap">
                      {getFactorDisplay(value)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-2.5 border-t border-[--border-light] flex justify-between text-xs">
                <span className="text-[--text-dim]">Raw</span>
                <span className="text-[--text] font-semibold">{getRawScore(party).toFixed(3)}</span>
              </div>
            </div>
          )
        })}
      </div>

      {scores.explanation && (
        <p className="mt-6 text-[--text-dim] text-xs leading-relaxed">{scores.explanation}</p>
      )}
    </div>
  )
}