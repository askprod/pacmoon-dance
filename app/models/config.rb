class Config < ApplicationRecord

  before_create :ensure_single_config

  def self.main
    Config.first
  end

  private

  def ensure_single_config
    throw(:abort) if Config.exists?
  end

end
