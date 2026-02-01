require 'rails_helper'

RSpec.describe PokeapiService do
  describe '.fetch_pokemons' do
    context 'when API responds successfully' do
      before do
        stub_request(:get, "https://pokeapi.co/api/v2/pokemon?limit=100000")
          .to_return(
            status: 200,
            body: {
              count: 3,
              results: [
                { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
                { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
                { name: 'venusaur', url: 'https://pokeapi.co/api/v2/pokemon/3/' }
              ]
            }.to_json,
            headers: { 'Content-Type' => 'application/json' }
          )
      end

      it 'returns a hash with pokemons and count' do
        result = described_class.fetch_pokemons
        
        expect(result).to be_a(Hash)
        expect(result[:pokemons]).to be_an(Array)
        expect(result[:count]).to eq(3)
      end

      it 'maps pokemon data correctly' do
        result = described_class.fetch_pokemons
        pokemon = result[:pokemons].first
        
        expect(pokemon[:id]).to eq(1)
        expect(pokemon[:name]).to eq('bulbasaur')
        expect(pokemon[:number]).to eq(1)
        expect(pokemon[:image]).to include('sprites/pokemon/1.png')
      end

      it 'extracts ID from URL correctly' do
        result = described_class.fetch_pokemons
        
        expect(result[:pokemons][0][:id]).to eq(1)
        expect(result[:pokemons][1][:id]).to eq(2)
        expect(result[:pokemons][2][:id]).to eq(3)
      end
    end

    context 'when API responds with alternate forms (ID > 10000)' do
      before do
        stub_request(:get, "https://pokeapi.co/api/v2/pokemon?limit=100000")
          .to_return(
            status: 200,
            body: {
              count: 1,
              results: [
                { name: 'pikachu-original-cap', url: 'https://pokeapi.co/api/v2/pokemon/10094/' }
              ]
            }.to_json,
            headers: { 'Content-Type' => 'application/json' }
          )
      end

      it 'uses official artwork URL for alternate forms' do
        result = described_class.fetch_pokemons
        pokemon = result[:pokemons].first
        
        expect(pokemon[:image]).to include('official-artwork')
      end
    end

    context 'when API request fails' do
      before do
        stub_request(:get, "https://pokeapi.co/api/v2/pokemon?limit=100000")
          .to_return(status: 500)
      end

      it 'returns nil' do
        result = described_class.fetch_pokemons
        
        expect(result).to be_nil
      end
    end

    context 'when network error occurs' do
      before do
        stub_request(:get, "https://pokeapi.co/api/v2/pokemon?limit=100000")
          .to_raise(StandardError.new('Connection refused'))
      end

      it 'returns nil' do
        result = described_class.fetch_pokemons
        
        expect(result).to be_nil
      end
    end
  end

  describe '.fetch_pokemon' do
    context 'when API responds successfully' do
      before do
        stub_request(:get, "https://pokeapi.co/api/v2/pokemon/1")
          .to_return(
            status: 200,
            body: {
              id: 1,
              name: 'bulbasaur',
              height: 7,
              weight: 69,
              sprites: {
                front_default: 'https://example.com/sprite.png',
                other: {
                  'official-artwork': {
                    front_default: 'https://example.com/artwork.png'
                  }
                }
              },
              types: [
                { slot: 1, type: { name: 'grass' } },
                { slot: 2, type: { name: 'poison' } }
              ],
              abilities: [
                { ability: { name: 'overgrow' } },
                { ability: { name: 'chlorophyll' } }
              ],
              moves: [
                { move: { name: 'tackle' } },
                { move: { name: 'growl' } },
                { move: { name: 'vine-whip' } }
              ],
              stats: [
                { stat: { name: 'hp' }, base_stat: 45 },
                { stat: { name: 'attack' }, base_stat: 49 },
                { stat: { name: 'defense' }, base_stat: 49 },
                { stat: { name: 'special-attack' }, base_stat: 65 },
                { stat: { name: 'special-defense' }, base_stat: 65 },
                { stat: { name: 'speed' }, base_stat: 45 }
              ]
            }.to_json,
            headers: { 'Content-Type' => 'application/json' }
          )

        stub_request(:get, "https://pokeapi.co/api/v2/pokemon-species/1")
          .to_return(
            status: 200,
            body: {
              flavor_text_entries: [
                { flavor_text: "A strange seed was\nplanted on its\nback at birth.", language: { name: 'en' } }
              ]
            }.to_json,
            headers: { 'Content-Type' => 'application/json' }
          )
      end

      it 'returns pokemon details' do
        result = described_class.fetch_pokemon(1)
        
        expect(result[:id]).to eq(1)
        expect(result[:name]).to eq('bulbasaur')
        expect(result[:number]).to eq(1)
      end

      it 'converts height and weight correctly' do
        result = described_class.fetch_pokemon(1)
        
        expect(result[:height]).to eq(0.7)
        expect(result[:weight]).to eq(6.9)
      end

      it 'prefers official artwork over default sprite' do
        result = described_class.fetch_pokemon(1)
        
        expect(result[:image]).to eq('https://example.com/artwork.png')
      end

      it 'extracts types sorted by slot' do
        result = described_class.fetch_pokemon(1)
        
        expect(result[:types]).to eq(['grass', 'poison'])
      end

      it 'extracts abilities' do
        result = described_class.fetch_pokemon(1)
        
        expect(result[:abilities]).to eq(['overgrow', 'chlorophyll'])
      end

      it 'limits moves to first 2' do
        result = described_class.fetch_pokemon(1)
        
        expect(result[:moves]).to eq(['tackle', 'growl'])
        expect(result[:moves].length).to eq(2)
      end

      it 'extracts stats correctly' do
        result = described_class.fetch_pokemon(1)
        
        expect(result[:stats][:hp]).to eq(45)
        expect(result[:stats][:atk]).to eq(49)
        expect(result[:stats][:def]).to eq(49)
        expect(result[:stats][:satk]).to eq(65)
        expect(result[:stats][:sdef]).to eq(65)
        expect(result[:stats][:spd]).to eq(45)
      end

      it 'fetches and cleans description' do
        result = described_class.fetch_pokemon(1)
        
        expect(result[:description]).to eq('A strange seed was planted on its back at birth.')
      end
    end

    context 'when official artwork is not available' do
      before do
        stub_request(:get, "https://pokeapi.co/api/v2/pokemon/1")
          .to_return(
            status: 200,
            body: {
              id: 1,
              name: 'bulbasaur',
              height: 7,
              weight: 69,
              sprites: {
                front_default: 'https://example.com/sprite.png',
                other: {
                  'official-artwork': {
                    front_default: nil
                  }
                }
              },
              types: [],
              abilities: [],
              moves: [],
              stats: []
            }.to_json,
            headers: { 'Content-Type' => 'application/json' }
          )

        stub_request(:get, "https://pokeapi.co/api/v2/pokemon-species/1")
          .to_return(status: 404)
      end

      it 'falls back to default sprite' do
        result = described_class.fetch_pokemon(1)
        
        expect(result[:image]).to eq('https://example.com/sprite.png')
      end
    end

    context 'when API request fails' do
      before do
        stub_request(:get, "https://pokeapi.co/api/v2/pokemon/999")
          .to_return(status: 404)
      end

      it 'returns nil' do
        result = described_class.fetch_pokemon(999)
        
        expect(result).to be_nil
      end
    end

    context 'when network error occurs' do
      before do
        stub_request(:get, "https://pokeapi.co/api/v2/pokemon/1")
          .to_raise(StandardError.new('Connection refused'))
      end

      it 'returns nil' do
        result = described_class.fetch_pokemon(1)
        
        expect(result).to be_nil
      end
    end
  end

  describe '.fetch_pokemon_description' do
    context 'when species API responds successfully' do
      before do
        stub_request(:get, "https://pokeapi.co/api/v2/pokemon-species/1")
          .to_return(
            status: 200,
            body: {
              flavor_text_entries: [
                { flavor_text: "Japanese text", language: { name: 'ja' } },
                { flavor_text: "English\ndescription\fhere.", language: { name: 'en' } }
              ]
            }.to_json,
            headers: { 'Content-Type' => 'application/json' }
          )
      end

      it 'returns English flavor text' do
        result = described_class.fetch_pokemon_description(1)
        
        expect(result).to eq('English description here.')
      end

      it 'cleans up line breaks and extra spaces' do
        result = described_class.fetch_pokemon_description(1)
        
        expect(result).not_to include("\n")
        expect(result).not_to include("\f")
        expect(result).not_to include("  ")
      end
    end

    context 'when no English entry exists' do
      before do
        stub_request(:get, "https://pokeapi.co/api/v2/pokemon-species/1")
          .to_return(
            status: 200,
            body: {
              flavor_text_entries: [
                { flavor_text: "Japanese text", language: { name: 'ja' } }
              ]
            }.to_json,
            headers: { 'Content-Type' => 'application/json' }
          )
      end

      it 'returns empty string' do
        result = described_class.fetch_pokemon_description(1)
        
        expect(result).to eq('')
      end
    end

    context 'when API request fails' do
      before do
        stub_request(:get, "https://pokeapi.co/api/v2/pokemon-species/999")
          .to_return(status: 404)
      end

      it 'returns empty string' do
        result = described_class.fetch_pokemon_description(999)
        
        expect(result).to eq('')
      end
    end
  end
end
