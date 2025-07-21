ActiveAdmin.register Event do
  permit_params :name, :date, shifts_attributes: [:id, :name, :group_name, :max_volunteers, :start_date, :end_date, :_destroy]

  index do
    selectable_column
    id_column
    column :name
    column :date
    column "Shifts" do |event|
      event.shifts.count
    end
    column "Capacity" do |event|
      total_spots = event.shifts.sum(:max_volunteers)
      taken_spots = event.registrations.count
      "#{taken_spots} / #{total_spots}"
    end
    column "Total Registrations" do |event|
      count = event.registrations.count
      if count > 0
        status_tag("#{count} registered", :ok)
      else
        status_tag("No registrations", :empty)
      end
    end
    column "Status" do |event|
      if event.can_be_deleted?
        status_tag("Can be deleted", :ok)
      else
        status_tag("Protected - Has registrations", :error)
      end
    end
    actions
  end

  show do
    attributes_table do
      row :name
      row :date
      row "Capacity Overview" do |event|
        capacity = event.total_capacity
        taken = event.capacity_taken
        remaining = event.capacity_remaining
        percentage = event.capacity_percentage

        div do
          div "Total Capacity: #{capacity} volunteers"
          div "Registered: #{taken} volunteers (#{percentage}%)"
          div "Available: #{remaining} spots remaining"

          if percentage > 80
            status_tag("Nearly Full", :error)
          elsif percentage > 50
            status_tag("Half Full", :warning)
          elsif taken > 0
            status_tag("Some Registration", :ok)
          else
            status_tag("No Registrations", :empty)
          end
        end
      end
      row "Total Registrations" do |event|
        count = event.registrations.count
        if count > 0
          status_tag("#{count} total registrations", :ok)
        else
          status_tag("No registrations", :empty)
        end
      end
      row "Deletion Status" do |event|
        if event.can_be_deleted?
          status_tag("Event can be deleted", :ok)
        else
          status_tag("Event is protected from deletion", :error)
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
              status_tag("#{count}/#{max} (FULL)", :error)
            else
              status_tag("#{count}/#{max} registered", :ok)
            end
          else
            status_tag("0/#{max} (empty)", :empty)
          end
        end
        column "Status" do |shift|
          if shift.can_be_deleted?
            status_tag("Can be deleted", :ok)
          else
            status_tag("Protected - Has registrations", :error)
          end
        end
      end
    end
  end

  form do |f|
    f.inputs "Event Details" do
      f.input :name
      f.input :date, as: :datetime_picker
    end

    f.inputs "Shifts" do
      f.has_many :shifts, allow_destroy: true, new_record: true do |s|
        s.input :name
        s.input :group_name
        s.input :max_volunteers, label: "Maximum Volunteers", hint: "How many volunteers can register for this shift?"
        s.input :start_date, as: :datetime_picker, label: "Start Date/Time"
        s.input :end_date, as: :datetime_picker, label: "End Date/Time"

        # Show warning for shifts that can't be deleted
        if s.object.persisted? && !s.object.can_be_deleted?
          div class: "alert alert-warning", style: "margin: 10px 0; padding: 10px; background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px;" do
            strong "⚠️ Warning: "
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
