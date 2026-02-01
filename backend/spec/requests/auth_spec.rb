require 'rails_helper'

RSpec.describe "Auth", type: :request do
  describe "POST /login" do
    context "with valid credentials" do
      it "returns a token" do
        post '/login', params: { username: 'admin', password: 'admin' }
        
        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['token']).to be_present
        expect(json['user']['username']).to eq('admin')
      end

      it "returns a valid JWT token" do
        post '/login', params: { username: 'admin', password: 'admin' }
        
        json = JSON.parse(response.body)
        decoded = JwtService.decode(json['token'])
        
        expect(decoded[:username]).to eq('admin')
      end

      it "includes the username in the response" do
        post '/login', params: { username: 'admin', password: 'admin' }
        
        json = JSON.parse(response.body)
        expect(json['user']).to be_a(Hash)
        expect(json['user']['username']).to eq('admin')
      end
    end

    context "with invalid credentials" do
      it "returns an error for wrong username" do
        post '/login', params: { username: 'wrong', password: 'admin' }
        
        expect(response).to have_http_status(:unauthorized)
        json = JSON.parse(response.body)
        expect(json['error']).to eq('Invalid credentials')
      end

      it "returns an error for wrong password" do
        post '/login', params: { username: 'admin', password: 'wrong' }
        
        expect(response).to have_http_status(:unauthorized)
        json = JSON.parse(response.body)
        expect(json['error']).to eq('Invalid credentials')
      end

      it "returns an error for both wrong credentials" do
        post '/login', params: { username: 'wrong', password: 'wrong' }
        
        expect(response).to have_http_status(:unauthorized)
        json = JSON.parse(response.body)
        expect(json['error']).to eq('Invalid credentials')
      end
    end

    context "with missing parameters" do
      it "returns an error when username is missing" do
        post '/login', params: { password: 'admin' }
        
        expect(response).to have_http_status(:unauthorized)
      end

      it "returns an error when password is missing" do
        post '/login', params: { username: 'admin' }
        
        expect(response).to have_http_status(:unauthorized)
      end

      it "returns an error when both are missing" do
        post '/login', params: {}
        
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "with empty credentials" do
      it "returns an error for empty username" do
        post '/login', params: { username: '', password: 'admin' }
        
        expect(response).to have_http_status(:unauthorized)
      end

      it "returns an error for empty password" do
        post '/login', params: { username: 'admin', password: '' }
        
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
