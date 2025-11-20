ActiveAdmin.register Event do
  permit_params :name, :date, :start_date, :end_date, :shifts_header, :shifts_subtext, :contact_email, :contact_tel, shifts_attributes: [:id, :name, :group_name, :max_volunteers, :start_date, :end_date, :_destroy]

  filter :name
  filter :start_date
  filter :end_date
  filter :date
  filter :created_at
  filter :updated_at

  index do
    selectable_column
    id_column
    column "Name", :name
    column "Datum" do |event|
      event.date_range_compact
    end
    column "Schichten" do |event|
      event.shifts.count
    end
    column "Kapazität" do |event|
      total_spots = event.shifts.sum(:max_volunteers)
      taken_spots = event.registrations.count
      "#{taken_spots} / #{total_spots}"
    end
    actions
  end

  show do
    attributes_table do
      row "Name", :name
      row "Datum" do |event|
        event.date_range_detailed
      end
      row "Schichten-Überschrift", :shifts_header
      row "Schichten-Untertitel", :shifts_subtext
      row "Kapazitätsübersicht" do |event|
        capacity = event.total_capacity
        taken = event.capacity_taken
        remaining = event.capacity_remaining
        percentage = event.capacity_percentage

        div do
          div "Gesamtkapazität: #{capacity} Helfer"
          div "Angemeldet: #{taken} Helfer (#{percentage}%)"
          div "Verfügbar: #{remaining} Plätze"

          status_text = if percentage > 80
            "Fast voll"
          elsif percentage > 50
            "Halb voll"
          elsif taken > 0
            "Einige Anmeldungen"
          else
            "Keine Anmeldungen"
          end
          div "Status: #{status_text}"
        end
      end
      row "Gesamte Anmeldungen" do |event|
        count = event.registrations.count
        if count > 0
          "#{count} Anmeldungen insgesamt"
        else
          "Keine Anmeldungen"
        end
      end
    end

    panel "Schichten" do
      table_for event.shifts do
        column "Name", :name
        column "Gruppe", :group_name
        column "Tag" do |shift|
          I18n.l(shift.start_date, format: :short_with_weekday)
        end
        column "Zeitbereich" do |shift|
          shift.time_range
        end
        column "Dauer" do |shift|
          "#{shift.duration_in_hours}h"
        end
        column "Anmeldungen" do |shift|
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
      f.input :contact_email,
              label: "Kontakt E-Mail",
              hint: "E-Mail-Adresse für Rückfragen (Standard: event@eintracht-feldberg.de)"
      f.input :contact_tel,
              label: "Kontakt Telefon",
              hint: "Telefonnummer für Rückfragen (optional)"
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
