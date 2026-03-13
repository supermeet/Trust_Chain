import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Landing from './pages/Landing'
import Upload from './pages/Upload'
import Results from './pages/Results'
import Verify from './pages/Verify'
import Industries from './pages/Industries'
import Dashboard from './pages/Dashboard'
import Custody from './pages/Custody'

function DesktopNav() {
  const location = useLocation()
  
  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/industries', label: 'Industries' },
    { path: '/upload', label: 'Upload' },
    { path: '/verify', label: 'Verify' },
  ]

  return (
    <div className="hidden md:flex items-center justify-center fixed top-6 left-1/2 -translate-x-1/2 z-50">
      {/* Glossy Pill Container */}
      <div className="flex items-center gap-2 px-2 py-2 rounded-full bg-[rgba(15,20,25,0.45)] backdrop-blur-[32px] border border-[rgba(16,185,129,0.15)] shadow-[inset_0_1px_4px_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.8)] transition-all">
        {navLinks.map(({ path, label }) => {
          const isActive = location.pathname === path
          return (
            <Link
              key={path}
              to={path}
              className={`relative px-5 py-2 text-sm font-medium rounded-full transition-colors duration-300 z-10 ${
                isActive ? 'text-[--bg]' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {label}
              {isActive && (
                <motion.div 
                  layoutId="active-nav-pill"
                  className="absolute inset-0 rounded-full -z-10 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                  style={{
                    background: 'linear-gradient(180deg, var(--accent) 0%, rgba(16,185,129,0.8) 100%)'
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function MobileNav() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/industries', label: 'Industries' },
    { path: '/upload', label: 'Upload' },
    { path: '/verify', label: 'Verify' },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <nav
      className={`md:hidden sticky top-0 z-50 transition-all duration-300 px-4 py-3 ${
        scrolled || mobileOpen
          ? 'bg-[rgba(8,10,15,0.85)] backdrop-blur-xl border-b border-[--border-subtle]'
          : 'bg-transparent'
      }`}
    >
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[--accent]">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span className="font-semibold text-sm tracking-tight text-white">TrustChain</span>
        </Link>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex flex-col gap-1.5 p-2"
          aria-label="Toggle menu"
        >
          <span className={`w-5 h-0.5 bg-white transition-all ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`w-5 h-0.5 bg-white transition-all ${mobileOpen ? 'opacity-0' : ''}`} />
          <span className={`w-5 h-0.5 bg-white transition-all ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {mobileOpen && (
        <div className="pt-4 pb-2 animate-enter">
          <div className="flex flex-col gap-1">
            {navLinks.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive(path) ? 'text-white bg-white/10' : 'text-zinc-400'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}

function Logo() {
  return (
    <div className="hidden md:flex absolute top-6 left-8 z-50 items-center gap-2.5">
      <div className="relative">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[--accent]">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <div className="absolute inset-0 blur-md bg-[--accent] opacity-30 rounded-full" />
      </div>
      <span className="font-semibold text-base text-[--text] tracking-tight">TrustChain</span>
    </div>
  )
}

function ActionButton() {
  return (
    <div className="hidden md:block absolute top-6 right-8 z-50">
      <Link
        to="/upload"
        className="px-6 py-2.5 text-sm font-semibold rounded-full bg-[--accent] text-white hover:shadow-[0_0_20px_rgba(79,142,255,0.4)] transition-all duration-300 border border-[rgba(255,255,255,0.1)]"
      >
        Analyze Evidence
      </Link>
    </div>
  )
}

function App() {
  return (
    <div className="min-h-screen bg-[--bg]">
      <Logo />
      <DesktopNav />
      <ActionButton />
      <MobileNav />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-0 md:pt-10">
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
