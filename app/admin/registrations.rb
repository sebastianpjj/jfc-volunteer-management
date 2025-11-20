ActiveAdmin.register Registration do
  permit_params :name, :email, :phone, :shift_id

  # Add filters for better admin experience
  # Custom filter for events - using a different approach
  filter :shift_event_id, as: :select, collection: -> { Event.order(date: :desc).pluck(:name, :id) }, label: 'Veranstaltung'
  filter :name
  filter :email
  filter :phone
  filter :shift, collection: -> { Shift.joins(:event).order('events.date DESC, shifts.start_date ASC').map { |s| ["#{s.event.name} - #{s.name} (#{s.group_name})", s.id] } }, label: 'Schicht'
  filter :created_at


  index do
    selectable_column
    id_column
    column "Name", :name
    column "E-Mail", :email
    column "Telefon", :phone
    column "Veranstaltung" do |registration|
      registration.shift.event.name
    end
    column "Schicht" do |registration|
      "#{registration.shift.name} (#{registration.shift.group_name})"
    end
    column "Zeit" do |registration|
      registration.shift.time_range
    end
    column "Erstellt am", :created_at
    actions
  end

  show do
    attributes_table do
      row "Name", :name
      row "E-Mail", :email
      row "Telefon", :phone
      row "Veranstaltung" do |registration|
        link_to registration.shift.event.name, admin_event_path(registration.shift.event)
      end
      row "Schicht" do |registration|
        "#{registration.shift.name} (#{registration.shift.group_name})"
      end
      row "Schicht Zeitbereich" do |registration|
        registration.shift.time_range
      end
      row "Schicht Dauer" do |registration|
        "#{registration.shift.duration_in_hours} Stunden"
      end
      row "Erstellt am", :created_at
    end
  end

  form do |f|
    f.inputs "Anmeldungsdetails" do
      f.input :name, label: "Name"
      f.input :email, label: "E-Mail"
      f.input :phone, label: "Telefon"
      f.input :shift, label: "Schicht", collection: Shift.joins(:event).order('events.date DESC, shifts.start_date ASC').map { |s| ["#{s.event.name} - #{s.name} (#{s.group_name}) - #{s.time_range}", s.id] }
    end
    f.actions
  end
end
