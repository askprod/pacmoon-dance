class ApplicationController < ActionController::Base
  helper_method :current_connected?, :current_user

  def current_connected?
    session[:user_id].present? && User.exists?(id: session[:user_id])
  end

  def current_user
    @current_user = User.find_by(id: session[:user_id])
  end
end
