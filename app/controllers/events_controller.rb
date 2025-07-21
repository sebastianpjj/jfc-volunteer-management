class EventsController < ApplicationController
  def index
    @events = Event.includes(:shifts).order(:date)
  end

  def show
    @event = Event.includes(shifts: :registrations).find(params[:id])
  end
end
