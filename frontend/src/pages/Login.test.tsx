import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor, mockAuthResponse } from '../test/utils'
import Login from './Login'
import { authApi } from '../api/auth'

// Mock the auth API
vi.mock('../api/auth', () => ({
  authApi: {
    login: vi.fn(),
  },
}))

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders login form with all elements', () => {
    render(<Login />)

    expect(screen.getByRole('heading', { name: /pokedex/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByText(/demo credentials/i)).toBeInTheDocument()
  })

  it('shows validation error when submitting empty form', async () => {
    const user = userEvent.setup()
    render(<Login />)

    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(screen.getByText(/please fill in all fields/i)).toBeInTheDocument()
  })

  it('shows validation error when only username is filled', async () => {
    const user = userEvent.setup()
    render(<Login />)

    await user.type(screen.getByLabelText(/username/i), 'admin')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(screen.getByText(/please fill in all fields/i)).toBeInTheDocument()
  })

  it('shows validation error when only password is filled', async () => {
    const user = userEvent.setup()
    render(<Login />)

    await user.type(screen.getByLabelText(/password/i), 'admin')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(screen.getByText(/please fill in all fields/i)).toBeInTheDocument()
  })

  it('calls login API with correct credentials', async () => {
    const user = userEvent.setup()
    vi.mocked(authApi.login).mockResolvedValue(mockAuthResponse())
    
    render(<Login />)

    await user.type(screen.getByLabelText(/username/i), 'admin')
    await user.type(screen.getByLabelText(/password/i), 'admin')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith('admin', 'admin')
    })
  })

  it('navigates to home page on successful login', async () => {
    const user = userEvent.setup()
    vi.mocked(authApi.login).mockResolvedValue(mockAuthResponse())
    
    render(<Login />)

    await user.type(screen.getByLabelText(/username/i), 'admin')
    await user.type(screen.getByLabelText(/password/i), 'admin')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
    })
  })

  it('shows error message on login failure', async () => {
    const user = userEvent.setup()
    vi.mocked(authApi.login).mockRejectedValue(new Error('Invalid credentials'))
    
    render(<Login />)

    await user.type(screen.getByLabelText(/username/i), 'wrong')
    await user.type(screen.getByLabelText(/password/i), 'wrong')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })

  it('disables form inputs while loading', async () => {
    const user = userEvent.setup()
    // Create a promise that we can control
    let resolveLogin: (value: ReturnType<typeof mockAuthResponse>) => void
    vi.mocked(authApi.login).mockImplementation(
      () => new Promise((resolve) => { resolveLogin = resolve })
    )
    
    render(<Login />)

    await user.type(screen.getByLabelText(/username/i), 'admin')
    await user.type(screen.getByLabelText(/password/i), 'admin')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    // Check loading state
    expect(screen.getByLabelText(/username/i)).toBeDisabled()
    expect(screen.getByLabelText(/password/i)).toBeDisabled()
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()

    // Resolve the login
    resolveLogin!(mockAuthResponse())

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled()
    })
  })

  it('shows "Signing in..." text while loading', async () => {
    const user = userEvent.setup()
    vi.mocked(authApi.login).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )
    
    render(<Login />)

    await user.type(screen.getByLabelText(/username/i), 'admin')
    await user.type(screen.getByLabelText(/password/i), 'admin')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(screen.getByRole('button', { name: /signing in/i })).toBeInTheDocument()
  })

  it('clears error message when user starts typing', async () => {
    const user = userEvent.setup()
    vi.mocked(authApi.login).mockRejectedValue(new Error('Invalid credentials'))
    
    render(<Login />)

    // Trigger error
    await user.type(screen.getByLabelText(/username/i), 'wrong')
    await user.type(screen.getByLabelText(/password/i), 'wrong')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })

    // Start typing again - error should clear on next submit attempt
    await user.clear(screen.getByLabelText(/username/i))
    await user.clear(screen.getByLabelText(/password/i))
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    // Should show validation error now, not the API error
    expect(screen.getByText(/please fill in all fields/i)).toBeInTheDocument()
  })
})
