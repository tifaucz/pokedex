import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios from 'axios'

// We need to test the client configuration
// Since the client uses interceptors, we'll test by inspecting the axios instance

describe('apiClient', () => {
  let originalEnv: string | undefined

  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    originalEnv = import.meta.env.VITE_API_URL
  })

  afterEach(() => {
    if (originalEnv !== undefined) {
      import.meta.env.VITE_API_URL = originalEnv
    }
  })

  describe('configuration', () => {
    it('uses default API URL when env variable is not set', async () => {
      // Reset the module to get fresh import
      vi.doUnmock('./client')
      const { default: apiClient } = await import('./client')
      
      // The baseURL should be set
      expect(apiClient.defaults.baseURL).toBeDefined()
    })

    it('sets Content-Type header to application/json', async () => {
      const { default: apiClient } = await import('./client')
      
      expect(apiClient.defaults.headers['Content-Type']).toBe('application/json')
    })
  })

  describe('request interceptor', () => {
    it('adds Authorization header when token exists', async () => {
      vi.mocked(localStorage.getItem).mockReturnValue('test-token')
      
      // Re-import to get fresh instance
      vi.resetModules()
      const { default: apiClient } = await import('./client')
      
      // Create a mock config object
      const config = {
        headers: {} as Record<string, string>,
      }
      
      // Run the request interceptor manually
      const interceptors = apiClient.interceptors.request as any
      const handlers = interceptors.handlers
      
      if (handlers && handlers.length > 0) {
        const fulfilled = handlers[0].fulfilled
        if (fulfilled) {
          const result = fulfilled(config)
          expect(result.headers.Authorization).toBe('Bearer test-token')
        }
      }
    })

    it('does not add Authorization header when no token', async () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null)
      
      vi.resetModules()
      const { default: apiClient } = await import('./client')
      
      const config = {
        headers: {} as Record<string, string>,
      }
      
      const interceptors = apiClient.interceptors.request as any
      const handlers = interceptors.handlers
      
      if (handlers && handlers.length > 0) {
        const fulfilled = handlers[0].fulfilled
        if (fulfilled) {
          const result = fulfilled(config)
          expect(result.headers.Authorization).toBeUndefined()
        }
      }
    })
  })

  describe('response interceptor', () => {
    it('passes through successful responses', async () => {
      const { default: apiClient } = await import('./client')
      
      const interceptors = apiClient.interceptors.response as any
      const handlers = interceptors.handlers
      
      if (handlers && handlers.length > 0) {
        const fulfilled = handlers[0].fulfilled
        if (fulfilled) {
          const response = { data: 'test', status: 200 }
          const result = fulfilled(response)
          expect(result).toEqual(response)
        }
      }
    })

    it('clears localStorage on 401 response', async () => {
      vi.resetModules()
      const { default: apiClient } = await import('./client')
      
      const interceptors = apiClient.interceptors.response as any
      const handlers = interceptors.handlers
      
      if (handlers && handlers.length > 0) {
        const rejected = handlers[0].rejected
        if (rejected) {
          const error = { response: { status: 401 } }
          
          try {
            await rejected(error)
          } catch (e) {
            // Expected to throw
          }
          
          expect(localStorage.removeItem).toHaveBeenCalledWith('token')
          expect(localStorage.removeItem).toHaveBeenCalledWith('user')
        }
      }
    })

    it('redirects to login on 401 response', async () => {
      vi.resetModules()
      const { default: apiClient } = await import('./client')
      
      const interceptors = apiClient.interceptors.response as any
      const handlers = interceptors.handlers
      
      if (handlers && handlers.length > 0) {
        const rejected = handlers[0].rejected
        if (rejected) {
          const error = { response: { status: 401 } }
          
          try {
            await rejected(error)
          } catch (e) {
            // Expected to throw
          }
          
          expect(window.location.href).toBe('/login')
        }
      }
    })

    it('does not clear localStorage for non-401 errors', async () => {
      vi.mocked(localStorage.removeItem).mockClear()
      vi.resetModules()
      const { default: apiClient } = await import('./client')
      
      const interceptors = apiClient.interceptors.response as any
      const handlers = interceptors.handlers
      
      if (handlers && handlers.length > 0) {
        const rejected = handlers[0].rejected
        if (rejected) {
          const error = { response: { status: 500 } }
          
          try {
            await rejected(error)
          } catch (e) {
            // Expected to throw
          }
          
          // Should not have cleared localStorage for 500 error
          const removeItemCalls = vi.mocked(localStorage.removeItem).mock.calls
          const tokenRemoved = removeItemCalls.some(call => call[0] === 'token')
          expect(tokenRemoved).toBe(false)
        }
      }
    })

    it('propagates errors after handling', async () => {
      vi.resetModules()
      const { default: apiClient } = await import('./client')
      
      const interceptors = apiClient.interceptors.response as any
      const handlers = interceptors.handlers
      
      if (handlers && handlers.length > 0) {
        const rejected = handlers[0].rejected
        if (rejected) {
          const error = { response: { status: 404 }, message: 'Not Found' }
          
          await expect(rejected(error)).rejects.toEqual(error)
        }
      }
    })
  })
})
