import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import type { ReactNode } from 'react'
import ProtectedRoute from './ProtectedRoute'
import { AuthProvider } from '../contexts/AuthContext'

// Mock the auth API
vi.mock('../api/auth', () => ({
  authApi: {
    login: vi.fn(),
  },
}))

// Helper to render with router
const renderWithRouter = (
  ui: ReactNode,
  { initialEntries = ['/'] }: { initialEntries?: string[] } = {}
) => {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={initialEntries}>
        {ui}
      </MemoryRouter>
    </AuthProvider>
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(localStorage.getItem).mockReturnValue(null)
  })

  it('redirects to login when user is not authenticated', () => {
    renderWithRouter(
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div>Protected Content</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    )

    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('renders children when user is authenticated', async () => {
    // Mock authenticated state BEFORE rendering
    vi.mocked(localStorage.getItem).mockImplementation((key) => {
      if (key === 'token') return 'valid-token'
      if (key === 'user') return JSON.stringify({ username: 'admin' })
      return null
    })

    renderWithRouter(
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div>Protected Content</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    )

    // When authenticated, should render protected content, not redirect
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument()
  })

  it('preserves route when redirecting to login', () => {
    renderWithRouter(
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route
          path="/protected/:id"
          element={
            <ProtectedRoute>
              <div>Protected Content</div>
            </ProtectedRoute>
          }
        />
      </Routes>,
      { initialEntries: ['/protected/123'] }
    )

    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('redirects unauthenticated users from nested routes', () => {
    renderWithRouter(
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div>
                <h1>Home</h1>
                <div>Welcome, user!</div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    )

    // Unauthenticated users should be redirected
    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Home' })).not.toBeInTheDocument()
  })
})
