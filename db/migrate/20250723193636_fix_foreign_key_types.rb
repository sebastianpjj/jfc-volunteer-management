class FixForeignKeyTypes < ActiveRecord::Migration[8.0]
  def up
    # Remove existing foreign keys
    remove_foreign_key :registrations, :shifts if foreign_key_exists?(:registrations, :shifts)
    remove_foreign_key :shifts, :events if foreign_key_exists?(:shifts, :events)
    
    # Change foreign key columns to bigint to match primary keys
    change_column :registrations, :shift_id, :bigint
    change_column :shifts, :event_id, :bigint
    
    # Re-add foreign keys
    add_foreign_key :registrations, :shifts
    add_foreign_key :shifts, :events
  end

  def down
    # Remove foreign keys
    remove_foreign_key :registrations, :shifts if foreign_key_exists?(:registrations, :shifts)
    remove_foreign_key :shifts, :events if foreign_key_exists?(:shifts, :events)
    
    # Change back to integer (for rollback)
    change_column :registrations, :shift_id, :integer
    change_column :shifts, :event_id, :integer
    
    # Re-add foreign keys
    add_foreign_key :registrations, :shifts
    add_foreign_key :shifts, :events
  end
end
