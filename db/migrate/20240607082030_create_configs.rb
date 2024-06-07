class CreateConfigs < ActiveRecord::Migration[7.1]
  def change
    create_table :configs do |t|
      t.boolean :enable_custom_participants

      t.timestamps
    end
  end
end
