module Authenticatable
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_request
  end

  private

  def authenticate_request
    header = request.headers['Authorization']
    header = header.split(' ').last if header
    
    decoded = JwtService.decode(header)
    
    unless decoded
      render json: { error: 'Unauthorized' }, status: :unauthorized
    end
  end
end
