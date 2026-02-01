require 'rails_helper'

RSpec.describe "Pokemons", type: :request do
  let(:token) { JwtService.encode({ username: 'admin' }) }
  let(:headers) { { 'Authorization' => "Bearer #{token}" } }

  describe "GET /pokemons" do
    context "with valid token" do
      before do
        stub_request(:get, "https://pokeapi.co/api/v2/pokemon?limit=100000")
          .to_return(
            status: 200,
            body: {
              count: 2,
              results: [
                { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
                { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' }
              ]
            }.to_json,
            headers: { 'Content-Type' => 'application/json' }
          )
      end

      it "returns list of pokemons" do
        get '/pokemons', headers: headers
        
        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['pokemons']).to be_an(Array)
        expect(json['pokemons'].length).to eq(2)
        expect(json['pokemons'].first['name']).to eq('bulbasaur')
      end

      it "returns count of pokemons" do
        get '/pokemons', headers: headers
        
        json = JSON.parse(response.body)
        expect(json['count']).to eq(2)
      end

      it "includes pokemon id and number" do
        get '/pokemons', headers: headers
        
        json = JSON.parse(response.body)
        expect(json['pokemons'].first['id']).to eq(1)
        expect(json['pokemons'].first['number']).to eq(1)
      end

      it "includes pokemon image URL" do
        get '/pokemons', headers: headers
        
        json = JSON.parse(response.body)
        expect(json['pokemons'].first['image']).to include('pokemon/1.png')
      end
    end

    context "when PokeAPI fails" do
      before do
        stub_request(:get, "https://pokeapi.co/api/v2/pokemon?limit=100000")
          .to_return(status: 500)
      end

      it "returns internal server error" do
        get '/pokemons', headers: headers
        
        expect(response).to have_http_status(:internal_server_error)
        json = JSON.parse(response.body)
        expect(json['error']).to eq('Failed to fetch pokemons')
      end
    end

    context "without token" do
      it "returns unauthorized" do
        get '/pokemons'
        
        expect(response).to have_http_status(:unauthorized)
      end

      it "returns error message" do
        get '/pokemons'
        
        json = JSON.parse(response.body)
        expect(json['error']).to be_present
      end
    end

    context "with invalid token" do
      it "returns unauthorized for malformed token" do
        get '/pokemons', headers: { 'Authorization' => 'Bearer invalid.token.here' }
        
        expect(response).to have_http_status(:unauthorized)
      end

      it "returns unauthorized for expired token" do
        expired_token = JwtService.encode({ username: 'admin' }, 1.second.ago)
        get '/pokemons', headers: { 'Authorization' => "Bearer #{expired_token}" }
        
        expect(response).to have_http_status(:unauthorized)
      end

      it "still works when Bearer prefix is missing but token is valid" do
        # The authenticatable module is flexible and accepts token with or without Bearer prefix
        stub_request(:get, "https://pokeapi.co/api/v2/pokemon?limit=100000")
          .to_return(
            status: 200,
            body: { count: 0, results: [] }.to_json,
            headers: { 'Content-Type' => 'application/json' }
          )
        
        get '/pokemons', headers: { 'Authorization' => token }
        
        expect(response).to have_http_status(:ok)
      end
    end
  end

  describe "GET /pokemons/:id" do
    let(:pokemon_response) do
      {
        id: 1,
        name: 'bulbasaur',
        height: 7,
        weight: 69,
        sprites: {
          front_default: 'https://example.com/1.png',
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
        abilities: [{ ability: { name: 'overgrow' } }],
        moves: [{ move: { name: 'tackle' } }],
        stats: [
          { stat: { name: 'hp' }, base_stat: 45 },
          { stat: { name: 'attack' }, base_stat: 49 },
          { stat: { name: 'defense' }, base_stat: 49 },
          { stat: { name: 'special-attack' }, base_stat: 65 },
          { stat: { name: 'special-defense' }, base_stat: 65 },
          { stat: { name: 'speed' }, base_stat: 45 }
        ]
      }
    end

    context "with valid token" do
      before do
        stub_request(:get, "https://pokeapi.co/api/v2/pokemon/1")
          .to_return(
            status: 200,
            body: pokemon_response.to_json,
            headers: { 'Content-Type' => 'application/json' }
          )

        stub_request(:get, "https://pokeapi.co/api/v2/pokemon-species/1")
          .to_return(
            status: 200,
            body: {
              flavor_text_entries: [
                { flavor_text: "A strange seed.", language: { name: 'en' } }
              ]
            }.to_json,
            headers: { 'Content-Type' => 'application/json' }
          )
      end

      it "returns pokemon details" do
        get '/pokemons/1', headers: headers
        
        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['name']).to eq('bulbasaur')
      end

      it "returns pokemon types" do
        get '/pokemons/1', headers: headers
        
        json = JSON.parse(response.body)
        expect(json['types']).to eq(['grass', 'poison'])
      end

      it "returns pokemon abilities" do
        get '/pokemons/1', headers: headers
        
        json = JSON.parse(response.body)
        expect(json['abilities']).to include('overgrow')
      end

      it "returns pokemon stats" do
        get '/pokemons/1', headers: headers
        
        json = JSON.parse(response.body)
        expect(json['stats']).to be_a(Hash)
        expect(json['stats']['hp']).to eq(45)
      end

      it "returns pokemon height in meters" do
        get '/pokemons/1', headers: headers
        
        json = JSON.parse(response.body)
        expect(json['height']).to eq(0.7)
      end

      it "returns pokemon weight in kg" do
        get '/pokemons/1', headers: headers
        
        json = JSON.parse(response.body)
        expect(json['weight']).to eq(6.9)
      end

      it "returns pokemon description" do
        get '/pokemons/1', headers: headers
        
        json = JSON.parse(response.body)
        expect(json['description']).to eq('A strange seed.')
      end
    end

    context "when pokemon not found" do
      before do
        stub_request(:get, "https://pokeapi.co/api/v2/pokemon/9999")
          .to_return(status: 404)
      end

      it "returns not found status" do
        get '/pokemons/9999', headers: headers
        
        expect(response).to have_http_status(:not_found)
        json = JSON.parse(response.body)
        expect(json['error']).to eq('Pokemon not found')
      end
    end

    context "without token" do
      it "returns unauthorized" do
        get '/pokemons/1'
        
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "with invalid token" do
      it "returns unauthorized" do
        get '/pokemons/1', headers: { 'Authorization' => 'Bearer invalid' }
        
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
