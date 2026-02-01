import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { AuthProvider, useAuth } from './AuthContext'
import { authApi } from '../api/auth'
import { mockAuthResponse } from '../test/utils'

// Mock the auth API
vi.mock('../api/auth', () => ({
  authApi: {
    login: vi.fn(),
  },
}))

// Wrapper component for the hook
const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(localStorage.getItem).mockReturnValue(null)
    vi.mocked(localStorage.setItem).mockClear()
    vi.mocked(localStorage.removeItem).mockClear()
  })

  describe('useAuth hook', () => {
    it('throws error when used outside AuthProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      expect(() => {
        renderHook(() => useAuth())
      }).toThrow('useAuth must be used within an AuthProvider')
      
      consoleSpy.mockRestore()
    })

    it('provides initial unauthenticated state', () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBe(null)
      expect(result.current.token).toBe(null)
    })

    it('restores auth state from localStorage on mount', () => {
      vi.mocked(localStorage.getItem).mockImplementation((key) => {
        if (key === 'token') return 'stored-token'
        if (key === 'user') return JSON.stringify({ username: 'admin' })
        return null
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.token).toBe('stored-token')
      expect(result.current.user).toEqual({ username: 'admin' })
    })
  })

  describe('login', () => {
    it('successfully logs in and stores credentials', async () => {
      vi.mocked(authApi.login).mockResolvedValue(mockAuthResponse())
      
      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.login('admin', 'admin')
      })

      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.token).toBe('mock-token-123')
      expect(result.current.user).toEqual({ username: 'admin' })
      
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'mock-token-123')
      expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify({ username: 'admin' }))
    })

    it('calls authApi.login with correct credentials', async () => {
      vi.mocked(authApi.login).mockResolvedValue(mockAuthResponse())
      
      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.login('testuser', 'testpass')
      })

      expect(authApi.login).toHaveBeenCalledWith('testuser', 'testpass')
    })

    it('propagates login errors', async () => {
      const error = new Error('Invalid credentials')
      vi.mocked(authApi.login).mockRejectedValue(error)
      
      const { result } = renderHook(() => useAuth(), { wrapper })

      await expect(
        act(async () => {
          await result.current.login('wrong', 'wrong')
        })
      ).rejects.toThrow('Invalid credentials')

      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('logout', () => {
    it('clears auth state and localStorage', async () => {
      vi.mocked(authApi.login).mockResolvedValue(mockAuthResponse())
      
      const { result } = renderHook(() => useAuth(), { wrapper })

      // First login
      await act(async () => {
        await result.current.login('admin', 'admin')
      })

      expect(result.current.isAuthenticated).toBe(true)

      // Then logout
      act(() => {
        result.current.logout()
      })

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.token).toBe(null)
      expect(result.current.user).toBe(null)
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('token')
      expect(localStorage.removeItem).toHaveBeenCalledWith('user')
    })
  })

  describe('isAuthenticated', () => {
    it('returns true when token exists', async () => {
      vi.mocked(authApi.login).mockResolvedValue(mockAuthResponse())
      
      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.login('admin', 'admin')
      })

      expect(result.current.isAuthenticated).toBe(true)
    })

    it('returns false when token is null', () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.isAuthenticated).toBe(false)
    })
  })
})
