import { Link } from 'react-router-dom'

export default function Landing() {
    return (
        <div>
            <hr className="border-[--border-light]" />

            {/* ─── Hero ─── */}
            <section className="pt-20 pb-16 text-center animate-enter">
                <p className="text-[--text-dim] text-sm font-medium tracking-wide mb-4">
                    Evidence Integrity & Authentication Platform
                </p>
                <h1 className="text-5xl sm:text-6xl md:text-[80px] font-semibold tracking-tight leading-[1.05] mb-6 text-[--text]">
                    Evidence integrity
                    <br />
                    you can prove.
                </h1>
                <p className="text-xl text-[--text-secondary] max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
                    Multi-modal AI detection, blockchain-anchored proof, C2PA provenance,
                    chain of custody tracking, and court-ready certification — in one platform.
                </p>
                <div className="flex items-center justify-center gap-4 flex-wrap">
                    <Link
                        to="/upload"
                        className="px-7 py-3 bg-[--text] hover:bg-[#333336] text-white font-medium rounded-full transition-colors text-sm"
                    >
                        Analyze evidence
                    </Link>
                    <Link
                        to="/dashboard"
                        className="px-7 py-3 text-[--link] hover:text-[--link-hover] font-medium text-sm transition-colors"
                    >
                        View dashboard →
                    </Link>
                </div>
            </section>

            {/* ─── Divider ─── */}
            <hr className="border-[--border-light] max-w-4xl mx-auto" />

            {/* ─── Stats ─── */}
            <section className="py-20 text-center animate-enter animate-enter-d1">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-12 max-w-4xl mx-auto">
                    <div>
                        <div className="text-4xl sm:text-5xl font-semibold tracking-tight text-[--text] mb-2">₹70K Cr</div>
                        <div className="text-sm text-[--text-secondary]">Annual deepfake fraud in India</div>
                    </div>
                    <div>
                        <div className="text-4xl sm:text-5xl font-semibold tracking-tight text-[--text] mb-2">4</div>
                        <div className="text-sm text-[--text-secondary]">AI models per analysis</div>
                    </div>
                    <div>
                        <div className="text-4xl sm:text-5xl font-semibold tracking-tight text-[--text] mb-2">3</div>
                        <div className="text-sm text-[--text-secondary]">Trust tiers (C2PA)</div>
                    </div>
                    <div>
                        <div className="text-4xl sm:text-5xl font-semibold tracking-tight text-[--text] mb-2">§63</div>
                        <div className="text-sm text-[--text-secondary]">BSA compliance</div>
                    </div>
                </div>
            </section>

            <hr className="border-[--border-light] max-w-4xl mx-auto" />

            {/* ─── How it works ─── */}
            <section className="py-20 bg-[--bg-secondary] rounded-3xl mx-[-16px] sm:mx-[-24px] px-4 sm:px-6 animate-enter animate-enter-d2">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-center text-[--text] mb-4">
                        How it works.
                    </h2>
                    <p className="text-center text-[--text-secondary] mb-16 text-lg">
                        Seven layers. One pipeline. Complete evidence integrity.
                    </p>

                    <div className="space-y-0">
                        {[
                            { num: '1', title: 'Upload', desc: 'Drag in any audio or video file — MP4, WAV, AVI, and more.' },
                            { num: '2', title: 'Hash', desc: 'A SHA-256 cryptographic fingerprint is generated instantly.' },
                            { num: '3', title: 'Multi-Modal Detect', desc: '4 independent AI models scan for deepfakes: spatial, temporal, frequency, and camera noise analysis.' },
                            { num: '4', title: 'Anchor', desc: 'The file hash is permanently registered on the Ethereum blockchain with SMS beacon backup.' },
                            { num: '5', title: 'Provenance', desc: 'A C2PA content manifest is generated to track origin and manipulation.' },
                            { num: '6', title: 'Chain of Custody', desc: 'Every custodian transfer is logged with digital signatures and role verification.' },
                            { num: '7', title: 'Certify', desc: 'A court-ready PDF certificate is generated with all findings, blockchain proof, and legal compliance.' },
                        ].map((step, i) => (
                            <div key={i} className="flex items-start gap-6 py-7 border-b border-[--border-light] last:border-0">
                                <span className="text-3xl font-semibold text-[--text-dim] w-8 shrink-0">{step.num}</span>
                                <div>
                                    <h3 className="text-lg font-semibold text-[--text] mb-1">{step.title}</h3>
                                    <p className="text-[--text-secondary] text-base">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <hr className="border-[--border-light] max-w-4xl mx-auto" />

            {/* ─── Why it matters ─── */}
            <section className="py-24 animate-enter animate-enter-d3">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-center text-[--text] mb-4">
                        Why it matters.
                    </h2>
                    <p className="text-center text-[--text-secondary] mb-16 text-lg max-w-xl mx-auto">
                        Deepfakes are a growing threat. TrustChain bridges the gap between detection and legal admissibility.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        <div>
                            <h3 className="text-xl font-semibold text-[--text] mb-3">What is a deepfake?</h3>
                            <p className="text-[--text-secondary] leading-relaxed">
                                AI-generated media that swaps faces, clones voices, or fabricates entire videos.
                                The technology is advancing faster than our ability to detect it with the naked eye.
                                In India alone, deepfake-related fraud costs an estimated ₹70,000 crores annually.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-[--text] mb-3">The courtroom gap</h3>
                            <p className="text-[--text-secondary] leading-relaxed">
                                Under BSA §63 (formerly §65B), electronic evidence is inadmissible
                                without a certificate proving authenticity. Most detection tools don't produce
                                anything a court can accept. TrustChain produces both.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-[--text] mb-3">Multi-modal AI</h3>
                            <p className="text-[--text-secondary] leading-relaxed">
                                Instead of relying on a single model, TrustChain uses 4 independent detection
                                models — spatial, temporal, frequency domain, and camera noise analysis.
                                Ensemble voting ensures higher accuracy and explainability.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-[--text] mb-3">Content provenance</h3>
                            <p className="text-[--text-secondary] leading-relaxed">
                                C2PA-compatible manifests trace every piece of evidence from capture to court.
                                Three trust tiers (Hardware, Software, Citizen) provide honest credibility
                                labeling that increases court confidence.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <hr className="border-[--border-light] max-w-4xl mx-auto" />

            {/* ─── Legal ─── */}
            <section className="py-24 animate-enter animate-enter-d4">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-center text-[--text] mb-16">
                        Built for admissibility.
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { code: '§63', title: 'Bharatiya Sakshya Adhiniyam', desc: 'Recognises electronic records as primary evidence when authenticity is provable via immutable audit trail and digital certificates.' },
                            { code: '§66D', title: 'IT Act, 2000', desc: 'Criminalises cheating by personation using computer resources. The liability scorer maps directly to this offence.' },
                            { code: 'DPDPA', title: 'Data Protection Act', desc: 'Evidence processed under law enforcement exemption (§17(2)(a)). Retention and erasure handled per case lifecycle compliance.' },
                        ].map((ref, i) => (
                            <div key={i} className="text-center bg-[--bg-secondary] rounded-2xl px-6 py-8">
                                <div className="text-4xl font-semibold tracking-tight text-[--text] mb-3">{ref.code}</div>
                                <div className="text-sm font-semibold text-[--text] mb-2">{ref.title}</div>
                                <p className="text-sm text-[--text-secondary] leading-relaxed">{ref.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <hr className="border-[--border-light] max-w-4xl mx-auto" />

            {/* ─── CTA ─── */}
            <section className="py-24 text-center animate-enter animate-enter-d5">
                <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[--text] mb-4">
                    Ready to get started?
                </h2>
                <p className="text-[--text-secondary] mb-10 text-lg max-w-md mx-auto">
                    Upload a file and get your forensic report in seconds.
                </p>
                <Link
                    to="/upload"
                    className="inline-block px-8 py-3.5 bg-[--text] hover:bg-[#333336] text-white font-medium rounded-full transition-colors text-sm"
                >
                    Start analysis
                </Link>
            </section>

            {/* ─── Footer ─── */}
            <footer className="border-t border-[--border-light] py-6 text-center">
                <p className="text-xs text-[--text-dim]">
                    TrustChain · Evidence Integrity & Authentication · MIT License
                </p>
            </footer>
        </div>
    )
}
