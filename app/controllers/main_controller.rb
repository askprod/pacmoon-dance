class MainController < ApplicationController

  def index
    @gpt_phrase = get_random_gpt_phrase
  end

  private

  def get_random_gpt_phrase
    file_path = Rails.root.join('public', 'prompts.txt')
    file_content = File.read(file_path)
    lines = file_content.split("\n")
    random_line = lines.sample
    puts random_line
    random_line
  end

end

