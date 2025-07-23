class Api::EventsController < ApplicationController
  skip_before_action :verify_authenticity_token

  def index
    @events = Event.includes(:shifts).order(:date)
    render json: @events.as_json(
      methods: :spots_remaining,
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
      include: {
        shifts: {
          include: :registrations,
          methods: [:available_spots, :spots_remaining, :spots_taken, :full?, :duration_in_hours, :time_range]
        }
      }
    )
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Event not found' }, status: :not_found
  end
end
