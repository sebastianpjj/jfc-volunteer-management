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
    column "Event" do |shift|
      link_to shift.event.name, admin_event_path(shift.event)
    end
    column :name
    column :group_name
    column "Time Range" do |shift|
      shift.time_range
    end
    column "Duration" do |shift|
      "#{shift.duration_in_hours}h"
    end
    column "Registrations", sortable: false do |shift|
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
    column "Deletion Status", sortable: false do |shift|
      if shift.can_be_deleted?
        "Can be deleted"
      else
        "Protected"
      end
    end
    actions do |shift|
      if shift.can_be_deleted?
        item "Delete", admin_shift_path(shift), method: :delete,
             confirm: "Are you sure you want to delete this shift?",
             class: "member_link delete_link"
      else
        item "Cannot Delete", "#", class: "member_link disabled",
             title: shift.deletion_blocked_message
      end
    end
  end

  show do
    attributes_table do
      row "Event" do |shift|
        link_to shift.event.name, admin_event_path(shift.event)
      end
      row :name
      row :group_name
      row "Start Date/Time" do |shift|
        shift.start_date.strftime("%B %d, %Y at %I:%M %p")
      end
      row "End Date/Time" do |shift|
        shift.end_date.strftime("%B %d, %Y at %I:%M %p")
      end
      row "Duration" do |shift|
        "#{shift.duration_in_hours} hours"
      end
      row "Time Range" do |shift|
        shift.time_range
      end
      row "Registration Count" do |shift|
        "#{shift.spots_taken} / #{shift.max_volunteers} volunteers"
      end
      row "Capacity Status" do |shift|
        if shift.full?
          "FULL - No more registrations possible"
        else
          "#{shift.spots_remaining} spots remaining"
        end
      end
      row "Deletion Status" do |shift|
        if shift.can_be_deleted?
          "This shift can be deleted"
        else
          shift.deletion_blocked_message
        end
      end
    end

    panel "Registrations" do
      if shift.registrations.any?
        table_for shift.registrations do
          column "Volunteer Name" do |registration|
            registration.name
          end
          column :email
          column :phone
          column "Registered At" do |registration|
            registration.created_at.strftime("%B %d, %Y at %I:%M %p")
          end
          column "Actions" do |registration|
            link_to "View", admin_registration_path(registration), class: "member_link"
          end
        end
      else
        div "No registrations for this shift."
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
