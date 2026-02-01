import { describe, it, expect, vi, beforeEach } from 'vitest'
import { pokemonApi } from './pokemon'
import apiClient from './client'
import { mockPokemon, mockPokemonDetail } from '../test/utils'

// Mock the API client
vi.mock('./client', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

describe('pokemonApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('calls GET /pokemons', async () => {
      const mockResponse = {
        data: {
          pokemons: [mockPokemon()],
          count: 1,
        },
      }
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      await pokemonApi.getAll()

      expect(apiClient.get).toHaveBeenCalledWith('/pokemons', { params: { offset: 0, limit: 50 } })
    })

    it('returns pokemons list and count', async () => {
      const pokemons = [
        mockPokemon({ id: 1, name: 'bulbasaur' }),
        mockPokemon({ id: 2, name: 'ivysaur' }),
      ]
      const mockResponse = {
        data: {
          pokemons,
          count: 2,
        },
      }
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await pokemonApi.getAll()

      expect(result).toEqual({
        pokemons,
        count: 2,
      })
    })

    it('handles empty response', async () => {
      const mockResponse = {
        data: {
          pokemons: [],
          count: 0,
        },
      }
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await pokemonApi.getAll()

      expect(result.pokemons).toHaveLength(0)
      expect(result.count).toBe(0)
    })

    it('propagates API errors', async () => {
      const error = new Error('Server error')
      vi.mocked(apiClient.get).mockRejectedValue(error)

      await expect(pokemonApi.getAll()).rejects.toThrow('Server error')
    })
  })

  describe('getById', () => {
    it('calls GET /pokemons/:id with correct ID', async () => {
      const mockResponse = {
        data: mockPokemonDetail(),
      }
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      await pokemonApi.getById(1)

      expect(apiClient.get).toHaveBeenCalledWith('/pokemons/1')
    })

    it('returns detailed Pokemon data', async () => {
      const pokemon = mockPokemonDetail({ id: 25, name: 'pikachu' })
      const mockResponse = { data: pokemon }
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await pokemonApi.getById(25)

      expect(result).toEqual(pokemon)
      expect(result.name).toBe('pikachu')
      expect(result.types).toBeDefined()
      expect(result.stats).toBeDefined()
    })

    it('handles different Pokemon IDs', async () => {
      const mockResponse = { data: mockPokemonDetail({ id: 150 }) }
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      await pokemonApi.getById(150)

      expect(apiClient.get).toHaveBeenCalledWith('/pokemons/150')
    })

    it('propagates 404 errors', async () => {
      const error = new Error('Not Found')
      vi.mocked(apiClient.get).mockRejectedValue(error)

      await expect(pokemonApi.getById(999)).rejects.toThrow('Not Found')
    })
  })
})
