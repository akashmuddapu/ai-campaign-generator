import { describe, it, expect } from 'vitest'
import api from '../src/services/api'

describe('API Client (T004)', () => {
  it('should have withCredentials set to true for session cookies', () => {
    expect(api.defaults.withCredentials).toBe(true)
  })

  it('should have a base URL configured for the backend API', () => {
    expect(api.defaults.baseURL).toBeDefined()
    expect(api.defaults.baseURL).toContain('/api')
  })
})
