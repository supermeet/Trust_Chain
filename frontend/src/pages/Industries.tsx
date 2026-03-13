import { useTilt, useScrollReveal } from '../hooks/use3d'

function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, style } = useTilt(8)
  return (
    <div ref={ref} style={style} className={`glass-card ${className}`}>
      {children}
    </div>
  )
}

export default function Industries() {
    const components = [
        {
            name: 'AI Detection Engine',
            desc: 'Wav2Vec2 audio analysis + EfficientNet video scanning to identify synthetic manipulation.',
            accent: 'var(--danger)',
            industries: [
                { sector: 'Social Media', title: 'Content Moderation at Scale', text: 'Platforms like Instagram, YouTube, and X can integrate the detection API to automatically flag deepfake uploads before they go viral. Reduces manual review load by pre-screening content.' },
                { sector: 'Journalism', title: 'Source Verification', text: 'Newsrooms can verify whether leaked audio, whistleblower video, or citizen journalism footage is authentic before publishing — preventing reputational damage from running fabricated stories.' },
                { sector: 'Banking & Finance', title: 'KYC Fraud Prevention', text: 'Banks can scan video-call KYC recordings and voice samples for deepfake manipulation, stopping identity theft and synthetic identity fraud at the onboarding stage.' },
                { sector: 'Education', title: 'Academic Integrity', text: 'Universities can verify that submitted video presentations, viva recordings, and oral exams are genuine — preventing AI-generated impersonation in remote assessments.' },
            ],
        },
        {
            name: 'Blockchain Anchoring',
            desc: 'Immutable SHA-256 hash registration on Ethereum with timestamped proof of existence.',
            accent: 'var(--accent)',
            industries: [
                { sector: 'Legal & Law Enforcement', title: 'Evidence Chain of Custody', text: 'Police and prosecutors can anchor CCTV footage, body-cam recordings, and forensic evidence on-chain — creating a tamper-proof audit trail that holds up under cross-examination.' },
                { sector: 'Intellectual Property', title: 'Copyright Proof of Creation', text: 'Artists, musicians, and content creators can timestamp their original work on the blockchain before publishing — establishing prior art and ownership in copyright disputes.' },
                { sector: 'Healthcare', title: 'Medical Record Integrity', text: 'Hospitals can anchor diagnostic images, surgical videos, and patient consent recordings — ensuring records haven\'t been altered for insurance fraud or malpractice claims.' },
                { sector: 'Supply Chain', title: 'Product Provenance', text: 'Manufacturers can register inspection videos, quality certifications, and shipping documentation on-chain — creating verifiable proof at every stage from factory to delivery.' },
            ],
        },
        {
            name: 'Liability Scoring',
            desc: 'Multi-party responsibility distribution across User, Platform, and AI Architect.',
            accent: 'var(--warn)',
            industries: [
                { sector: 'Insurance', title: 'Claims Risk Assessment', text: 'Insurers can use liability scoring to assess deepfake-related claims — determining whether fraud liability falls on the policyholder, the platform, or the AI tool provider.' },
                { sector: 'Regulatory Compliance', title: 'Automated Compliance Reporting', text: 'Companies subject to the EU AI Act or India\'s DPDP Act can generate liability reports showing due diligence in AI content assessment.' },
                { sector: 'Platform Governance', title: 'Takedown Response Metrics', text: 'Social platforms can use response-time scoring to benchmark moderation speed — demonstrating compliance with safe harbour provisions.' },
                { sector: 'Legal Tech', title: 'Pre-Trial Evidence Scoring', text: 'Law firms can present liability distribution reports in court — quantifying responsibility across parties with factor-level breakdowns.' },
            ],
        },
        {
            name: 'PDF Certification',
            desc: 'Court-ready PDF/A-4 certificates with detection results, blockchain proof, and legal compliance.',
            accent: 'var(--gold)',
            industries: [
                { sector: 'Government', title: 'Public Records Certification', text: 'Government agencies can issue tamper-proof certificates for digitised public records — birth certificates, land records, and court filings.' },
                { sector: 'Corporate Audit', title: 'Forensic Audit Reports', text: 'Auditors can generate certified reports for whistleblower recordings, internal investigation evidence, and compliance documentation.' },
                { sector: 'Media & Entertainment', title: 'Content Authentication', text: 'Studios and distributors can certify that promotional materials, interview footage, and press releases are authentic originals.' },
                { sector: 'Real Estate', title: 'Property Documentation', text: 'Real estate firms can certify property inspection videos, virtual tour recordings, and agreement signings.' },
            ],
        },
    ]

    return (
        <div>
            {/* Hero */}
            <section className="pt-20 pb-16 text-center animate-enter relative hero-vignette">
                <p className="text-[--accent] text-sm font-semibold tracking-widest uppercase mb-4">
                    Beyond Deepfake Detection
                </p>
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-[-0.04em] leading-[1.05] mb-6 text-[--text]">
                    One pipeline.
                    <br />
                    <span className="bg-gradient-to-r from-[--accent] to-[--success] bg-clip-text text-transparent">
                        Every industry.
                    </span>
                </h1>
                <p className="text-lg text-[--text-secondary] max-w-2xl mx-auto leading-relaxed">
                    Each component of TrustChain — multi-modal detection, blockchain, C2PA provenance,
                    liability scoring, and certification — solves real problems across sectors.
                </p>
            </section>

            <hr className="max-w-4xl mx-auto" />

            {/* Components */}
            {components.map((component, ci) => (
                <ComponentSection key={ci} component={component} index={ci} isLast={ci === components.length - 1} />
            ))}

            <hr className="max-w-4xl mx-auto" />

            {/* Summary grid */}
            <section className="py-24">
                <div className="max-w-5xl mx-auto text-center">
                    <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[--text] mb-4">
                        16 use cases. 4 components.
                    </h2>
                    <p className="text-lg text-[--text-secondary] max-w-xl mx-auto mb-16">
                        Every module is an independent API that can be integrated
                        into existing systems — no full-stack deployment required.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                        {[
                            { num: '4', label: 'Core modules' },
                            { num: '16', label: 'Industry applications' },
                            { num: '12', label: 'Sectors covered' },
                            { num: '1', label: 'Unified API' },
                        ].map((stat, i) => (
                            <div key={i} className="glass-card text-center !p-6">
                                <div className="text-4xl font-semibold tracking-tight text-[--text] mb-1">{stat.num}</div>
                                <div className="text-sm text-[--text-secondary]">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <footer className="border-t border-[--border-subtle] py-8 text-center">
                <p className="text-xs text-[--text-dim]">
                    TrustChain · Evidence Integrity & Authentication · MIT License
                </p>
            </footer>
        </div>
    )
}

/* ── Component Section ── */
function ComponentSection({ component, index, isLast }: { component: any; index: number; isLast: boolean }) {
    const [ref, visible] = useScrollReveal(0.1)

    return (
        <div ref={ref}>
            <section className="py-24">
                <div className="max-w-5xl mx-auto">
                    <div className="mb-16"
                         style={{
                           opacity: visible ? 1 : 0,
                           transform: visible ? 'translateY(0)' : 'translateY(30px)',
                           transition: 'all 0.7s ease',
                         }}
                    >
                        <span className="badge badge-accent text-xs mb-4 inline-block">
                            Component {index + 1}
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[--text] mb-3">
                            {component.name}
                        </h2>
                        <p className="text-lg text-[--text-secondary] max-w-2xl">
                            {component.desc}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {component.industries.map((ind: any, ii: number) => (
                            <TiltCard key={ii}>
                                <div className="w-8 h-1 rounded-full mb-4" style={{ background: component.accent }} />
                                <div className="text-xs font-semibold text-[--text-dim] tracking-wide uppercase mb-3">
                                    {ind.sector}
                                </div>
                                <h3 className="text-lg font-semibold text-[--text] mb-2">
                                    {ind.title}
                                </h3>
                                <p className="text-sm text-[--text-secondary] leading-relaxed">
                                    {ind.text}
                                </p>
                            </TiltCard>
                        ))}
                    </div>
                </div>
            </section>

            {!isLast && <hr className="max-w-4xl mx-auto" />}
        </div>
    )
}
