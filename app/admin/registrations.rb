ActiveAdmin.register Registration do
  permit_params :name, :email, :phone, :shift_id

  index do
    selectable_column
    id_column
    column :name
    column :email
    column :phone
    column "Event" do |registration|
      registration.shift.event.name
    end
    column "Shift" do |registration|
      "#{registration.shift.name} (#{registration.shift.group_name})"
    end
    column "Time" do |registration|
      registration.shift.time_range
    end
    column :created_at
    actions
  end

  show do
    attributes_table do
      row :name
      row :email
      row :phone
      row "Event" do |registration|
        link_to registration.shift.event.name, admin_event_path(registration.shift.event)
      end
      row "Shift" do |registration|
        "#{registration.shift.name} (#{registration.shift.group_name})"
      end
      row "Shift Time Range" do |registration|
        registration.shift.time_range
      end
      row "Shift Duration" do |registration|
        "#{registration.shift.duration_in_hours} hours"
      end
      row :created_at
    end
  end

  form do |f|
    f.inputs "Registration Details" do
      f.input :name
      f.input :email
      f.input :phone
      f.input :shift, collection: Shift.joins(:event).order('events.date DESC, shifts.start_date ASC').map { |s| ["#{s.event.name} - #{s.name} (#{s.group_name}) - #{s.time_range}", s.id] }
    end
    f.actions
  end
end
