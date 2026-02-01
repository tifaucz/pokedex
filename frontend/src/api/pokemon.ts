import apiClient from './client';
import type { PokemonsResponse, PokemonDetail } from '../types';

export const pokemonApi = {
  getAll: async (offset = 0, limit = 50, search?: string, sort?: string): Promise<PokemonsResponse> => {
    const params: Record<string, string | number> = { offset, limit };
    if (search) params.search = search;
    if (sort) params.sort = sort;
    const response = await apiClient.get<PokemonsResponse>('/pokemons', { params });
    return response.data;
  },

  getById: async (id: number): Promise<PokemonDetail> => {
    const response = await apiClient.get<PokemonDetail>(`/pokemons/${id}`);
    return response.data;
  },
};
