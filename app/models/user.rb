class User < ApplicationRecord

  before_save do
    self.color = :white if self.color.nil?

    if self.image_url.present? && self.image_url.ends_with?("_normal.jpg")
      self.image_url = self.image_url.sub("_normal", "_400x400")
    end
  end

  enum color: {
    red:      1,
    green:    2,
    blue:     3,
    yellow:   4,
    cyan:     5,
    magenta:  6,
    white:    7,
    black:    8,
    pink:     9
  }

  def self.colors_mapping
    {
      red: 'rgba(255, 0, 0, 1)',
      green: 'rgba(0, 255, 0, 1)',
      blue: 'rgba(0, 0, 255, 1)',
      yellow: 'rgba(255, 255, 0, 1)',
      cyan: 'rgba(0, 255, 255, 1)',
      magenta: 'rgba(255, 0, 255, 1)',
      white: 'rgba(255, 255, 255, 1)',
      black: 'rgba(0, 0, 0, 1)',
      pink: 'rgba(227, 61, 148, 1)'
    }
  end

  def color_rgb
    colors_mapping[self.color]
  end

end
