import type { ReactElement, ReactNode } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'

interface WrapperProps {
  children: ReactNode
}

// Default wrapper with all providers
const AllProviders = ({ children }: WrapperProps) => {
  return (
    <AuthProvider>
      <BrowserRouter>{children}</BrowserRouter>
    </AuthProvider>
  )
}

// Custom render with providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options })

// Render with MemoryRouter for testing specific routes
interface MemoryRouterOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[]
}

const renderWithMemoryRouter = (
  ui: ReactElement,
  { initialEntries = ['/'], ...options }: MemoryRouterOptions = {}
) => {
  const Wrapper = ({ children }: WrapperProps) => (
    <AuthProvider>
      <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
    </AuthProvider>
  )
  return render(ui, { wrapper: Wrapper, ...options })
}

// Mock data factories
export const mockPokemon = (overrides = {}) => ({
  id: 1,
  name: 'bulbasaur',
  number: 1,
  image: 'https://example.com/bulbasaur.png',
  ...overrides,
})

export const mockPokemonDetail = (overrides = {}) => ({
  id: 1,
  name: 'bulbasaur',
  number: 1,
  image: 'https://example.com/bulbasaur.png',
  types: ['grass', 'poison'],
  weight: 6.9,
  height: 0.7,
  abilities: ['overgrow', 'chlorophyll'],
  moves: ['tackle', 'growl'],
  stats: {
    hp: 45,
    atk: 49,
    def: 49,
    satk: 65,
    sdef: 65,
    spd: 45,
  },
  description: 'A strange seed was planted on its back at birth.',
  ...overrides,
})

export const mockPokemonList = (count = 3) => 
  Array.from({ length: count }, (_, i) => mockPokemon({
    id: i + 1,
    name: `pokemon-${i + 1}`,
    number: i + 1,
    image: `https://example.com/pokemon-${i + 1}.png`,
  }))

export const mockAuthResponse = (overrides = {}) => ({
  token: 'mock-token-123',
  user: { username: 'admin' },
  ...overrides,
})

// Re-export everything from testing-library
export * from '@testing-library/react'
export { customRender as render, renderWithMemoryRouter }
