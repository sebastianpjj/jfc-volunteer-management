class AddMaxVolunteersToShifts < ActiveRecord::Migration[8.0]
  def change
    add_column :shifts, :max_volunteers, :integer, null: false, default: 10
  end
end
