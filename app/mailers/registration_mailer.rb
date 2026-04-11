class RegistrationMailer < ApplicationMailer

  # Subject can be set in your I18n file at config/locales/en.yml
  # with the following lookup:
  #
  #   en.team_mailer.confirmation.subject
  #
  def confirmation(registration)
    @registration = registration
    @name = registration.name
    @shift = registration.shift
    @event = registration.shift.event

    mail(
      to: @registration.email,
      subject: 'JFC Eintracht Feldberg | Bestätigung deiner Anmeldung',
    )
  end
end
