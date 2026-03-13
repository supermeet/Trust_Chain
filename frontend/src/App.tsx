import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Landing from './pages/Landing'
import Upload from './pages/Upload'
import Results from './pages/Results'
import Verify from './pages/Verify'
import Industries from './pages/Industries'
import Dashboard from './pages/Dashboard'
import Custody from './pages/Custody'

function Navbar() {
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isActive = (path: string) => location.pathname === path

  const linkClass = (path: string) =>
    `text-xs font-medium transition-colors ${isActive(path) ? 'text-[--text]' : 'text-[--text-dim] hover:text-[--text]'
    }`

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-white/80 backdrop-blur-xl backdrop-saturate-150 border-b border-[--border-light]'
        : 'bg-transparent'
        }`}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-12">
          <Link to="/" className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span className="text-sm font-semibold text-[--text]">TrustChain</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/" className={linkClass('/')}>Home</Link>
            <Link to="/dashboard" className={linkClass('/dashboard')}>Dashboard</Link>
            <Link to="/industries" className={linkClass('/industries')}>Industries</Link>
            <Link to="/upload" className={linkClass('/upload')}>Upload</Link>
            <Link to="/verify" className={linkClass('/verify')}>Verify</Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/results/:id" element={<Results />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/industries" element={<Industries />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/custody/:id" element={<Custody />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
