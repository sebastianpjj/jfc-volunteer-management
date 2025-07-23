import React from 'react';

const EventsList = () => {
  console.log('EventsList component initialized');
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          🚀 EventsList React Component Working!
        </h1>
        <div className="bg-white p-6 rounded-lg shadow">
          <p>If you can see this, React is working correctly on the index page.</p>
          <p>EventsList component loaded successfully!</p>
        </div>
      </div>
    </div>
  );
};

export default EventsList;
