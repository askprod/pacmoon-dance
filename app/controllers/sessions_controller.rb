class SessionsController < ApplicationController
  def create
    auth = request.env['omniauth.auth']
    puts auth.inspect
    user = User.find_or_create_by(uid: auth['uid']) do |u|
      u.name = auth['info']['nickname']
      u.image_url = auth['extra']['raw_info']['profile_image_url_https']
    end

    session[:user_id] = user.id
    redirect_to root_path, notice: 'Logged in successfully!'
  end

  def destroy
    session[:user_id] = nil
    redirect_to root_path, notice: 'Logged out successfully!'
  end
end