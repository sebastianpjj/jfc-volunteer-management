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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
          events.map((event, index) =>
            React.createElement('div', {
              key: event.id,
              className: `flex items-center justify-between p-6 hover:bg-jfc-light-gray transition-colors duration-200 ${
                index !== events.length - 1 ? 'border-b border-gray-200' : ''
              }`
            },
              React.createElement('div', {
                className: 'flex items-center space-x-4'
              },
                React.createElement('div', {
                  className: 'w-12 h-12 bg-gradient-to-r from-jfc-green to-jfc-light-green rounded-full flex items-center justify-center text-white font-semibold'
                }, event.name.charAt(0).toUpperCase()),
                React.createElement('div', null,
                  React.createElement('h3', {
                    className: 'text-lg font-heading font-semibold text-jfc-navy mb-1'
                  }, event.name),
                  React.createElement('p', {
                    className: 'text-jfc-gray text-sm'
                  }, `📅 ${formatDate(event.date)}`),
                  React.createElement('p', {
                    className: 'text-jfc-green text-sm font-medium mt-1'
                  }, `${event.spots_remaining || 0} Helfer gesucht`)
                )
              ),
              React.createElement('div', {
                className: 'flex items-center space-x-3'
              },
                React.createElement('a', {
                  href: `/events/${event.id}`,
                  className: 'bg-jfc-green hover:bg-jfc-light-green text-white button-styled font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center group'
                },
                  'Details anzeigen',
                  React.createElement('span', {
                    className: 'ml-2 group-hover:translate-x-1 transition-transform duration-200'
                  }, '→')
                )
              )
            )
          )
        )
    )
  );
};

export default EventsList;