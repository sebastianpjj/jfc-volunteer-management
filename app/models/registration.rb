class Registration < ApplicationRecord
  belongs_to :shift

  validates :name, presence: true
  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :phone, presence: true

  # Ransack configuration for ActiveAdmin search
  def self.ransackable_attributes(auth_object = nil)
    ["name", "email", "phone", "created_at", "updated_at", "id", "shift_id"]
  end

  def self.ransackable_associations(auth_object = nil)
    ["shift"]
  end
end
