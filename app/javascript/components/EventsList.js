import React from 'react';

const EventsList = () => {
  const [events, setEvents] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    console.log('🏈 EventsList component mounted, fetching events...');
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('Fehler beim Laden der Veranstaltungen');
      }
      const data = await response.json();
      console.log('📊 Events data loaded:', data);
      setEvents(data);
    } catch (err) {
      console.error('❌ Error fetching events:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (eventData) => {
    // Handle both old format (date field) and new format (start_date/end_date)
    if (eventData.start_date && eventData.end_date) {
      const startDate = new Date(eventData.start_date);
      const endDate = new Date(eventData.end_date);

      if (startDate.toDateString() === endDate.toDateString()) {
        // Single day event
        return startDate.toLocaleDateString('de-DE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      } else if (startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
        // Same month
        return `${startDate.getDate()}-${endDate.getDate()}.${String(endDate.getMonth() + 1).padStart(2, '0')}.${endDate.getFullYear()}`;
      } else if (startDate.getFullYear() === endDate.getFullYear()) {
        // Same year
        return `${startDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}-${endDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
      } else {
        // Different years
        return `${startDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}-${endDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
      }
    } else if (eventData.date) {
      // Fallback for old format
      return new Date(eventData.date).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } else {
      return 'Datum unbekannt';
    }
  };

  const isEventExpired = (event) => {
    if (!event.shifts || event.shifts.length === 0) {
      // If no shifts, check end_date or fallback to date
      if (event.end_date) {
        return new Date(event.end_date) < new Date();
      } else if (event.date) {
        return new Date(event.date) < new Date();
      }
      return false;
    }

    // Find the latest end_date among all shifts
    const latestShiftEnd = event.shifts.reduce((latest, shift) => {
      const shiftEnd = new Date(shift.end_date);
      return shiftEnd > latest ? shiftEnd : latest;
    }, new Date(0));

    return latestShiftEnd < new Date();
  };

  if (loading) {
    return (
      React.createElement('div', {
        className: 'flex justify-center items-center py-16'
      },
        React.createElement('div', {
          className: 'text-center'
        },
          React.createElement('div', {
            className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-jfc-green mx-auto mb-4'
          }),
          React.createElement('p', {
            className: 'text-jfc-gray font-semibold'
          }, 'Veranstaltungen werden geladen...')
        )
      )
    );
  }

  if (error) {
    return (
      React.createElement('div', {
        className: 'max-w-4xl mx-auto p-6'
      },
        React.createElement('div', {
          className: 'bg-red-50 border border-red-200 rounded-lg p-6 text-center'
        },
          React.createElement('div', {
            className: 'text-red-600 text-lg font-semibold mb-2'
          }, '⚠️ Fehler'),
          React.createElement('p', {
            className: 'text-red-700'
          }, error)
        )
      )
    );
  }

  return (
    React.createElement('div', {
      className: 'max-w-6xl mx-auto p-6'
    },
      React.createElement('div', {
        className: 'mb-8'
      },
        React.createElement('h2', {
          className: 'text-4xl font-heading font-semibold text-jfc-navy mb-2'
        }, 'Veranstaltungsübersicht'),
        React.createElement('p', {
          className: 'text-lg text-jfc-gray mb-6'
        }, 'Melde dich als helfende Hand für unsere Vereinsveranstaltungen an'),
        React.createElement('div', {
          className: 'h-1 w-20 bg-gradient-to-r from-jfc-green to-jfc-light-green rounded'
        })
      ),

      events.length === 0
        ? React.createElement('div', {
            className: 'text-center py-16'
          },
            React.createElement('div', {
              className: 'text-6xl mb-4'
            }, '📅'),
            React.createElement('h3', {
              className: 'text-2xl font-heading font-semibold text-jfc-navy mb-2'
            }, 'Keine Veranstaltungen verfügbar'),
            React.createElement('p', {
              className: 'text-jfc-gray'
            }, 'Aktuell sind keine Veranstaltungen geplant, die Hilfe benötigen.')
          )
        : React.createElement('div', {
            className: 'bg-white rounded-lg shadow-lg overflow-hidden'
          },
          events.map((event, index) => {
            const expired = isEventExpired(event);
            return React.createElement('div', {
              key: event.id,
              className: `flex items-center justify-between p-6 hover:bg-jfc-light-gray transition-colors duration-200 ${
                index !== events.length - 1 ? 'border-b border-gray-200' : ''
              } ${expired ? 'opacity-50 bg-gray-50' : ''}`
            },
              React.createElement('div', {
                className: 'flex items-center space-x-4'
              },
                React.createElement('div', {
                  className: `w-12 h-12 ${expired ? 'bg-gray-400' : 'bg-gradient-to-r from-jfc-green to-jfc-light-green'} rounded-full flex items-center justify-center text-white font-semibold`
                }, event.name.charAt(0).toUpperCase()),
                React.createElement('div', null,
                  React.createElement('h3', {
                    className: `text-lg font-heading font-semibold mb-1 ${expired ? 'text-gray-500' : 'text-jfc-navy'}`
                  }, event.name),
                  React.createElement('p', {
                    className: `text-sm ${expired ? 'text-gray-400' : 'text-jfc-gray'}`
                  }, `📅 ${formatDate(event)}`),
                  expired
                    ? React.createElement('p', {
                        className: 'text-red-500 text-sm font-medium mt-1'
                      }, '⏰ Veranstaltung beendet')
                    : React.createElement('p', {
                        className: 'text-jfc-green text-sm font-medium mt-1'
                      }, `${event.spots_remaining || 0} Helfer gesucht`)
                )
              ),
              React.createElement('div', {
                className: 'flex items-center space-x-3'
              },
                expired
                  ? React.createElement('span', {
                      className: 'bg-gray-300 text-gray-500 font-semibold py-2 px-4 rounded-lg cursor-not-allowed'
                    }, 'Nicht verfügbar')
                  : React.createElement('a', {
                      href: `/events/${event.id}`,
                      className: 'bg-jfc-green hover:bg-jfc-light-green text-white button-styled font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center group'
                    },
                      'Details anzeigen',
                      React.createElement('span', {
                        className: 'ml-2 group-hover:translate-x-1 transition-transform duration-200'
                      }, '→')
                    )
              )
            );
          })
        )
    )
  );
};

export default EventsList;