/**
 * Progressive Wizard Step & Draft Session Manager
 * Controls step unlocking in the sidebar and clean resets on Save Draft / New Campaign.
 */

const STEP_STORAGE_KEY = 'cg_max_step'

const SESSION_KEYS_TO_CLEAR = [
  'cg_draft_id',
  'cg_brand_kit',
  'cg_personas',
  'cg_persona_dna',
  'cg_concepts',
  'cg_selected_concept',
  'cg_persona_assets',
  'cg_active_campaign_id',
  'cg_generated_ad',
]

export function getMaxUnlockedStep() {
  try {
    const raw = sessionStorage.getItem(STEP_STORAGE_KEY)
    const parsed = parseInt(raw || '1', 10)
    return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1
  } catch {
    return 1
  }
}

export function unlockStep(stepNumber) {
  const next = Math.max(getMaxUnlockedStep(), Number(stepNumber) || 1)
  try {
    sessionStorage.setItem(STEP_STORAGE_KEY, String(next))
  } catch {}
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cg_step_unlocked', { detail: { maxStep: next } }))
  }
  return next
}

export function setUnlockedStep(stepNumber) {
  const next = Math.max(1, Number(stepNumber) || 1)
  try {
    sessionStorage.setItem(STEP_STORAGE_KEY, String(next))
  } catch {}
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cg_step_unlocked', { detail: { maxStep: next } }))
  }
  return next
}

export function resetWizardSession() {
  try {
    SESSION_KEYS_TO_CLEAR.forEach((k) => sessionStorage.removeItem(k))
    sessionStorage.setItem(STEP_STORAGE_KEY, '1')
  } catch {}
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cg_step_unlocked', { detail: { maxStep: 1 } }))
  }
}

export function getDraftResumePath(camp) {
  if (!camp?.id) return '/generator'
  const step = Number(camp.current_step || camp.bundle?.current_step || 1)
  if (step === 1) return `/generator?draft_id=${camp.id}`
  if (step === 2) return `/strategy-concept?draft_id=${camp.id}&step=dna`
  if (step === 3) return `/strategy-concept?draft_id=${camp.id}&step=concepts`
  if (step === 4) return `/results?id=${camp.id}&tab=assets`
  if (step >= 5) return `/results?id=${camp.id}&tab=guardian`
  return `/generator?draft_id=${camp.id}`
}

export function getStepLabel(step) {
  const s = Number(step || 1)
  const map = {
    1: 'Brand & Personas',
    2: 'Persona Strategy',
    3: 'Campaign Concepts',
    4: 'Campaign Assets',
    5: 'Brand Guardian',
    6: 'Export Campaign',
  }
  return map[s] || 'Brand & Personas'
}
