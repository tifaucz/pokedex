export interface Pokemon {
  id: number;
  name: string;
  number: number;
  image: string;
}

export interface PokemonStats {
  hp: number;
  atk: number;
  def: number;
  satk: number;
  sdef: number;
  spd: number;
}

export interface PokemonDetail extends Pokemon {
  types: string[];
  weight: number;
  height: number;
  abilities: string[];
  moves: string[];
  stats: PokemonStats;
  description: string;
}

export interface AuthResponse {
  token: string;
  user: {
    username: string;
  };
}

export interface PokemonsResponse {
  pokemons: Pokemon[];
  count: number;
  offset: number;
  limit: number;
  has_more: boolean;
}

export interface User {
  username: string;
}
