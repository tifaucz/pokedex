import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authApi } from './auth'
import apiClient from './client'

// Mock the API client
vi.mock('./client', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('calls POST /login with credentials', async () => {
      const mockResponse = {
        data: {
          token: 'test-token',
          user: { username: 'admin' },
        },
      }
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      await authApi.login('admin', 'admin')

      expect(apiClient.post).toHaveBeenCalledWith('/login', {
        username: 'admin',
        password: 'admin',
      })
    })

    it('returns token and user on success', async () => {
      const mockResponse = {
        data: {
          token: 'test-token-123',
          user: { username: 'testuser' },
        },
      }
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const result = await authApi.login('testuser', 'password')

      expect(result).toEqual({
        token: 'test-token-123',
        user: { username: 'testuser' },
      })
    })

    it('propagates API errors', async () => {
      const error = new Error('Invalid credentials')
      vi.mocked(apiClient.post).mockRejectedValue(error)

      await expect(authApi.login('wrong', 'wrong')).rejects.toThrow('Invalid credentials')
    })

    it('handles network errors', async () => {
      const networkError = new Error('Network Error')
      vi.mocked(apiClient.post).mockRejectedValue(networkError)

      await expect(authApi.login('admin', 'admin')).rejects.toThrow('Network Error')
    })
  })
})
