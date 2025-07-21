class Api::RegistrationsController < ApplicationController
  skip_before_action :verify_authenticity_token

  def create
    @shift = Shift.find(params[:registration][:shift_id])

    if @shift.full?
      render json: {
        error: 'This shift is full',
        message: "Sorry, this shift already has #{@shift.max_volunteers} volunteers registered. Please choose another shift."
      }, status: :unprocessable_entity
      return
    end

    @registration = Registration.new(registration_params)

    if @registration.save
      render json: @registration.as_json(
        include: {
          shift: {
            include: :event,
            methods: [:spots_remaining, :spots_taken, :full?]
          }
        }
      ), status: :created
    else
      render json: { errors: @registration.errors.full_messages }, status: :unprocessable_entity
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Shift not found' }, status: :not_found
  end

  private

  def registration_params
    params.require(:registration).permit(:name, :email, :phone, :shift_id)
  end
end
