class PokemonsController < ApplicationController
  include Authenticatable

  def index
    offset = params[:offset]&.to_i || 0
    limit = params[:limit]&.to_i || 50
    search = params[:search]
    sort = params[:sort]

    result = PokeapiService.fetch_pokemons(offset: offset, limit: limit, search: search, sort: sort)

    if result
      render json: result, status: :ok
    else
      render json: { error: 'Failed to fetch pokemons' }, status: :internal_server_error
    end
  end

  def show
    result = PokeapiService.fetch_pokemon(params[:id])
    
    if result
      render json: result, status: :ok
    else
      render json: { error: 'Pokemon not found' }, status: :not_found
    end
  end
end
