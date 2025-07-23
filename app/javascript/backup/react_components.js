import React from 'react';
import { createRoot } from 'react-dom/client';
import EventsList from 'components/EventsList-simple';
import EventDetail from 'components/EventDetail-simple';

console.log('🚀 React components script loaded - TOP LEVEL');

const initializeReactComponents = () => {
  console.log('🔧 Initializing React components');

  // Initialize EventsList component
  const eventsListContainer = document.getElementById('events-list-react');
  console.log("🔍 eventsListContainer: ", eventsListContainer);
  if (eventsListContainer) {
    console.log('✅ Found events list container - RENDERING REACT!');
    try {
      const root = createRoot(eventsListContainer);
      root.render(<EventsList />);
      console.log('✅ EventsList rendered successfully');
    } catch (error) {
      console.error('❌ Error rendering EventsList:', error);
    }
  } else {
    console.log('❌ No events list container found');
  }

  // Initialize EventDetail component
  const eventDetailContainer = document.getElementById('event-detail-react');
  console.log("🔍 eventDetailContainer: ", eventDetailContainer);
  if (eventDetailContainer) {
    console.log('✅ Found event detail container');
    const eventId = eventDetailContainer.dataset.eventId;
    console.log('🆔 Event ID:', eventId);
    try {
      const root = createRoot(eventDetailContainer);
      root.render(<EventDetail eventId={eventId} />);
      console.log('✅ EventDetail rendered successfully');
    } catch (error) {
      console.error('❌ Error rendering EventDetail:', error);
    }
  } else {
    console.log('ℹ️ No event detail container found (normal for index page)');
  }
};

// Handle both DOMContentLoaded and Turbo events
console.log('🎯 Adding event listeners...');
document.addEventListener('DOMContentLoaded', () => {
  console.log('📅 DOMContentLoaded event fired');
  initializeReactComponents();
});

document.addEventListener('turbo:load', () => {
  console.log('🚄 turbo:load event fired');
  initializeReactComponents();
});

// Also try immediate execution in case DOM is already ready
if (document.readyState === 'loading') {
  console.log('⏳ Document still loading, waiting for DOMContentLoaded');
} else {
  console.log('⚡ Document already ready, initializing immediately');
  initializeReactComponents();
}
