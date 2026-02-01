class AuthController < ApplicationController
  def login
    username = params[:username]
    password = params[:password]

    if username == 'admin' && password == 'admin'
      token = JwtService.encode({ username: username })
      render json: { token: token, user: { username: username } }, status: :ok
    else
      render json: { error: 'Invalid credentials' }, status: :unauthorized
    end
  end
end
