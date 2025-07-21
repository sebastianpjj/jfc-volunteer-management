# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

# Create admin user
if AdminUser.count == 0
  AdminUser.create!(
    email: 'admin@footballclub.com',
    password: 'password123',
    password_confirmation: 'password123'
  )
  puts "Created admin user with email: admin@footballclub.com"
end

# Create sample events
event1 = Event.find_or_create_by(name: "Championship Final Preparation") do |event|
  event.date = 2.weeks.from_now
end

event2 = Event.find_or_create_by(name: "Youth Training Camp") do |event|
  event.date = 1.month.from_now
end

event3 = Event.find_or_create_by(name: "Community Outreach Day") do |event|
  event.date = 3.weeks.from_now
end

# Create shifts for event1
event1.shifts.find_or_create_by(name: "Setup Team", group_name: "Infrastructure") do |shift|
  shift.start_date = event1.date.beginning_of_day + 8.hours
  shift.end_date = event1.date.beginning_of_day + 10.hours
end

event1.shifts.find_or_create_by(name: "Catering Support", group_name: "Food & Beverage") do |shift|
  shift.start_date = event1.date.beginning_of_day + 10.hours
  shift.end_date = event1.date.beginning_of_day + 13.hours
end

event1.shifts.find_or_create_by(name: "Security Team", group_name: "Safety") do |shift|
  shift.start_date = event1.date.beginning_of_day + 12.hours
  shift.end_date = event1.date.beginning_of_day + 16.hours
end

event1.shifts.find_or_create_by(name: "Cleanup Crew", group_name: "Infrastructure") do |shift|
  shift.start_date = event1.date.beginning_of_day + 18.hours
  shift.end_date = event1.date.beginning_of_day + 21.hours
end

# Create shifts for event2
event2.shifts.find_or_create_by(name: "Registration Desk", group_name: "Administration") do |shift|
  shift.start_date = event2.date.beginning_of_day + 7.hours
  shift.end_date = event2.date.beginning_of_day + 9.hours
end

event2.shifts.find_or_create_by(name: "Training Assistant", group_name: "Coaching") do |shift|
  shift.start_date = event2.date.beginning_of_day + 9.hours
  shift.end_date = event2.date.beginning_of_day + 12.hours
end

event2.shifts.find_or_create_by(name: "Equipment Manager", group_name: "Logistics") do |shift|
  shift.start_date = event2.date.beginning_of_day + 8.hours
  shift.end_date = event2.date.beginning_of_day + 11.hours
end

# Create shifts for event3
event3.shifts.find_or_create_by(name: "Community Liaison", group_name: "Public Relations") do |shift|
  shift.start_date = event3.date.beginning_of_day + 10.hours
  shift.end_date = event3.date.beginning_of_day + 13.hours
end

event3.shifts.find_or_create_by(name: "Activity Coordinator", group_name: "Entertainment") do |shift|
  shift.start_date = event3.date.beginning_of_day + 11.hours
  shift.end_date = event3.date.beginning_of_day + 14.hours
end

puts "Created #{Event.count} events with #{Shift.count} total shifts"