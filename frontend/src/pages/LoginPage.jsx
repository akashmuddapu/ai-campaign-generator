import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react'
import api from '../services/api'
import { validateEmail, hashPasswordClient } from '../utils/authValidation'

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Rule 1: Strict .com email regex validation
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      setError(emailValidation.error)
      setIsLoading(false)
      return
    }

    if (!password) {
      setError('Password is required.')
      setIsLoading(false)
      return
    }

    try {
      // Rule 3: Client-side salted hashing (Plaintext password NEVER travels over the network)
      const clientPasswordHash = await hashPasswordClient(password, email)

      if (onLogin) {
        await onLogin({ email: email.trim(), password: clientPasswordHash })
      } else {
        await api.post('/auth/login', { email: email.trim(), password: clientPasswordHash })
      }
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Invalid email or password.')
    } finally {
      setIsLoading(false)
    }
  }

  const fillDemoCredentials = () => {
    setEmail('demo@campaignguard.com')
    setPassword('DemoPass123!')
    setError(null)
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-8 shadow-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-md shadow-purple-200 mb-3">
            <Shield className="w-6 h-6 fill-purple-200/30" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Sign In to CampaignGuard AI
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Access your saved brand kits, personas, and campaign reports
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email-input"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
            >
              Email Address <span className="text-[10px] text-purple-600 normal-case">(.com required)</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="email-input"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (error) setError(null)
                }}
                placeholder="name@company.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 text-sm font-medium text-slate-900 outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password-input"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="password-input"
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (error) setError(null)
                }}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 text-sm font-medium text-slate-900 outline-none"
              />
            </div>
          </div>

          {/* Security badge: client-side salted hashing */}
          <div className="p-2.5 bg-purple-50/70 border border-purple-100 rounded-xl flex items-center gap-2 text-[11px] text-purple-900 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span>Client-side salted hash encryption active. Passwords never travel plain on the network.</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white font-bold text-sm py-3 rounded-xl shadow-md shadow-purple-200 transition-all cursor-pointer disabled:opacity-50"
          >
            <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Click Demo Fill */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={fillDemoCredentials}
            className="inline-flex items-center gap-1.5 text-purple-700 font-bold hover:underline cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Use Demo Account (.com)</span>
          </button>
          <span className="text-slate-400">Server session persistence</span>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/signup" className="text-purple-700 font-bold hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  )
}
