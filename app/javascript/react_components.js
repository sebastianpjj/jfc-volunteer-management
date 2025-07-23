import React from 'react';
import { createRoot } from 'react-dom/client';
import EventsList from 'components/EventsList';
import EventDetail from 'components/EventDetail';

const initializeReactComponents = () => {
  console.log('🚀 Initializing React components...');

  // Initialize EventsList component on /events page
  const eventsListContainer = document.getElementById('events-list-react');
  if (eventsListContainer) {
    console.log('📋 Found events list container, rendering EventsList...');
    const root = createRoot(eventsListContainer);
    root.render(React.createElement(EventsList));
  }

  // Initialize EventDetail component on /events/:id page
  const eventDetailContainer = document.getElementById('event-detail-react');
  if (eventDetailContainer) {
    const eventId = eventDetailContainer.dataset.eventId;
    if (eventId) {
      console.log(`📝 Found event detail container, rendering EventDetail for event ${eventId}...`);
      const root = createRoot(eventDetailContainer);
      root.render(React.createElement(EventDetail, { eventId: parseInt(eventId) }));
    }
  }
};

// Initialize on page load and on Turbo navigation
document.addEventListener('DOMContentLoaded', initializeReactComponents);
document.addEventListener('turbo:load', initializeReactComponents);

export { initializeReactComponents };