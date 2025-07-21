# Create sample event data
puts "Creating sample event data..."

# Create an event
event = Event.find_or_create_by(name: "Football Club Fundraising Event") do |e|
  e.date = Date.current + 2.weeks
end

puts "Created event: #{event.name}"

# Create shifts with different capacity levels
shifts_data = [
  { name: "Setup Team", group_name: "Morning Setup", max_volunteers: 5, hour_offset: 8 },
  { name: "Registration Desk", group_name: "Event Management", max_volunteers: 3, hour_offset: 10 },
  { name: "Food Service", group_name: "Catering", max_volunteers: 8, hour_offset: 11 },
  { name: "Cleanup Crew", group_name: "Afternoon Cleanup", max_volunteers: 6, hour_offset: 16 }
]

shifts_data.each do |shift_data|
  shift = event.shifts.find_or_create_by(name: shift_data[:name]) do |s|
    s.group_name = shift_data[:group_name]
    s.max_volunteers = shift_data[:max_volunteers]
    s.start_date = event.date.beginning_of_day + shift_data[:hour_offset].hours
    s.end_date = s.start_date + 3.hours
  end

  puts "Created shift: #{shift.name} (#{shift.max_volunteers} max volunteers)"
end

# Create some sample registrations to show capacity
setup_shift = event.shifts.find_by(name: "Setup Team")
if setup_shift
  2.times do |i|
    reg = setup_shift.registrations.find_or_create_by(email: "volunteer#{i+1}@example.com") do |r|
      r.name = "Volunteer #{i+1}"
      r.phone = "555-000#{i+1}"
    end
    puts "Created registration: #{reg.name}"
  end
end

puts "Sample data creation complete!"
puts "Event ID: #{event.id}"
puts "Total capacity: #{event.total_capacity}"
puts "Current registrations: #{event.capacity_taken}"
