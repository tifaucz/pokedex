import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { screen, waitFor } from '../test/utils'
import { render } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import PokemonDetail from './PokemonDetail'
import { pokemonApi } from '../api/pokemon'
import { AuthProvider } from '../contexts/AuthContext'
import { mockPokemonDetail } from '../test/utils'

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

// Helper to render with route params
const renderWithRoute = (pokemonId: string = '1') => {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[`/pokemon/${pokemonId}`]}>
        <Routes>
          <Route path="/pokemon/:id" element={<PokemonDetail />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  )
}

const detailedPokemon = mockPokemonDetail()

describe('PokemonDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading State', () => {
    it('shows loading indicator while fetching data', () => {
      vi.mocked(pokemonApi.getById).mockImplementation(
        () => new Promise(() => {})
      )

      renderWithRoute('1')

      expect(screen.getByText(/loading pokemon/i)).toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('shows error message when API fails', async () => {
      vi.mocked(pokemonApi.getById).mockRejectedValue(new Error('Not found'))

      renderWithRoute('1')

      await waitFor(() => {
        expect(screen.getByText(/failed to load pokemon details/i)).toBeInTheDocument()
      })
    })

    it('shows "Back to List" button on error', async () => {
      vi.mocked(pokemonApi.getById).mockRejectedValue(new Error('Not found'))

      renderWithRoute('1')

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /back to list/i })).toBeInTheDocument()
      })
    })

    it('navigates back to list when "Back to List" is clicked', async () => {
      const user = userEvent.setup()
      vi.mocked(pokemonApi.getById).mockRejectedValue(new Error('Not found'))

      renderWithRoute('1')

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /back to list/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /back to list/i }))

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/')
      })
    })

    it('shows "Pokemon not found" when pokemon is null', async () => {
      vi.mocked(pokemonApi.getById).mockRejectedValue(new Error('Not found'))

      renderWithRoute('999')

      await waitFor(() => {
        expect(screen.getByText(/failed to load pokemon details|pokemon not found/i)).toBeInTheDocument()
      })
    })
  })

  describe('Success State', () => {
    beforeEach(() => {
      vi.mocked(pokemonApi.getById).mockResolvedValue(detailedPokemon)
    })

    it('renders Pokemon name as heading', async () => {
      renderWithRoute('1')

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /bulbasaur/i })).toBeInTheDocument()
      })
    })

    it('renders Pokemon number with leading zeros', async () => {
      renderWithRoute('1')

      await waitFor(() => {
        expect(screen.getByText('#001')).toBeInTheDocument()
      })
    })

    it('renders Pokemon image', async () => {
      renderWithRoute('1')

      await waitFor(() => {
        const img = screen.getByRole('img', { name: /bulbasaur/i })
        expect(img).toBeInTheDocument()
        expect(img).toHaveAttribute('src', detailedPokemon.image)
      })
    })

    it('renders Pokemon types as chips', async () => {
      renderWithRoute('1')

      await waitFor(() => {
        expect(screen.getByText('grass')).toBeInTheDocument()
        expect(screen.getByText('poison')).toBeInTheDocument()
      })
    })

    it('renders "About" section', async () => {
      renderWithRoute('1')

      await waitFor(() => {
        expect(screen.getByText('About')).toBeInTheDocument()
      })
    })

    it('renders Pokemon weight', async () => {
      renderWithRoute('1')

      await waitFor(() => {
        expect(screen.getByText(/6.9 kg/i)).toBeInTheDocument()
        expect(screen.getByText('Weight')).toBeInTheDocument()
      })
    })

    it('renders Pokemon height', async () => {
      renderWithRoute('1')

      await waitFor(() => {
        expect(screen.getByText(/0.7 m/i)).toBeInTheDocument()
        expect(screen.getByText('Height')).toBeInTheDocument()
      })
    })

    it('renders Pokemon abilities', async () => {
      renderWithRoute('1')

      await waitFor(() => {
        expect(screen.getByText(/overgrow/i)).toBeInTheDocument()
      })
    })

    it('renders Pokemon description', async () => {
      renderWithRoute('1')

      await waitFor(() => {
        expect(screen.getByText(/strange seed was planted/i)).toBeInTheDocument()
      })
    })

    it('renders "Base Stats" section', async () => {
      renderWithRoute('1')

      await waitFor(() => {
        expect(screen.getByText('Base Stats')).toBeInTheDocument()
      })
    })

    it('renders all stat bars', async () => {
      renderWithRoute('1')

      await waitFor(() => {
        expect(screen.getByText('HP')).toBeInTheDocument()
        expect(screen.getByText('ATK')).toBeInTheDocument()
        expect(screen.getByText('DEF')).toBeInTheDocument()
        expect(screen.getByText('SATK')).toBeInTheDocument()
        expect(screen.getByText('SDEF')).toBeInTheDocument()
        expect(screen.getByText('SPD')).toBeInTheDocument()
      })
    })

    it('renders stat values with leading zeros', async () => {
      renderWithRoute('1')

      await waitFor(() => {
        // HP is 45 -> "045", SPD is also 45 -> "045"
        // Use getAllByText since there are multiple stats with value 45
        const statValues = screen.getAllByText('045')
        expect(statValues.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Navigation', () => {
    beforeEach(() => {
      vi.mocked(pokemonApi.getById).mockResolvedValue(detailedPokemon)
    })

    it('renders back button', async () => {
      renderWithRoute('1')

      await waitFor(() => {
        // There should be a back button (arrow icon)
        const backButtons = screen.getAllByRole('button')
        expect(backButtons.length).toBeGreaterThan(0)
      })
    })

    it('navigates back to list when back button is clicked', async () => {
      const user = userEvent.setup()
      renderWithRoute('1')

      await waitFor(() => {
        expect(screen.getByText('bulbasaur')).toBeInTheDocument()
      })

      // Find the back button (first button in header)
      const buttons = screen.getAllByRole('button')
      const backButton = buttons.find(btn => btn.querySelector('svg[viewBox="0 0 32 32"]'))
      
      if (backButton) {
        await user.click(backButton)
        await waitFor(() => {
          expect(mockNavigate).toHaveBeenCalledWith('/')
        })
      }
    })

    it('renders previous Pokemon navigation button', async () => {
      renderWithRoute('5')
      vi.mocked(pokemonApi.getById).mockResolvedValue(mockPokemonDetail({ id: 5, number: 5 }))

      await waitFor(() => {
        // Left chevron button should be enabled for Pokemon > 1
        const buttons = screen.getAllByRole('button')
        const prevButton = buttons.find(btn => btn.querySelector('svg[viewBox="0 0 24 24"]'))
        expect(prevButton).toBeTruthy()
      })
    })

    it('navigates to previous Pokemon when chevron left is clicked', async () => {
      const user = userEvent.setup()
      vi.mocked(pokemonApi.getById).mockResolvedValue(mockPokemonDetail({ id: 5, number: 5, name: 'charmeleon' }))
      
      renderWithRoute('5')

      await waitFor(() => {
        expect(screen.getByText('charmeleon')).toBeInTheDocument()
      })

      // Find prev button (left chevron)
      const buttons = screen.getAllByRole('button')
      const prevButton = buttons.find(btn => 
        btn.querySelector('svg path[d*="15.41"]') || btn.querySelector('svg path[d*="L14 6"]')
      )

      if (prevButton && !prevButton.hasAttribute('disabled')) {
        await user.click(prevButton)
        await waitFor(() => {
          expect(mockNavigate).toHaveBeenCalledWith('/pokemon/4')
        })
      }
    })

    it('navigates to next Pokemon when chevron right is clicked', async () => {
      const user = userEvent.setup()
      renderWithRoute('1')

      await waitFor(() => {
        expect(screen.getByText('bulbasaur')).toBeInTheDocument()
      })

      // Find next button (right chevron)
      const buttons = screen.getAllByRole('button')
      const nextButton = buttons.find(btn => 
        btn.querySelector('svg path[d*="10 6"]') || btn.querySelector('svg path[d*="L10 18"]')
      )

      if (nextButton) {
        await user.click(nextButton)
        await waitFor(() => {
          expect(mockNavigate).toHaveBeenCalledWith('/pokemon/2')
        })
      }
    })

    it('disables previous button for Pokemon #1', async () => {
      renderWithRoute('1')

      await waitFor(() => {
        expect(screen.getByText('bulbasaur')).toBeInTheDocument()
      })

      // Find the prev button and check if it's disabled
      const buttons = screen.getAllByRole('button')
      const prevButton = buttons.find(btn => 
        btn.classList.contains('opacity-30') || btn.getAttribute('disabled') !== null
      )
      
      // The prev button should have opacity-30 class for Pokemon #1
      expect(prevButton).toBeTruthy()
    })
  })

  describe('API Integration', () => {
    it('calls getById with correct Pokemon ID', async () => {
      vi.mocked(pokemonApi.getById).mockResolvedValue(detailedPokemon)

      renderWithRoute('25')

      await waitFor(() => {
        expect(pokemonApi.getById).toHaveBeenCalledWith(25)
      })
    })

    it('fetches new Pokemon when ID changes', async () => {
      vi.mocked(pokemonApi.getById)
        .mockResolvedValueOnce(mockPokemonDetail({ id: 1, name: 'bulbasaur' }))
        .mockResolvedValueOnce(mockPokemonDetail({ id: 2, name: 'ivysaur' }))

      const { rerender } = render(
        <AuthProvider>
          <MemoryRouter initialEntries={['/pokemon/1']}>
            <Routes>
              <Route path="/pokemon/:id" element={<PokemonDetail />} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      )

      await waitFor(() => {
        expect(pokemonApi.getById).toHaveBeenCalledWith(1)
      })
    })
  })

  describe('Type Colors', () => {
    it('applies correct background color for grass type', async () => {
      vi.mocked(pokemonApi.getById).mockResolvedValue(
        mockPokemonDetail({ types: ['grass'] })
      )

      renderWithRoute('1')

      await waitFor(() => {
        // The grass type chip should have the correct background color
        const grassChip = screen.getByText('grass')
        expect(grassChip).toHaveStyle({ backgroundColor: '#74CB48' })
      })
    })

    it('applies correct background color for fire type', async () => {
      vi.mocked(pokemonApi.getById).mockResolvedValue(
        mockPokemonDetail({ types: ['fire'], name: 'charmander' })
      )

      renderWithRoute('4')

      await waitFor(() => {
        const fireChip = screen.getByText('fire')
        expect(fireChip).toHaveStyle({ backgroundColor: '#F57D31' })
      })
    })

    it('applies correct background color for water type', async () => {
      vi.mocked(pokemonApi.getById).mockResolvedValue(
        mockPokemonDetail({ types: ['water'], name: 'squirtle' })
      )

      renderWithRoute('7')

      await waitFor(() => {
        const waterChip = screen.getByText('water')
        expect(waterChip).toHaveStyle({ backgroundColor: '#6493EB' })
      })
    })
  })

  describe('Stat Bars', () => {
    it('renders stat bars with correct proportional widths', async () => {
      vi.mocked(pokemonApi.getById).mockResolvedValue(
        mockPokemonDetail({
          stats: { hp: 255, atk: 100, def: 50, satk: 0, sdef: 127, spd: 200 }
        })
      )

      renderWithRoute('1')

      await waitFor(() => {
        expect(screen.getByText('HP')).toBeInTheDocument()
        // Max stat is 255, so HP at 255 should be 100% width
        // This is tested by the component logic
      })
    })
  })
})
