class Registration < ApplicationRecord
  belongs_to :shift

  validates :name, presence: true
  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  # validates :phone, presence: true
  validates :publish_name, inclusion: { in: [true, false] }

  # Custom ransacker for filtering by event through shift relationship
  ransacker :shift_event_id do
    Arel.sql("(SELECT events.id FROM events INNER JOIN shifts ON events.id = shifts.event_id WHERE shifts.id = registrations.shift_id)")
  end

  # Ransack configuration for ActiveAdmin search
  def self.ransackable_attributes(auth_object = nil)
    ["name", "email", "phone", "created_at", "updated_at", "id", "shift_id", "publish_name", "shift_event_id"]
  end

  def self.ransackable_associations(auth_object = nil)
    ["shift"]
  end
end
