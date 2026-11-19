import { useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import api from './services/api'

import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import BrandPersonaSetupPage from './pages/BrandPersonaSetupPage'
import StrategyConceptPage from './pages/StrategyConceptPage'
import CampaignResultsPage from './pages/CampaignResultsPage'
import CampaignReportCardPage from './pages/CampaignReportCardPage'
import CampaignHistoryReportPage from './pages/CampaignHistoryReportPage'

// ─── Auth Context ───────────────────────────────────────────────────────────
export const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

// ─── Protected Route Guard ────────────────────────────────────────────────
function ProtectedRoute({ user, isLoading, children }) {
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F6F7FB] flex items-center justify-center">
        <div className="text-slate-500 text-xs font-bold animate-pulse">Loading workspace…</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

// ─── Public Route Guard ───────────────────────────────────────────────────
function PublicRoute({ user, isLoading, children }) {
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F6F7FB] flex items-center justify-center">
        <div className="text-slate-500 text-xs font-bold animate-pulse">Loading…</div>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

// ─── App Shell ────────────────────────────────────────────────────────────
function AppShell() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('cg_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [isLoading, setIsLoading] = useState(true)
  const location = useLocation()

  // Session check on mount
  useEffect(() => {
    api.get('/auth/me')
      .then((res) => {
        if (res.data?.authenticated && res.data?.user) {
          setUser(res.data.user)
          try {
            if (res.data.user.id) {
              localStorage.setItem('cg_user_id', res.data.user.id)
              localStorage.setItem('cg_user', JSON.stringify(res.data.user))
            }
          } catch {}
        } else {
          const storedUser = localStorage.getItem('cg_user')
          if (!storedUser) {
            setUser(null)
            try {
              localStorage.removeItem('cg_user_id')
              localStorage.removeItem('cg_user')
            } catch {}
          }
        }
      })
      .catch(() => {
        // Keep optimistic local user on network blip
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const handleLogin = async (credentials) => {
    const res = await api.post('/auth/login', credentials)
    const userData = res.data?.user || res.data
    setUser(userData)
    try {
      if (userData?.id) {
        localStorage.setItem('cg_user_id', userData.id)
        localStorage.setItem('cg_user', JSON.stringify(userData))
      }
    } catch {}
    return userData
  }

  const handleSignup = async (credentials) => {
    const res = await api.post('/auth/signup', credentials)
    const userData = res.data?.user || res.data
    setUser(userData)
    try {
      if (userData?.id) {
        localStorage.setItem('cg_user_id', userData.id)
        localStorage.setItem('cg_user', JSON.stringify(userData))
      }
    } catch {}
    return userData
  }

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      setUser(null)
      try {
        localStorage.removeItem('cg_user_id')
        localStorage.removeItem('cg_user')
        sessionStorage.clear()
      } catch {}
    }
  }

  const authValue = { user, setUser, isLoading, handleLogout }

  // Check if current route is an auth form page (login/signup) where standard top Navbar is desirable
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup'

  return (
    <AuthContext.Provider value={authValue}>
      <div className="min-h-screen bg-[#F6F7FB] flex flex-col font-sans">
        {isAuthPage && <Navbar user={user} onLogout={handleLogout} />}

        <main className="flex-1">
          <Routes>
            {/* Public Landing Page matching Image 2 */}
            <Route path="/" element={<LandingPage />} />

            <Route
              path="/login"
              element={
                <PublicRoute user={user} isLoading={isLoading}>
                  <LoginPage onLogin={handleLogin} />
                </PublicRoute>
              }
            />

            <Route
              path="/signup"
              element={
                <PublicRoute user={user} isLoading={isLoading}>
                  <SignupPage onSignup={handleSignup} />
                </PublicRoute>
              }
            />

            {/* Studio Pages matching Image 1 */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute user={user} isLoading={isLoading}>
                  <DashboardPage user={user} onLogout={handleLogout} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/generator"
              element={
                <ProtectedRoute user={user} isLoading={isLoading}>
                  <BrandPersonaSetupPage user={user} onLogout={handleLogout} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/strategy-concept"
              element={
                <ProtectedRoute user={user} isLoading={isLoading}>
                  <StrategyConceptPage user={user} onLogout={handleLogout} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/results"
              element={
                <ProtectedRoute user={user} isLoading={isLoading}>
                  <CampaignResultsPage user={user} onLogout={handleLogout} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/report-card"
              element={
                <ProtectedRoute user={user} isLoading={isLoading}>
                  <CampaignReportCardPage user={user} onLogout={handleLogout} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/report-card/:id"
              element={
                <ProtectedRoute user={user} isLoading={isLoading}>
                  <CampaignReportCardPage user={user} onLogout={handleLogout} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/history"
              element={
                <ProtectedRoute user={user} isLoading={isLoading}>
                  <CampaignHistoryReportPage user={user} onLogout={handleLogout} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/history/:id"
              element={
                <ProtectedRoute user={user} isLoading={isLoading}>
                  <CampaignHistoryReportPage user={user} onLogout={handleLogout} />
                </ProtectedRoute>
              }
            />

            {/* Wildcard redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </AuthContext.Provider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}
