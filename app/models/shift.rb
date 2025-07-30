class Shift < ApplicationRecord
  belongs_to :event
  has_many :registrations, dependent: :destroy

  validates :name, presence: true
  validates :group_name, presence: true
  validates :start_date, presence: true
  validates :end_date, presence: true
  validates :max_volunteers, presence: true, numericality: { greater_than: 0 }
  validate :end_date_after_start_date

  # Prevent deletion if registrations exist
  before_destroy :check_for_registrations

  def available_spots
    max_volunteers
  end

  def spots_remaining
    [max_volunteers - registrations.count, 0].max
  end

  def full?
    registrations.count >= max_volunteers
  end

  def spots_taken
    registrations.count
  end

  def duration_in_hours
    return 0 unless start_date && end_date
    ((end_date - start_date) / 1.hour).round(1)
  end

  def time_range
    return "" unless start_date && end_date
    "#{start_date.strftime('%H:%M')} - #{end_date.strftime('%H:%M')}"
  end

  def can_be_deleted?
    registrations.count == 0
  end

  def deletion_blocked_message
    if registrations.count > 0
      "Cannot delete shift '#{name}' because it has #{registrations.count} registration(s). Please remove all registrations first."
    end
  end

  # Ransack configuration for ActiveAdmin search
  def self.ransackable_attributes(auth_object = nil)
    ["name", "group_name", "start_date", "end_date", "created_at", "updated_at", "id", "event_id"]
  end

  def self.ransackable_associations(auth_object = nil)
    ["event", "registrations"]
  end

  private

  def end_date_after_start_date
    return unless start_date && end_date

    if end_date <= start_date
      errors.add(:end_date, "must be after start date")
    end
  end

  def check_for_registrations
    if registrations.count > 0
      errors.add(:base, deletion_blocked_message)
      throw(:abort)
    end
  end
end
