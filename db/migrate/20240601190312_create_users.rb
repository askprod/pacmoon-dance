class CreateUsers < ActiveRecord::Migration[7.1]
  def change
    create_table :users do |t|
      t.string :uid
      t.string :name
      t.string :image_url
      t.integer :color
      t.timestamps
    end
  end
end
