import React, { useState, useEffect } from 'react';

const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      setEvents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center p-4">Loading events...</div>;
  if (error) return <div className="text-center p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Football Club - Volunteer Opportunities</h1>
      
      {events.length === 0 ? (
        <div className="text-center text-gray-600">No events available at the moment.</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};

const EventCard = ({ event }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTimeRange = (startDate, endDate) => {
    if (!startDate || !endDate) return '';
    
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
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h2 className="text-xl font-semibold mb-2">{event.name}</h2>
      <p className="text-gray-600 mb-4">{formatDate(event.date)}</p>
      
      <div className="mb-4">
        <h3 className="font-medium mb-2">Available Shifts:</h3>
        {event.shifts && event.shifts.length > 0 ? (
          <ul className="space-y-1">
            {event.shifts.slice(0, 3).map(shift => (
              <li key={shift.id} className="text-sm text-gray-700">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{shift.name} ({shift.group_name})</div>
                    <div className="text-xs text-gray-500">
                      {formatTimeRange(shift.start_date, shift.end_date)} 
                      {shift.duration_in_hours && ` • ${shift.duration_in_hours}h`}
                    </div>
                  </div>
                  <div className="text-xs ml-2">
                    {shift.full ? (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded">FULL</span>
                    ) : (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                        {shift.spots_remaining} spots left
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
            {event.shifts.length > 3 && (
              <li className="text-sm text-gray-500">
                +{event.shifts.length - 3} more shifts
              </li>
            )}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No shifts available</p>
        )}
      </div>
      
      <a 
        href={`/events/${event.id}`}
        className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
      >
        View Details & Register
      </a>
    </div>
  );
};

export default EventsList;
