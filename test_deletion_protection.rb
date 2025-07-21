# Create test registrations to demonstrate deletion protection
puts "Creating test registrations..."

# Get the first shift
shift = Shift.first
if shift
  # Create a test registration
  registration = Registration.create!(
    name: "John Test Volunteer",
    email: "john@example.com",
    phone: "555-0123",
    shift: shift
  )

  puts "Created registration for #{registration.name} in shift '#{shift.name}'"
  puts "Shift #{shift.name} now has #{shift.registrations.count} registration(s)"
  puts "Can shift be deleted? #{shift.can_be_deleted?}"

  if !shift.can_be_deleted?
    puts "Deletion blocked: #{shift.deletion_blocked_message}"
  end
else
  puts "No shifts found. Please run rails db:seed first."
end
