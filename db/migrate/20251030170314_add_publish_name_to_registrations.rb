class AddPublishNameToRegistrations < ActiveRecord::Migration[7.2]
  def change
    add_column :registrations, :publish_name, :boolean, default: true, null: false
  end
end