import React, { useState, useEffect } from 'react';

const EventDetail = ({ eventId }) => {
  console.log('EventDetail component initialized with eventId:', eventId);

  // Simple test render first
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          🚀 React Component Working! Event ID: {eventId}
        </h1>
        <div className="bg-white p-6 rounded-lg shadow">
          <p>If you can see this, React is working correctly.</p>
          <p>The page should no longer be blank!</p>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
