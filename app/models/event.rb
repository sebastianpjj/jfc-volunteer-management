class Event < ApplicationRecord
  has_many :shifts, dependent: :restrict_with_error
  has_many :registrations, through: :shifts

  validates :name, presence: true
  validates :date, presence: true

  accepts_nested_attributes_for :shifts, allow_destroy: true

  # Prevent deletion if registrations exist
  before_destroy :check_for_registrations

  def can_be_deleted?
    registrations.count == 0 && shifts.all?(&:can_be_deleted?)
  end

  def deletion_blocked_message
    if registrations.count > 0
      "Cannot delete event '#{name}' because it has #{registrations.count} registration(s) across its shifts. Please remove all registrations first."
    elsif shifts.any? { |shift| !shift.can_be_deleted? }
      protected_shifts = shifts.reject(&:can_be_deleted?)
      "Cannot delete event '#{name}' because #{protected_shifts.count} shift(s) have registrations."
    end
  end

  def spots_remaining
    return self.capacity_remaining
  end

  def total_capacity
    shifts.sum(:max_volunteers)
  end

  def capacity_taken
    registrations.count
  end

  def capacity_remaining
    total_capacity - capacity_taken
  end

  def capacity_percentage
    return 0 if total_capacity == 0
    ((capacity_taken.to_f / total_capacity) * 100).round(1)
  end

  # Ransack configuration for ActiveAdmin search
  def self.ransackable_attributes(auth_object = nil)
    ["name", "date", "shifts_header", "shifts_subtext", "created_at", "updated_at", "id"]
  end

  def self.ransackable_associations(auth_object = nil)
    ["shifts"]
  end

  private

  def check_for_registrations
    if registrations.count > 0
      errors.add(:base, deletion_blocked_message)
      throw(:abort)
    end
  end
end
