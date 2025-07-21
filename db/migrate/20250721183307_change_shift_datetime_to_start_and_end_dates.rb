class ChangeShiftDatetimeToStartAndEndDates < ActiveRecord::Migration[8.0]
  def up
    # Add the new columns first (nullable)
    add_column :shifts, :start_date, :datetime
    add_column :shifts, :end_date, :datetime
    
    # Migrate existing data: use datetime as start_date, and add 2 hours for end_date
    execute <<-SQL
      UPDATE shifts 
      SET start_date = datetime, 
          end_date = datetime(datetime, '+2 hours')
      WHERE datetime IS NOT NULL
    SQL
    
    # Remove the old datetime column
    remove_column :shifts, :datetime
    
    # Now make the new columns not null
    change_column_null :shifts, :start_date, false
    change_column_null :shifts, :end_date, false
    
    # Add indexes for better query performance
    add_index :shifts, :start_date
    add_index :shifts, :end_date
  end
  
  def down
    # Add back the datetime column
    add_column :shifts, :datetime, :datetime
    
    # Migrate data back (use start_date as datetime)
    execute <<-SQL
      UPDATE shifts 
      SET datetime = start_date
      WHERE start_date IS NOT NULL
    SQL
    
    # Remove the new columns
    remove_column :shifts, :start_date
    remove_column :shifts, :end_date
    
    # Make datetime not null
    change_column_null :shifts, :datetime, false
  end
end
