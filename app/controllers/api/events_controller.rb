class Api::EventsController < ApplicationController
  skip_before_action :verify_authenticity_token

  def index
    @events = Event.includes(:shifts).order(start_date: :desc)
    render json: @events.as_json(
      methods: :spots_remaining,
      only: [:id, :name, :start_date, :end_date, :shifts_header, :shifts_subtext],
      include: {
        shifts: {
          include: :registrations,
          methods: [:spots_remaining, :spots_taken, :full?, :duration_in_hours, :time_range]
        }
      }
    )
  end

  def show
    @event = Event.includes(shifts: :registrations).find(params[:id])
    render json: @event.as_json(
      only: [:id, :name, :start_date, :end_date, :shifts_header, :shifts_subtext, :created_at, :updated_at],
      include: {
        shifts: {
          include: {
            registrations: {
              only: [:id, :name, :publish_name]
            }
          },
          methods: [:available_spots, :spots_remaining, :spots_taken, :full?, :duration_in_hours, :time_range]
        }
      }
    )
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Event not found' }, status: :not_found
  end
end
