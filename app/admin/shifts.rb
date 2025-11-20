ActiveAdmin.register Shift do
  permit_params :name, :group_name, :start_date, :end_date, :event_id, :max_volunteers

  # Add filters for better admin experience
  filter :event, collection: -> { Event.order(date: :desc).pluck(:name, :id) }
  filter :name
  filter :group_name
  filter :start_date
  filter :end_date

  index do
    selectable_column
    id_column
    column "Veranstaltung" do |shift|
      link_to shift.event.name, admin_event_path(shift.event)
    end
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
    column "Anmeldungen", sortable: false do |shift|
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
    column "Löschstatus", sortable: false do |shift|
      if shift.can_be_deleted?
        "Kann gelöscht werden"
      else
        "Geschützt"
      end
    end
    actions do |shift|
      if shift.can_be_deleted?
        item "Löschen", admin_shift_path(shift), method: :delete,
             confirm: "Sind Sie sicher, dass Sie diese Schicht löschen möchten?",
             class: "member_link delete_link"
      else
        item "Kann nicht löschen", "#", class: "member_link disabled",
             title: shift.deletion_blocked_message
      end
    end
  end

  show do
    attributes_table do
      row "Veranstaltung" do |shift|
        link_to shift.event.name, admin_event_path(shift.event)
      end
      row "Name", :name
      row "Gruppe", :group_name
      row "Startzeit" do |shift|
        shift.start_date.strftime("%d. %B %Y um %H:%M Uhr")
      end
      row "Endzeit" do |shift|
        shift.end_date.strftime("%d. %B %Y um %H:%M Uhr")
      end
      row "Dauer" do |shift|
        "#{shift.duration_in_hours} Stunden"
      end
      row "Zeitbereich" do |shift|
        shift.time_range
      end
      row "Anzahl Anmeldungen" do |shift|
        "#{shift.spots_taken} / #{shift.max_volunteers} Helfer"
      end
      row "Kapazitätsstatus" do |shift|
        if shift.full?
          "VOLL - Keine weiteren Anmeldungen möglich"
        else
          "#{shift.spots_remaining} Plätze verfügbar"
        end
      end
      row "Löschstatus" do |shift|
        if shift.can_be_deleted?
          "Diese Schicht kann gelöscht werden"
        else
          shift.deletion_blocked_message
        end
      end
    end

    panel "Anmeldungen" do
      if shift.registrations.any?
        table_for shift.registrations do
          column "Helfer-Name" do |registration|
            registration.name
          end
          column "E-Mail", :email
          column "Telefon", :phone
          column "Angemeldet am" do |registration|
            registration.created_at.strftime("%d. %B %Y um %H:%M Uhr")
          end
          column "Aktionen" do |registration|
            link_to "Anzeigen", admin_registration_path(registration), class: "member_link"
          end
        end
      else
        div "Keine Anmeldungen für diese Schicht."
      end
    end
  end

  form do |f|
    f.inputs "Shift Details" do
      f.input :event, collection: Event.order(:date), include_blank: false
      f.input :name
      f.input :group_name
      f.input :max_volunteers, label: "Maximum Volunteers", hint: "How many volunteers can register for this shift?"
      f.input :start_date, as: :datetime_picker, label: "Start Date/Time"
      f.input :end_date, as: :datetime_picker, label: "End Date/Time"
    end
    f.actions
  end

  controller do
    def destroy
      if resource.can_be_deleted?
        super
      else
        flash[:error] = resource.deletion_blocked_message
        redirect_to admin_shift_path(resource)
      end
    end
  end
end
