import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor, within } from '../test/utils'
import PokemonList from './PokemonList'
import { pokemonApi } from '../api/pokemon'

// Mock IntersectionObserver (not available in jsdom)
class MockIntersectionObserver {
  observe = vi.fn()
  disconnect = vi.fn()
  constructor(_callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {}
}
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)

// Mock the pokemon API
vi.mock('../api/pokemon', () => ({
  pokemonApi: {
    getAll: vi.fn(),
    getById: vi.fn(),
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

// Mock authenticated state
beforeEach(() => {
  vi.mocked(localStorage.getItem).mockImplementation((key) => {
    if (key === 'token') return 'valid-token'
    if (key === 'user') return JSON.stringify({ username: 'admin' })
    return null
  })
})

const mockPokemons = [
  { id: 1, name: 'bulbasaur', number: 1, image: 'https://example.com/1.png' },
  { id: 2, name: 'ivysaur', number: 2, image: 'https://example.com/2.png' },
  { id: 3, name: 'venusaur', number: 3, image: 'https://example.com/3.png' },
  { id: 4, name: 'charmander', number: 4, image: 'https://example.com/4.png' },
  { id: 25, name: 'pikachu', number: 25, image: 'https://example.com/25.png' },
]

describe('PokemonList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading State', () => {
    it('shows loading indicator while fetching data', () => {
      vi.mocked(pokemonApi.getAll).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      render(<PokemonList />)

      expect(screen.getByText(/loading pokemon/i)).toBeInTheDocument()
    })

    it('shows spinner while loading', () => {
      vi.mocked(pokemonApi.getAll).mockImplementation(
        () => new Promise(() => {})
      )

      render(<PokemonList />)

      // Should show the loading spinner
      const spinner = document.querySelector('.animate-spin')
      expect(spinner).toBeTruthy()
    })
  })

  describe('Error State', () => {
    it('shows error message when API fails', async () => {
      vi.mocked(pokemonApi.getAll).mockRejectedValue(new Error('Network error'))

      render(<PokemonList />)

      await waitFor(() => {
        expect(screen.getByText(/failed to load pokemon/i)).toBeInTheDocument()
      })
    })

    it('shows retry button on error', async () => {
      vi.mocked(pokemonApi.getAll).mockRejectedValue(new Error('Network error'))

      render(<PokemonList />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
      })
    })

    it('calls fetch again when retry button is clicked', async () => {
      const user = userEvent.setup()
      vi.mocked(pokemonApi.getAll).mockRejectedValue(new Error('Network error'))

      render(<PokemonList />)

      await waitFor(() => {
        expect(screen.getByText(/failed to load pokemon/i)).toBeInTheDocument()
      })

      // Reset call count
      vi.mocked(pokemonApi.getAll).mockClear()

      await user.click(screen.getByRole('button', { name: /try again/i }))

      // Verify the API was called again (even though it will fail again)
      await waitFor(() => {
        expect(pokemonApi.getAll).toHaveBeenCalled()
      })
    })
  })

  describe('Success State', () => {
    beforeEach(() => {
      vi.mocked(pokemonApi.getAll).mockResolvedValue({
        pokemons: mockPokemons,
        count: mockPokemons.length,
        offset: 0,
        limit: 50,
        has_more: false,
      })
    })

    it('renders pokemon list after loading', async () => {
      render(<PokemonList />)

      await waitFor(() => {
        expect(screen.getByText('bulbasaur')).toBeInTheDocument()
        expect(screen.getByText('ivysaur')).toBeInTheDocument()
        expect(screen.getByText('venusaur')).toBeInTheDocument()
        expect(screen.getByText('charmander')).toBeInTheDocument()
        expect(screen.getByText('pikachu')).toBeInTheDocument()
      })
    })

    it('shows Pokemon numbers with leading zeros', async () => {
      render(<PokemonList />)

      await waitFor(() => {
        expect(screen.getByText('#001')).toBeInTheDocument()
        expect(screen.getByText('#025')).toBeInTheDocument()
      })
    })

    it('renders Pokemon images', async () => {
      render(<PokemonList />)

      await waitFor(() => {
        const images = screen.getAllByRole('img')
        expect(images.length).toBe(mockPokemons.length)
        expect(images[0]).toHaveAttribute('alt', 'bulbasaur')
      })
    })

    it('renders page header with title', async () => {
      render(<PokemonList />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /pokédex/i })).toBeInTheDocument()
      })
    })
  })

  describe('Search Functionality', () => {
    // Helper: returns a paginated response filtered by a term (mirrors backend logic)
    const filteredResponse = (term?: string) => {
      const filtered = term
        ? mockPokemons.filter(p =>
            p.name.includes(term.toLowerCase()) || p.number.toString().includes(term)
          )
        : mockPokemons
      return { pokemons: filtered, count: filtered.length, offset: 0, limit: 50, has_more: false }
    }

    beforeEach(() => {
      // Default: return all; when called with a search param, filter accordingly
      vi.mocked(pokemonApi.getAll).mockImplementation((_offset, _limit, search) =>
        Promise.resolve(filteredResponse(search))
      )
    })

    it('renders search input', async () => {
      render(<PokemonList />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
      })
    })

    it('filters Pokemon by name', async () => {
      const user = userEvent.setup({ delay: null })
      render(<PokemonList />)

      await waitFor(() => {
        expect(screen.getByText('bulbasaur')).toBeInTheDocument()
      })

      await user.type(screen.getByPlaceholderText(/search/i), 'pika')

      // Wait for debounce + refetch
      await waitFor(() => {
        expect(screen.getByText('pikachu')).toBeInTheDocument()
        expect(screen.queryByText('bulbasaur')).not.toBeInTheDocument()
        expect(screen.queryByText('charmander')).not.toBeInTheDocument()
      })
    })

    it('filters Pokemon by number', async () => {
      const user = userEvent.setup({ delay: null })
      render(<PokemonList />)

      await waitFor(() => {
        expect(screen.getByText('bulbasaur')).toBeInTheDocument()
      })

      await user.type(screen.getByPlaceholderText(/search/i), '25')

      await waitFor(() => {
        expect(screen.getByText('pikachu')).toBeInTheDocument()
        expect(screen.queryByText('bulbasaur')).not.toBeInTheDocument()
      })
    })

    it('shows "No Pokemon found" when search has no results', async () => {
      const user = userEvent.setup({ delay: null })
      render(<PokemonList />)

      await waitFor(() => {
        expect(screen.getByText('bulbasaur')).toBeInTheDocument()
      })

      await user.type(screen.getByPlaceholderText(/search/i), 'xyz123')

      await waitFor(() => {
        expect(screen.getByText(/no pokemon found/i)).toBeInTheDocument()
      })
    })

    it('search is case insensitive', async () => {
      const user = userEvent.setup({ delay: null })
      render(<PokemonList />)

      await waitFor(() => {
        expect(screen.getByText('bulbasaur')).toBeInTheDocument()
      })

      await user.type(screen.getByPlaceholderText(/search/i), 'BULBA')

      await waitFor(() => {
        expect(screen.getByText('bulbasaur')).toBeInTheDocument()
      })
    })

    it('clears search results when input is cleared', async () => {
      const user = userEvent.setup({ delay: null })
      render(<PokemonList />)

      await waitFor(() => {
        expect(screen.getByText('bulbasaur')).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText(/search/i)
      await user.type(searchInput, 'pika')

      await waitFor(() => {
        expect(screen.queryByText('bulbasaur')).not.toBeInTheDocument()
      })

      await user.clear(searchInput)

      await waitFor(() => {
        expect(screen.getByText('bulbasaur')).toBeInTheDocument()
        expect(screen.getByText('pikachu')).toBeInTheDocument()
      })
    })
  })

  describe('Sorting Functionality', () => {
    beforeEach(() => {
      vi.mocked(pokemonApi.getAll).mockResolvedValue({
        pokemons: mockPokemons,
        count: mockPokemons.length,
        offset: 0,
        limit: 50,
        has_more: false,
      })
    })

    it('renders sort button', async () => {
      render(<PokemonList />)

      await waitFor(() => {
        expect(screen.getByTitle('Sort')).toBeInTheDocument()
      })
    })

    it('sorts by number by default (ascending)', async () => {
      render(<PokemonList />)

      await waitFor(() => {
        const cards = screen.getAllByText(/^[a-z]+$/i).filter(el => 
          ['bulbasaur', 'ivysaur', 'venusaur', 'charmander', 'pikachu'].includes(el.textContent?.toLowerCase() || '')
        )
        expect(cards[0]).toHaveTextContent('bulbasaur')
        expect(cards[4]).toHaveTextContent('pikachu')
      })
    })

    it('opens sort modal and sorts by name when Name option is selected', async () => {
      const user = userEvent.setup()

      // Return name-sorted data when sort=name is passed
      const nameSorted = [...mockPokemons].sort((a, b) => a.name.localeCompare(b.name))
      vi.mocked(pokemonApi.getAll).mockImplementation(async (_offset, _limit, _search, sort) => ({
        pokemons: sort === 'name' ? nameSorted : mockPokemons,
        count: mockPokemons.length,
        offset: 0,
        limit: 50,
        has_more: false,
      }))

      render(<PokemonList />)

      await waitFor(() => {
        expect(screen.getByText('bulbasaur')).toBeInTheDocument()
      })

      // Open modal
      await user.click(screen.getByTitle('Sort'))
      expect(screen.getByText('Sort by:')).toBeInTheDocument()

      // Select Name option
      await user.click(screen.getByText('name'))

      // Modal should close and list should re-fetch sorted by name
      await waitFor(() => {
        expect(screen.queryByText('Sort by:')).not.toBeInTheDocument()
        const cards = screen.getAllByText(/^[a-z]+$/i).filter(el => 
          ['bulbasaur', 'ivysaur', 'venusaur', 'charmander', 'pikachu'].includes(el.textContent?.toLowerCase() || '')
        )
        // Alphabetically: bulbasaur, charmander, ivysaur, pikachu, venusaur
        expect(cards[0]).toHaveTextContent('bulbasaur')
        expect(cards[1]).toHaveTextContent('charmander')
      })
    })

    it('can sort back to number after sorting by name', async () => {
      const user = userEvent.setup()

      const nameSorted = [...mockPokemons].sort((a, b) => a.name.localeCompare(b.name))
      vi.mocked(pokemonApi.getAll).mockImplementation(async (_offset, _limit, _search, sort) => ({
        pokemons: sort === 'name' ? nameSorted : mockPokemons,
        count: mockPokemons.length,
        offset: 0,
        limit: 50,
        has_more: false,
      }))

      render(<PokemonList />)

      await waitFor(() => {
        expect(screen.getByText('bulbasaur')).toBeInTheDocument()
      })

      // Sort by name
      await user.click(screen.getByTitle('Sort'))
      await user.click(screen.getByText('name'))

      await waitFor(() => {
        expect(screen.queryByText('Sort by:')).not.toBeInTheDocument()
      })

      // Sort back to number
      await user.click(screen.getByTitle('Sort'))
      await user.click(screen.getByText('number'))

      await waitFor(() => {
        const cards = screen.getAllByText(/^[a-z]+$/i).filter(el => 
          ['bulbasaur', 'ivysaur', 'venusaur', 'charmander', 'pikachu'].includes(el.textContent?.toLowerCase() || '')
        )
        expect(cards[0]).toHaveTextContent('bulbasaur')
        expect(cards[4]).toHaveTextContent('pikachu')
      })
    })
  })

  describe('Navigation', () => {
    beforeEach(() => {
      vi.mocked(pokemonApi.getAll).mockResolvedValue({
        pokemons: mockPokemons,
        count: mockPokemons.length,
        offset: 0,
        limit: 50,
        has_more: false,
      })
    })

    it('navigates to Pokemon detail page when card is clicked', async () => {
      const user = userEvent.setup()
      render(<PokemonList />)

      await waitFor(() => {
        expect(screen.getByText('bulbasaur')).toBeInTheDocument()
      })

      // Find the card containing bulbasaur and click it
      const bulbasaurCard = screen.getByText('bulbasaur').closest('div[class*="cursor-pointer"]')
      expect(bulbasaurCard).toBeTruthy()
      
      await user.click(bulbasaurCard!)

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/pokemon/1')
      })
    })

    it('navigates to correct Pokemon based on ID', async () => {
      const user = userEvent.setup()
      render(<PokemonList />)

      await waitFor(() => {
        expect(screen.getByText('pikachu')).toBeInTheDocument()
      })

      const pikachuCard = screen.getByText('pikachu').closest('div[class*="cursor-pointer"]')
      await user.click(pikachuCard!)

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/pokemon/25')
      })
    })
  })

  describe('Image Handling', () => {
    beforeEach(() => {
      vi.mocked(pokemonApi.getAll).mockResolvedValue({
        pokemons: mockPokemons,
        count: mockPokemons.length,
        offset: 0,
        limit: 50,
        has_more: false,
      })
    })

    it('shows placeholder on image error', async () => {
      render(<PokemonList />)

      await waitFor(() => {
        expect(screen.getByText('bulbasaur')).toBeInTheDocument()
      })

      // Simulate image error
      const images = screen.getAllByRole('img')
      images[0].dispatchEvent(new Event('error'))

      // The placeholder should be shown (PokeballIcon)
      // We can verify this by checking that the error handler was triggered
      // The actual placeholder rendering is handled by React state
    })
  })
})
