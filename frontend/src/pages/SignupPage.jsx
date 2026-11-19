import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, Lock, Mail, User, ArrowRight, AlertCircle, CheckCircle2, XCircle } from 'lucide-react'
import api from '../services/api'
import {
  validateEmail,
  validatePassword,
  getPasswordChecks,
  hashPasswordClient,
} from '../utils/authValidation'

export default function SignupPage({ onSignup }) {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // Real-time password requirement checks
  const pwChecks = getPasswordChecks(password)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Rule 1: Strict .com email regex validation (rejects @kjgegdv, @dg, non-.com)
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      setError(emailValidation.error)
      setIsLoading(false)
      return
    }

    // Rule 2: Password strength validation (min 6 chars, >=1 cap, >=1 small, >=1 number, >=1 special)
    const pwValidation = validatePassword(password)
    if (!pwValidation.valid) {
      setError(pwValidation.error)
      setIsLoading(false)
      return
    }

    try {
      // Rule 3: Client-side salted hash (Plaintext password NEVER travels over the network)
      // Salted with email so no two identical passwords share the same network hash
      const clientPasswordHash = await hashPasswordClient(password, email)

      if (onSignup) {
        await onSignup({ name: name.trim(), email: email.trim(), password: clientPasswordHash })
      } else {
        await api.post('/auth/signup', { name: name.trim(), email: email.trim(), password: clientPasswordHash })
      }
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.')
    } finally {
      setIsLoading(false)
    }
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
            Create Your Account
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Start generating persona-specific, brand-safe marketing campaigns
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
              htmlFor="name-input"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
            >
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="name-input"
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (error) setError(null)
                }}
                placeholder="Sarah Connor"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 text-sm font-medium text-slate-900 outline-none"
              />
            </div>
          </div>

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
                placeholder="Min 6 characters with Aa1!"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 text-sm font-medium text-slate-900 outline-none"
              />
            </div>

            {/* Real-time Password Strength Criteria */}
            <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-[11px]">
              <span className="font-bold text-slate-700 block text-[10px] uppercase tracking-wider">
                Password Requirements:
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-slate-600">
                <div className={`flex items-center gap-1.5 ${pwChecks.length ? 'text-emerald-700 font-bold' : ''}`}>
                  {pwChecks.length ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mx-1" />}
                  <span>Min 6 characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${pwChecks.uppercase ? 'text-emerald-700 font-bold' : ''}`}>
                  {pwChecks.uppercase ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mx-1" />}
                  <span>1 Capital letter (A-Z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${pwChecks.lowercase ? 'text-emerald-700 font-bold' : ''}`}>
                  {pwChecks.lowercase ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mx-1" />}
                  <span>1 Small letter (a-z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${pwChecks.number ? 'text-emerald-700 font-bold' : ''}`}>
                  {pwChecks.number ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mx-1" />}
                  <span>1 Number (0-9)</span>
                </div>
                <div className={`col-span-2 flex items-center gap-1.5 ${pwChecks.special ? 'text-emerald-700 font-bold' : ''}`}>
                  {pwChecks.special ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mx-1" />}
                  <span>1 Special symbol (!@#$%^&amp;*...)</span>
                </div>
              </div>
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
            <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-700 font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
