class CreateShifts < ActiveRecord::Migration[8.0]
  def change
    create_table :shifts do |t|
      t.string :name
      t.string :group_name
      t.datetime :datetime
      t.references :event, null: false, foreign_key: true

      t.timestamps
    end
  end
end
