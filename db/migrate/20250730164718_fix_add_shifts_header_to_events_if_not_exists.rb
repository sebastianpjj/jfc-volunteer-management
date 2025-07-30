class FixAddShiftsHeaderToEventsIfNotExists < ActiveRecord::Migration[8.0]
  def change
    unless column_exists?(:events, :shifts_header)
      add_column :events, :shifts_header, :string, default: "Verfügbare Schichten"
    end
    
    unless column_exists?(:events, :shifts_subtext)
      add_column :events, :shifts_subtext, :text, default: "Bitte wählen Sie eine Schicht aus, für die Sie sich als freiwilliger Helfer anmelden möchten."
    end
  end
end
