class CreateRegistrations < ActiveRecord::Migration[8.0]
  def change
    create_table :registrations do |t|
      t.string :name
      t.string :email
      t.string :phone
      t.references :shift, null: false, foreign_key: true

      t.timestamps
    end
  end
end
