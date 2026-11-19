import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, Sparkles, LogOut, LayoutDashboard, PlusCircle, User } from 'lucide-react'

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate()

  const handleLogoutClick = async () => {
    if (onLogout) {
      await onLogout()
    }
    navigate('/', { replace: true })
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-purple-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-200 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 fill-purple-200/30" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1">
                CampaignGuard <span className="text-purple-600 font-extrabold">AI</span>
              </span>
              <span className="text-[10px] font-medium text-slate-400 tracking-wider uppercase -mt-1">
                Guardrail Marketing
              </span>
            </div>
          </Link>

          {/* Navigation Items */}
          <nav className="flex items-center gap-3 sm:gap-6">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-purple-600 transition-colors px-2 py-1"
                >
                  <LayoutDashboard className="w-4 h-4 text-purple-500" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/generator"
                  className="flex items-center gap-1.5 text-sm font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors px-3 py-1.5 rounded-lg border border-purple-200"
                >
                  <PlusCircle className="w-4 h-4 text-purple-600" />
                  <span>New Campaign</span>
                </Link>

                <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />

                <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs border border-purple-200">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="hidden md:inline">{user.name || user.email}</span>
                </div>

                <button
                  onClick={handleLogoutClick}
                  className="flex items-center gap-1 text-sm font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors border border-rose-200 cursor-pointer"
                  aria-label="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Log Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-700 hover:text-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-semibold text-white bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 px-4 py-2 rounded-xl shadow-sm shadow-purple-200 transition-all hover:shadow-md"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
