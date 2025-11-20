ActiveAdmin.register Event do
  permit_params :name, :date, :start_date, :end_date, :shifts_header, :shifts_subtext, shifts_attributes: [:id, :name, :group_name, :max_volunteers, :start_date, :end_date, :_destroy]

  filter :name
  filter :start_date
  filter :end_date
  filter :date
  filter :created_at
  filter :updated_at

  index do
    selectable_column
    id_column
    column :name
    column "Datum" do |event|
      event.date_range_compact
    end
    column "Shifts" do |event|
      event.shifts.count
    end
    column "Capacity" do |event|
      total_spots = event.shifts.sum(:max_volunteers)
      taken_spots = event.registrations.count
      "#{taken_spots} / #{total_spots}"
    end
    actions
  end

  show do
    attributes_table do
      row :name
      row "Datum" do |event|
        event.date_range_detailed
      end
      row :shifts_header, label: "Shifts Section Header"
      row :shifts_subtext, label: "Shifts Section Subtext"
      row "Capacity Overview" do |event|
        capacity = event.total_capacity
        taken = event.capacity_taken
        remaining = event.capacity_remaining
        percentage = event.capacity_percentage

        div do
          div "Total Capacity: #{capacity} volunteers"
          div "Registered: #{taken} volunteers (#{percentage}%)"
          div "Available: #{remaining} spots remaining"

          status_text = if percentage > 80
            "Nearly Full"
          elsif percentage > 50
            "Half Full"
          elsif taken > 0
            "Some Registration"
          else
            "No Registrations"
          end
          div "Status: #{status_text}"
        end
      end
      row "Total Registrations" do |event|
        count = event.registrations.count
        if count > 0
          "#{count} total registrations"
        else
          "No registrations"
        end
      end
    end

    panel "Shifts" do
      table_for event.shifts do
        column :name
        column :group_name
        column "Time Range" do |shift|
          shift.time_range
        end
        column "Duration" do |shift|
          "#{shift.duration_in_hours}h"
        end
        column "Registrations" do |shift|
          count = shift.registrations.count
          max = shift.max_volunteers
          if count > 0
            if shift.full?
              "#{count}/#{max} (FULL)"
            else
              "#{count}/#{max} registered"
            end
          else
            "0/#{max} (empty)"
          end
        end
      end
    end
  end

  form do |f|
    f.inputs "Veranstaltungsdetails" do
      f.input :name, label: "Name"
      f.input :start_date,
              label: "Startdatum",
              input_html: {
                type: 'date',
                value: f.object.start_date&.strftime('%Y-%m-%d')
              },
              hint: "Erstes Datum der Veranstaltung"
      f.input :end_date,
              label: "Enddatum",
              input_html: {
                type: 'date',
                value: f.object.end_date&.strftime('%Y-%m-%d')
              },
              hint: "Letztes Datum der Veranstaltung"
    end

    f.inputs "Schichten-Bereich Anpassung" do
      f.input :shifts_header,
              label: "Schichten-Überschrift",
              hint: "Die Hauptüberschrift für den Schichten-Bereich (Standard: 'Verfügbare Schichten')"
      f.input :shifts_subtext,
              as: :text,
              label: "Schichten-Untertitel",
              hint: "Erklärungstext unter der Überschrift zur Anleitung der Helfer"
    end

    f.inputs "Schichten" do
      f.has_many :shifts, allow_destroy: true, new_record: true do |s|
        s.input :name, label: "Schichtname"
        s.input :group_name, label: "Gruppenname", hint: "Gruppierung für die Anzeige (z.B. 'Aufbau', 'Verkauf', 'Abbau')"
        s.input :max_volunteers, label: "Max. Helfer", hint: "Wie viele Freiwillige können sich für diese Schicht anmelden?"
        s.input :start_date, as: :datetime_picker,
                label: "Startzeit",
                input_html: {
                  value: s.object.start_date&.in_time_zone("Berlin")&.strftime("%Y-%m-%dT%H:%M"),
                  step: 900  # 15 minute intervals
                },
                hint: "Startzeit in lokaler Zeit (Berlin)"
        s.input :end_date, as: :datetime_picker,
                label: "Endzeit",
                input_html: {
                  value: s.object.end_date&.in_time_zone("Berlin")&.strftime("%Y-%m-%dT%H:%M"),
                  step: 900  # 15 minute intervals
                },
                hint: "Endzeit in lokaler Zeit (Berlin)"

        # Show warning for shifts that can't be deleted
        if s.object.persisted? && !s.object.can_be_deleted?
          div class: "alert alert-warning", style: "margin: 10px 0; padding: 10px; background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px;" do
            strong "⚠️ Warnung: "
            span s.object.deletion_blocked_message
          end
        end
      end
    end

    f.actions
  end

  # Override the update action to handle shift deletion attempts
  controller do
    def update
      super do |format|
        if resource.errors.any?
          # Check if there are any shift deletion errors
          shift_errors = resource.shifts.flat_map { |shift| shift.errors.full_messages }.compact
          if shift_errors.any?
            flash[:error] = shift_errors.join(', ')
          end
        end
      end
    end

    def destroy
      super do |format|
        if resource.errors.any?
          flash[:error] = resource.errors.full_messages.join(', ')
          format.html { redirect_to admin_events_path }
          return
        end
      end
    end
  end
end
