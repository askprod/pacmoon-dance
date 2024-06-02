class UserController < ApplicationController

  before_action :check_current_connected

  def update
    response = { status: 0 }

    if current_user.update(user_params)
      response[:status] = 1
    end

    render json: response
  end

  private

  def check_current_connected
    return unless current_connected?
  end

  def user_params
    params.require(:user).permit(
      :color
    )
  end

end