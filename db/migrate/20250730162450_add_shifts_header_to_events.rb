class AddShiftsHeaderToEvents < ActiveRecord::Migration[8.0]
  def change
    add_column :events, :shifts_header, :string, default: "Verfügbare Dienste"
    add_column :events, :shifts_subtext, :text, default: "Bitte wähle eine Schicht aus, für die Du dich als freiwilliger Helfer anmelden möchtest."
  end
end
