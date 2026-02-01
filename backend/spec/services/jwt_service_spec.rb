require 'rails_helper'

RSpec.describe JwtService do
  describe '.encode' do
    it 'encodes a payload into a JWT token' do
      payload = { username: 'admin' }
      token = described_class.encode(payload)
      
      expect(token).to be_a(String)
      expect(token.split('.').length).to eq(3) # JWT has 3 parts
    end

    it 'includes expiration time in the token' do
      payload = { username: 'admin' }
      token = described_class.encode(payload)
      
      decoded = JWT.decode(token, Rails.application.secret_key_base)[0]
      expect(decoded['exp']).to be_present
    end

    it 'allows custom expiration time' do
      payload = { username: 'admin' }
      custom_exp = 1.hour.from_now
      token = described_class.encode(payload, custom_exp)
      
      decoded = JWT.decode(token, Rails.application.secret_key_base)[0]
      expect(decoded['exp']).to eq(custom_exp.to_i)
    end
  end

  describe '.decode' do
    it 'decodes a valid JWT token' do
      payload = { username: 'admin' }
      token = described_class.encode(payload)
      
      decoded = described_class.decode(token)
      
      expect(decoded[:username]).to eq('admin')
    end

    it 'returns nil for an invalid token' do
      result = described_class.decode('invalid.token.here')
      
      expect(result).to be_nil
    end

    it 'returns nil for an expired token' do
      payload = { username: 'admin' }
      token = described_class.encode(payload, 1.second.ago)
      
      result = described_class.decode(token)
      
      expect(result).to be_nil
    end

    it 'returns nil for a tampered token' do
      payload = { username: 'admin' }
      token = described_class.encode(payload)
      
      # Tamper with the token
      tampered_token = token[0..-2] + 'X'
      
      result = described_class.decode(tampered_token)
      
      expect(result).to be_nil
    end

    it 'returns a HashWithIndifferentAccess' do
      payload = { username: 'admin' }
      token = described_class.encode(payload)
      
      decoded = described_class.decode(token)
      
      expect(decoded).to be_a(HashWithIndifferentAccess)
      expect(decoded['username']).to eq(decoded[:username])
    end
  end
end
