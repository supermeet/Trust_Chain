import { Link } from 'react-router-dom'
import { useRef } from 'react'
import { useTilt, useScrollReveal, useCounter, useScrollProgress } from '../hooks/use3d'

import { MatrixText } from '../components/ui/matrix-text'

/* ── Tiltable Glass Card ── */
function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, style } = useTilt(10)
  return (
    <div ref={ref} style={style} className={`glass-card ${className}`}>
      {children}
    </div>
  )
}

/* ── Stat Tile (animated counter) ── */
function StatTile({ value, suffix, label, accent }: { value: number; suffix?: string; label: string; accent?: string }) {
  const [ref, count] = useCounter(value, 1500)
  return (
    <div ref={ref} className="glass-card text-center">
      <div className="text-4xl sm:text-5xl font-mono font-bold tracking-tight mb-2" style={{ color: accent || 'var(--text)' }}>
        {count}{suffix}
      </div>
      <div className="text-sm text-[--text-secondary] font-mono uppercase tracking-widest">{label}</div>
    </div>
  )
}

/* ── Step Rail Item ── */
function StepItem({ num, title, desc, preview, delay }: {
  num: string; title: string; desc: string; preview: string; delay: number
}) {
  const [ref, visible] = useScrollReveal(0.2)
  return (
    <div
      ref={ref}
      className="flex items-start gap-6 py-8 border-b border-[--border-subtle] last:border-0 transition-all duration-700"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible
          ? 'perspective(800px) rotateY(0deg) translateX(0)'
          : 'perspective(800px) rotateY(25deg) translateX(50px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      <div className="relative shrink-0">
        <span className={`flex items-center justify-center w-10 h-10 rounded-full font-mono text-sm font-bold transition-all duration-700 ${
          visible
            ? 'bg-[--accent] text-black shadow-[0_0_20px_var(--accent-glow)]'
            : 'bg-[--surface-2] text-[--text-dim]'
        }`}>
          {num}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-[--text] mb-1">{title}</h3>
        <p className="text-[--text-secondary] text-sm leading-relaxed">{desc}</p>
      </div>
      <div
        className="hidden lg:block shrink-0 font-mono text-xs max-w-[200px] truncate px-3 py-1.5 rounded bg-black/50 border border-[--border-subtle] text-[--accent]"
        style={{
          transform: visible ? 'perspective(800px) rotateY(-6deg)' : 'perspective(800px) rotateY(-20deg)',
          opacity: visible ? 0.9 : 0,
          transition: `all 0.7s ease ${delay + 100}ms`,
        }}
      >
        {preview}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════ */

export default function Landing() {
  const heroRef = useRef<HTMLElement>(null)
  const heroScrollP = useScrollProgress(heroRef)

  const steps = [
    { num: '01', title: 'Upload', desc: 'Drag in any audio or video file — MP4, WAV, AVI, and more.', preview: '> INIT video.mp4' },
    { num: '02', title: 'Hash', desc: 'A SHA-256 cryptographic fingerprint is generated instantly.', preview: 'a3f5c9d1...e7b2' },
    { num: '03', title: 'Multi-Modal Detect', desc: '4 independent AI models scan for deepfakes: spatial, temporal, frequency, and camera noise.', preview: 'CONF: 0.94' },
    { num: '04', title: 'Anchor', desc: 'The file hash is permanently registered on the Ethereum blockchain with SMS beacon backup.', preview: '0xabc1...def' },
    { num: '05', title: 'Provenance', desc: 'A C2PA content manifest is generated with trust tier classification.', preview: 'SYS.TIER_1' },
    { num: '06', title: 'Chain of Custody', desc: 'Every custodian transfer is logged with digital signatures and role verification.', preview: 'SIG.VERIFIED' },
    { num: '07', title: 'Certify', desc: 'A court-ready PDF certificate is generated with all findings and blockchain proof.', preview: 'BSA.COMPLIANT' },
  ]

  return (
    <div>
      {/* ─── Hero ─── */}
      <section ref={heroRef} className="relative pt-32 pb-28 text-center overflow-hidden">
        {/* Background: radial accent glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-[--accent] opacity-[0.05] blur-[120px]" />
        </div>

        {/* Subtle grid overlay for texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.08]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,255,204,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,255,204,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Floating line accents */}
        <div className="absolute top-16 left-[10%] w-px h-32 bg-gradient-to-b from-transparent via-[--accent] to-transparent opacity-30" />
        <div className="absolute top-24 right-[12%] w-px h-24 bg-gradient-to-b from-transparent via-[--accent] to-transparent opacity-20" />
        <div className="absolute bottom-20 left-[25%] w-20 h-px bg-gradient-to-r from-transparent via-[--accent] to-transparent opacity-20" />

        {/* Hero content */}
        <div
          className="relative z-10 transition-transform duration-100"
          style={{
            transform: `scale(${1 - heroScrollP * 0.06}) translateY(${heroScrollP * -15}px)`,
            opacity: 1 - heroScrollP * 0.5,
          }}
        >
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--accent-dim)] border border-[var(--accent-glow)] mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-[--accent] animate-pulse" />
            <span className="text-[--accent] text-xs font-mono font-medium tracking-widest uppercase">SYS.INTEGRITY.ON</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tighter leading-[1.1] mb-8 text-[--text] uppercase hover:[&>div]:drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] transition-all">
            <div className="text-[--accent]">
              <MatrixText text="VERIFY ONCE." initialDelay={200} letterAnimationDuration={500} letterInterval={100} />
            </div>
            <div className="text-[--text] mt-2">
              <MatrixText text="TRUST FOREVER." initialDelay={1500} letterAnimationDuration={500} letterInterval={100} />
            </div>
          </h1>

          <p className="text-lg text-[--text-secondary] max-w-lg mx-auto mb-12 leading-relaxed font-normal">
            AI-powered deepfake detection with blockchain-anchored proof
            and court-ready forensic certificates.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/upload" className="btn-glow">
              Start Analysis
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <Link to="/dashboard" className="btn-ghost">
              View Dashboard
            </Link>
          </div>
        </div>

        {/* Bottom fade line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[--border-strong] to-transparent" />
      </section>

      {/* ─── Stats ─── */}
      <section className="py-20 perspective-container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <StatTile value={70} suffix="K Cr" label="Annual deepfake fraud (India)" accent="var(--danger)" />
          <StatTile value={4} label="AI models per analysis" accent="var(--accent)" />
          <StatTile value={3} label="Trust tiers (C2PA)" accent="var(--success)" />
          <StatTile value={63} suffix="" label="BSA compliance" accent="var(--gold)" />
        </div>
      </section>

      <div className="max-w-4xl mx-auto h-px bg-gradient-to-r from-transparent via-[--border-strong] to-transparent" />

      {/* ─── How It Works ─── */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto">
          <p className="text-[--accent] text-xs font-semibold tracking-widest uppercase text-center mb-3">Process</p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-center text-[--text] mb-3">
            Seven layers of trust.
          </h2>
          <p className="text-center text-[--text-secondary] mb-14 text-base">
            From upload to court-ready certificate — complete evidence integrity.
          </p>
          <div className="space-y-0">
            {steps.map((step, i) => (
              <StepItem key={i} {...step} delay={i * 80} />
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto h-px bg-gradient-to-r from-transparent via-[--border-strong] to-transparent" />

      {/* ─── Why It Matters ─── */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto">
          <p className="text-[--accent] text-xs font-semibold tracking-widest uppercase text-center mb-3">Why TrustChain</p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-center text-[--text] mb-3">
            Detection meets admissibility.
          </h2>
          <p className="text-center text-[--text-secondary] mb-16 text-base max-w-lg mx-auto">
            Most tools detect deepfakes or preserve evidence. TrustChain does both.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                title: 'Deepfake threat',
                desc: 'AI-generated media that swaps faces, clones voices, or fabricates entire videos — advancing faster than human detection. ₹70,000 Cr annual fraud in India alone.',
                accent: 'var(--danger)',
              },
              {
                title: 'The courtroom gap',
                desc: 'Under BSA §63, electronic evidence is inadmissible without a certificate proving authenticity. Most detection tools produce nothing a court can accept.',
                accent: 'var(--gold)',
              },
              {
                title: 'Multi-modal ensemble',
                desc: '4 independent detection models — spatial, temporal, frequency domain, and camera noise analysis. Ensemble voting ensures high accuracy and explainability.',
                accent: 'var(--accent)',
              },
              {
                title: 'Content provenance',
                desc: 'C2PA-compatible manifests trace evidence from capture to court. Three trust tiers provide credibility labeling that increases court confidence.',
                accent: 'var(--success)',
              },
            ].map((card, i) => (
              <TiltCard key={i}>
                <div className="w-8 h-0.5 rounded-full mb-5" style={{ background: card.accent }} />
                <h3 className="text-base font-semibold text-[--text] mb-2">{card.title}</h3>
                <p className="text-sm text-[--text-secondary] leading-relaxed">{card.desc}</p>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto h-px bg-gradient-to-r from-transparent via-[--border-strong] to-transparent" />

      {/* ─── Legal ─── */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto">
          <p className="text-[--gold] text-xs font-semibold tracking-widest uppercase text-center mb-3">Compliance</p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-center text-[--text] mb-14">
            Built for admissibility.
          </h2>
          <LegalArcCards />
        </div>
      </section>

      <div className="max-w-4xl mx-auto h-px bg-gradient-to-r from-transparent via-[--border-strong] to-transparent" />

      {/* ─── CTA ─── */}
      <section className="relative py-28 text-center overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[400px] h-[250px] rounded-full bg-[--accent] opacity-[0.05] blur-[100px]" />
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[--text] mb-4">
            Ready to verify?
          </h2>
          <p className="text-[--text-secondary] mb-10 text-base max-w-sm mx-auto">
            Upload a file. Get forensic proof in seconds.
          </p>
          <Link to="/upload" className="btn-glow text-base px-10 py-4">
            Start Analysis
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-[--border-subtle] py-8 text-center">
        <p className="text-xs text-[--text-dim]">
          TrustChain · Evidence Integrity & Authentication · MIT License
        </p>
      </footer>
    </div>
  )
}


/* ── Legal 3D Arc Cards ── */
function LegalArcCards() {
  const [ref, visible] = useScrollReveal(0.2)
  const cards = [
    { code: '§63', title: 'Bharatiya Sakshya Adhiniyam', desc: 'Recognises electronic records as primary evidence when authenticity is provable via immutable audit trail.' },
    { code: '§66D', title: 'IT Act, 2000', desc: 'Criminalises cheating by personation using computer resources. Liability scorer maps directly to this offence.' },
    { code: 'DPDPA', title: 'Data Protection Act', desc: 'Evidence processed under law enforcement exemption. Retention and erasure handled per case lifecycle.' },
  ]

  return (
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {cards.map((card, i) => {
        const isCenter = i === 1
        const isLeft = i === 0
        const rotation = isCenter ? 0 : isLeft ? -12 : 12
        const tz = isCenter ? 0 : -40
        const scaleVal = isCenter ? 1 : 0.96

        return (
          <div
            key={i}
            className="text-center glass-card-static transition-all duration-700"
            style={{
              borderLeft: '2px solid var(--gold)',
              transform: visible
                ? 'perspective(800px) rotateY(0deg) translateZ(0) scale(1)'
                : `perspective(800px) rotateY(${rotation}deg) translateZ(${tz}px) scale(${scaleVal})`,
              opacity: visible ? 1 : 0.5,
              transitionDelay: `${i * 120}ms`,
            }}
          >
            <div className="text-3xl font-semibold tracking-tight text-[--gold] mb-3">{card.code}</div>
            <div className="text-sm font-semibold text-[--text] mb-3">{card.title}</div>
            <p className="text-sm text-[--text-secondary] leading-relaxed">{card.desc}</p>
          </div>
        )
      })}
    </div>
  )
}
