class AddStartAndEndDateToEvents < ActiveRecord::Migration[7.2]
  def change
    add_column :events, :start_date, :date
    add_column :events, :end_date, :date

    # Migrate existing data: use date part of existing date field for both start_date and end_date
    reversible do |dir|
      dir.up do
        Event.reset_column_information
        Event.find_each do |event|
          if event.date.present?
            date_only = event.date.to_date
            event.update_columns(
              start_date: date_only,
              end_date: date_only
            )
          end
        end
      end
    end
  end
end
