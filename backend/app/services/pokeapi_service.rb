class PokeapiService
  include HTTParty
  base_uri 'https://pokeapi.co/api/v2'

  def self.fetch_pokemons(offset: 0, limit: 50, search: nil, sort: 'number')
    all_pokemons = fetch_all_pokemons_cached
    return nil unless all_pokemons

    # Filter by search term (match name or number)
    filtered = if search.present?
                 term = search.to_s.downcase.strip
                 all_pokemons.select do |p|
                   p[:name].include?(term) || p[:number].to_s.include?(term)
                 end
               else
                 all_pokemons
               end

    # Sort before paginating
    sorted = case sort
             when 'name' then filtered.sort_by { |p| p[:name] }
             else filtered.sort_by { |p| p[:number] }
             end

    total = sorted.count
    paginated = sorted.slice(offset, limit) || []

    {
      pokemons: paginated,
      count: total,
      offset: offset,
      limit: limit,
      has_more: (offset + limit) < total
    }
  rescue StandardError => e
    Rails.logger.error "PokeAPI fetch_pokemons error: #{e.message}"
    nil
  end

  # Fetches the full Pokemon list and caches it for 1 hour
  def self.fetch_all_pokemons_cached
    Rails.cache.fetch('pokeapi_pokemon_list', expires_in: 1.hour) do
      response = get('/pokemon?limit=100000')
      return nil unless response.success?

      data = response.parsed_response
      data['results'].map do |pokemon|
        # Extract actual ID from URL (e.g., "https://pokeapi.co/api/v2/pokemon/10001/" -> 10001)
        actual_id = pokemon['url'].split('/').reject(&:empty?).last.to_i

        # Use regular sprite for normal Pokemon (faster), official artwork for alternate forms (10000+)
        image = if actual_id < 10000
                  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/#{actual_id}.png"
                else
                  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/#{actual_id}.png"
                end

        {
          id: actual_id,
          name: pokemon['name'],
          number: actual_id,
          image: image
        }
      end
    end
  rescue StandardError => e
    Rails.logger.error "PokeAPI fetch_all_pokemons_cached error: #{e.message}"
    nil
  end

  def self.fetch_pokemon(id)
    response = get("/pokemon/#{id}")
    return nil unless response.success?

    data = response.parsed_response

    # Get official artwork or fallback to front_default
    image = data.dig('sprites', 'other', 'official-artwork', 'front_default') ||
            data.dig('sprites', 'front_default')

    # Extract stats
    stats_data = data['stats'].each_with_object({}) do |stat, hash|
      stat_name = stat['stat']['name']
      stat_value = stat['base_stat']
      case stat_name
      when 'hp' then hash[:hp] = stat_value
      when 'attack' then hash[:atk] = stat_value
      when 'defense' then hash[:def] = stat_value
      when 'special-attack' then hash[:satk] = stat_value
      when 'special-defense' then hash[:sdef] = stat_value
      when 'speed' then hash[:spd] = stat_value
      end
    end

    # Fetch description from species endpoint
    description = fetch_pokemon_description(id)

    {
      id: data['id'],
      name: data['name'],
      number: data['id'],
      image: image,
      types: data['types'].sort_by { |t| t['slot'] }.map { |t| t['type']['name'] },
      weight: data['weight'] / 10.0,
      height: data['height'] / 10.0,
      abilities: data['abilities'].map { |a| a['ability']['name'] },
      moves: data['moves'].first(2).map { |m| m['move']['name'] },
      stats: stats_data,
      description: description
    }
  rescue StandardError => e
    Rails.logger.error "PokeAPI fetch_pokemon error: #{e.message}"
    nil
  end

  def self.fetch_pokemon_description(id)
    response = get("/pokemon-species/#{id}")
    return '' unless response.success?

    data = response.parsed_response

    # Find English flavor text entry (prefer recent games)
    flavor_entry = data['flavor_text_entries'].find { |entry| entry['language']['name'] == 'en' }
    return '' unless flavor_entry

    # Clean up the text (remove line breaks and extra spaces)
    flavor_entry['flavor_text'].gsub(/[\n\f\r]/, ' ').gsub(/\s+/, ' ').strip
  rescue StandardError => e
    Rails.logger.error "PokeAPI fetch_pokemon_description error: #{e.message}"
    ''
  end
end
