class FixAddShiftsHeaderToEventsIfNotExists < ActiveRecord::Migration[8.0]
  def change
    unless column_exists?(:events, :shifts_header)
      add_column :events, :shifts_header, :string, default: "Verfügbare Dienste"
    end

    unless column_exists?(:events, :shifts_subtext)
      add_column :events, :shifts_subtext, :text
    end
  end
end
