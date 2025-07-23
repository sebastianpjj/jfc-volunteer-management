import React, { useState, useEffect } from 'react';

const EventDetail = ({ eventId }) => {
  console.log('EventDetail component initialized with eventId:', eventId);

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedShift, setSelectedShift] = useState(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  // Add a simple test render first
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          🚀 React Component Working! Event ID: {eventId}
        </h1>
        <div className="bg-white p-6 rounded-lg shadow">
          <p>If you can see this, React is working correctly.</p>
          <p>Loading event data...</p>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch event');
      }
      const data = await response.json();
      setEvent(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = (shift) => {
    setSelectedShift(shift);
    setShowRegistrationForm(true);
  };

  const onRegistrationSuccess = () => {
    setShowRegistrationForm(false);
    setSelectedShift(null);
    fetchEvent(); // Refresh event data
  };

  if (loading) return <div className="text-center p-4">Loading event...</div>;
  if (error) return <div className="text-center p-4 text-red-600">Error: {error}</div>;
  if (!event) return <div className="text-center p-4">Event not found</div>;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTimeRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const startTime = start.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const endTime = end.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const date = start.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });

    return `${date}, ${startTime} - ${endTime}`;
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffHours = (end - start) / (1000 * 60 * 60);
    return diffHours.toFixed(1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <a href="/events" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Events
          </a>
          <h1 className="text-3xl font-bold mb-2">{event.name}</h1>
          <p className="text-xl text-gray-600">{formatDate(event.date)}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6">Available Volunteer Shifts</h2>

          {event.shifts && event.shifts.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {event.shifts.map(shift => (
                <ShiftCard
                  key={shift.id}
                  shift={shift}
                  onRegister={() => handleRegisterClick(shift)}
                  disabled={shift.full}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-600 py-8">
              No volunteer shifts available for this event.
            </div>
          )}
        </div>

        {showRegistrationForm && selectedShift && (
          <RegistrationForm
            shift={selectedShift}
            event={event}
            onSuccess={onRegistrationSuccess}
            onCancel={() => setShowRegistrationForm(false)}
          />
        )}
      </div>
    </div>
  );
};

const ShiftCard = ({ shift, onRegister, disabled }) => {
  const formatTimeRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const startTime = start.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const endTime = end.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const date = start.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });

    return `${date}, ${startTime} - ${endTime}`;
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffHours = (end - start) / (1000 * 60 * 60);
    return diffHours.toFixed(1);
  };

  return (
    <div className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${disabled ? 'bg-gray-50 border-gray-300' : ''}`}>
      <h3 className="text-lg font-semibold mb-2">{shift.name}</h3>
      <p className="text-gray-600 mb-2">Group: {shift.group_name}</p>
      <p className="text-gray-600 mb-2">Time: {formatTimeRange(shift.start_date, shift.end_date)}</p>
      <p className="text-gray-600 mb-4">Duration: {calculateDuration(shift.start_date, shift.end_date)} hours</p>

      <div className="mb-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Volunteers: {shift.spots_taken || 0} / {shift.available_spots || 0}
          </p>
          {shift.full ? (
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
              FULL
            </span>
          ) : (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
              {shift.spots_remaining || 0} spots left
            </span>
          )}
        </div>
      </div>

      <button
        onClick={onRegister}
        disabled={disabled}
        className={`w-full py-2 px-4 rounded transition-colors ${
          disabled
            ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
            : 'bg-green-600 text-white hover:bg-green-700'
        }`}
      >
        {disabled ? 'Shift is Full' : 'Register as Volunteer'}
      </button>
    </div>
  );
};

const RegistrationForm = ({ shift, event, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    shift_id: shift.id
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ registration: formData })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error && errorData.error === 'This shift is full') {
          throw new Error(errorData.message || 'This shift is already full. Please choose another shift.');
        }
        throw new Error(errorData.errors ? errorData.errors.join(', ') : 'Registration failed');
      }

      alert('Registration successful! Thank you for volunteering!');
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimeRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const startTime = start.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const endTime = end.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return `${startTime} - ${endTime}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold mb-4">Register for Volunteer Shift</h3>

        <div className="mb-4 p-3 bg-gray-100 rounded">
          <p><strong>Event:</strong> {event.name}</p>
          <p><strong>Shift:</strong> {shift.name} ({shift.group_name})</p>
          <p><strong>Time:</strong> {formatTimeRange(shift.start_date, shift.end_date)}</p>
          <p><strong>Date:</strong> {new Date(shift.start_date).toLocaleDateString()}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Registering...' : 'Register'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventDetail;
