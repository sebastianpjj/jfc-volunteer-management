import React from 'react';
import { createRoot } from 'react-dom/client';
import EventsList from '../components/EventsList';
import EventDetail from '../components/EventDetail';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize EventsList component
  const eventsListContainer = document.getElementById('events-list-react');
  if (eventsListContainer) {
    const root = createRoot(eventsListContainer);
    root.render(<EventsList />);
  }

  // Initialize EventDetail component
  const eventDetailContainer = document.getElementById('event-detail-react');
  if (eventDetailContainer) {
    const eventId = eventDetailContainer.dataset.eventId;
    const root = createRoot(eventDetailContainer);
    root.render(<EventDetail eventId={eventId} />);
  }
});
