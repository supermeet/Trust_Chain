import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Upload from './pages/Upload'
import Results from './pages/Results'
import Verify from './pages/Verify'

function Navbar() {
  const location = useLocation()

  const linkClass = (path: string) =>
    `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
      location.pathname === path
        ? 'bg-indigo-600 text-white'
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🔗</span>
            <span className="text-xl font-bold text-white tracking-tight">
              Trust<span className="text-indigo-400">Chain</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/" className={linkClass('/')}>
              Upload
            </Link>
            <Link to="/verify" className={linkClass('/verify')}>
              Verify
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

function App() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Upload />} />
          <Route path="/results/:id" element={<Results />} />
          <Route path="/verify" element={<Verify />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
