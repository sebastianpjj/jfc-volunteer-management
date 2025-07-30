// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import "@hotwired/turbo-rails"
import "controllers"

// Import and initialize React components
import { createRoot } from "react-dom/client";
import React from "react";
import EventDetailComponent from "components/EventDetailComponent";

// Initialize React components when DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
  console.log("DOM loaded, initializing React components");
  
  // Initialize EventDetailComponent
  const eventDetailContainer = document.getElementById('event-detail-react');
  if (eventDetailContainer) {
    const eventId = eventDetailContainer.dataset.eventId;
    console.log("Found event detail container for event:", eventId);
    
    const root = createRoot(eventDetailContainer);
    root.render(React.createElement(EventDetailComponent, { eventId: parseInt(eventId) }));
  }
});
