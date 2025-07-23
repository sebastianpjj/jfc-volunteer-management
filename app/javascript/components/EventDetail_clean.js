import React from 'react';

const EventDetail = ({ eventId }) => {
  const [event, setEvent] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [registrationStatus, setRegistrationStatus] = React.useState({});
  const [showRegistrationForm, setShowRegistrationForm] = React.useState(null);
  const [volunteerInfo, setVolunteerInfo] = React.useState({
    name: '',
    email: '',
    phone: ''
  });

  React.useEffect(() => {
    console.log(`🎯 EventDetail component mounted for event ${eventId}`);
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}`);
      if (!response.ok) {
        throw new Error('Fehler beim Laden der Veranstaltung');
      }
      const data = await response.json();
      console.log('📊 Event detail data loaded:', data);
      setEvent(data);
    } catch (err) {
      console.error('❌ Error fetching event:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (shiftId) => {
    try {
      setRegistrationStatus(prev => ({ ...prev, [shiftId]: 'loading' }));

      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
        },
        body: JSON.stringify({
          registration: {
            shift_id: shiftId,
            name: volunteerInfo.name || 'Freiwilliger Helfer',
            email: volunteerInfo.email || 'volunteer@example.com',
            phone: volunteerInfo.phone || ''
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Registration successful:', result);
        setRegistrationStatus(prev => ({ ...prev, [shiftId]: 'success' }));
        setShowRegistrationForm(null);
        setVolunteerInfo({ name: '', email: '', phone: '' });

        // Refresh event data to show updated availability
        await fetchEvent();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Fehler bei der Anmeldung');
      }
    } catch (err) {
      console.error('❌ Registration error:', err);
      setRegistrationStatus(prev => ({ ...prev, [shiftId]: 'error' }));
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
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
          }, 'Veranstaltungsdetails werden geladen...')
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
          }, error),
          React.createElement('a', {
            href: '/events',
            className: 'mt-4 inline-block bg-jfc-green text-white px-6 py-2 rounded-lg hover:bg-jfc-light-green transition-colors'
          }, '← Zurück zur Übersicht')
        )
      )
    );
  }

  if (!event) {
    return (
      React.createElement('div', {
        className: 'max-w-4xl mx-auto p-6 text-center'
      },
        React.createElement('p', {
          className: 'text-jfc-gray'
        }, 'Veranstaltung nicht gefunden.')
      )
    );
  }

  return (
    React.createElement('div', {
      className: 'max-w-6xl mx-auto p-6'
    },
      // Header Section
      React.createElement('div', {
        className: 'bg-gradient-to-r from-jfc-green to-jfc-light-green rounded-lg text-white p-8 mb-8 shadow-lg'
      },
        React.createElement('div', {
          className: 'flex justify-between items-start'
        },
          React.createElement('div', null,
            React.createElement('h1', {
              className: 'text-4xl font-heading font-semibold mb-4'
            }, event.name),
            React.createElement('p', {
              className: 'text-green-100 text-lg'
            }, `📅 ${formatDateTime(event.date)}`)
          ),
          React.createElement('a', {
            href: '/events',
            className: 'bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-colors'
          }, '← Zurück')
        )
      ),

      // Shifts Section
      React.createElement('div', {
        className: 'grid gap-6'
      },
        React.createElement('h2', {
          className: 'text-3xl font-heading font-semibold text-jfc-navy mb-6'
        }, 'Verfügbare Schichten'),

        event.shifts && event.shifts.length > 0
          ? event.shifts.map(shift =>
              React.createElement('div', {
                key: shift.id,
                className: `bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden ${shift['full?'] ? 'opacity-75' : ''}`
              },
                React.createElement('div', {
                  className: `p-6 ${shift['full?'] ? 'bg-gray-50' : 'bg-white'}`
                },
                  React.createElement('div', {
                    className: 'flex justify-between items-start mb-4'
                  },
                    React.createElement('div', null,
                      React.createElement('h3', {
                        className: 'text-xl font-heading font-semibold text-jfc-navy mb-2'
                      }, shift.name),
                      shift.group_name && React.createElement('p', {
                        className: 'text-jfc-green font-medium mb-2'
                      }, `👥 ${shift.group_name}`),
                      React.createElement('p', {
                        className: 'text-jfc-gray text-sm'
                      }, `⏰ ${formatTime(shift.start_date)} - ${formatTime(shift.end_date)}`)
                    ),
                    React.createElement('div', {
                      className: 'text-right'
                    },
                      React.createElement('div', {
                        className: `inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                          shift['full?']
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`
                      },
                        shift['full?']
                          ? '✕ Ausgebucht'
                          : `✓ ${shift.max_volunteers - shift.registration_count} von ${shift.max_volunteers} Plätzen frei`
                      )
                    )
                  ),

                  // Registration Button/Form
                  shift['full?']
                    ? React.createElement('div', {
                        className: 'text-center py-4'
                      },
                        React.createElement('p', {
                          className: 'text-gray-500'
                        }, 'Diese Schicht ist bereits ausgebucht.')
                      )
                    : showRegistrationForm === shift.id
                      ? // Registration Form
                        React.createElement('div', {
                          className: 'bg-jfc-light-gray p-6 rounded-lg mt-4'
                        },
                          React.createElement('h4', {
                            className: 'text-lg font-semibold text-jfc-navy mb-4'
                          }, 'Anmeldung für diese Schicht'),
                          React.createElement('div', {
                            className: 'grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'
                          },
                            React.createElement('div', null,
                              React.createElement('label', {
                                className: 'block text-sm font-medium text-jfc-gray mb-1'
                              }, 'Name *'),
                              React.createElement('input', {
                                type: 'text',
                                value: volunteerInfo.name,
                                onChange: (e) => setVolunteerInfo(prev => ({ ...prev, name: e.target.value })),
                                className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jfc-green focus:border-transparent',
                                placeholder: 'Ihr vollständiger Name',
                                required: true
                              })
                            ),
                            React.createElement('div', null,
                              React.createElement('label', {
                                className: 'block text-sm font-medium text-jfc-gray mb-1'
                              }, 'E-Mail *'),
                              React.createElement('input', {
                                type: 'email',
                                value: volunteerInfo.email,
                                onChange: (e) => setVolunteerInfo(prev => ({ ...prev, email: e.target.value })),
                                className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jfc-green focus:border-transparent',
                                placeholder: 'ihre.email@beispiel.de',
                                required: true
                              })
                            )
                          ),
                          React.createElement('div', {
                            className: 'mb-4'
                          },
                            React.createElement('label', {
                              className: 'block text-sm font-medium text-jfc-gray mb-1'
                            }, 'Telefon (optional)'),
                            React.createElement('input', {
                              type: 'tel',
                              value: volunteerInfo.phone,
                              onChange: (e) => setVolunteerInfo(prev => ({ ...prev, phone: e.target.value })),
                              className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jfc-green focus:border-transparent',
                              placeholder: '+49 123 456789'
                            })
                          ),
                          React.createElement('div', {
                            className: 'flex gap-3'
                          },
                            React.createElement('button', {
                              onClick: () => handleRegister(shift.id),
                              disabled: !volunteerInfo.name || !volunteerInfo.email || registrationStatus[shift.id] === 'loading',
                              className: 'bg-jfc-green hover:bg-jfc-light-green text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                            },
                              registrationStatus[shift.id] === 'loading' ? 'Anmeldung läuft...' : 'Jetzt anmelden'
                            ),
                            React.createElement('button', {
                              onClick: () => setShowRegistrationForm(null),
                              className: 'bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-6 rounded-lg transition-colors'
                            }, 'Abbrechen')
                          )
                        )
                      : // Register Button
                        React.createElement('div', {
                          className: 'text-center mt-4'
                        },
                          registrationStatus[shift.id] === 'success'
                            ? React.createElement('div', {
                                className: 'bg-green-50 border border-green-200 rounded-lg p-4 text-green-700'
                              }, '✅ Erfolgreich angemeldet! Sie erhalten eine Bestätigung per E-Mail.')
                            : registrationStatus[shift.id] === 'error'
                              ? React.createElement('div', {
                                  className: 'bg-red-50 border border-red-200 rounded-lg p-4 text-red-700'
                                }, '❌ Fehler bei der Anmeldung. Bitte versuchen Sie es erneut.')
                              : React.createElement('button', {
                                  onClick: () => setShowRegistrationForm(shift.id),
                                  className: 'bg-jfc-green hover:bg-jfc-light-green text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center mx-auto group'
                                },
                                  'Als Helfer anmelden',
                                  React.createElement('span', {
                                    className: 'ml-2 group-hover:translate-x-1 transition-transform duration-200'
                                  }, '→')
                                )
                        )
                )
              )
            )
          : React.createElement('div', {
              className: 'text-center py-16'
            },
              React.createElement('div', {
                className: 'text-6xl mb-4'
              }, '🚫'),
              React.createElement('h3', {
                className: 'text-2xl font-heading font-semibold text-jfc-navy mb-2'
              }, 'Keine Schichten verfügbar'),
              React.createElement('p', {
                className: 'text-jfc-gray'
              }, 'Für diese Veranstaltung sind momentan keine Helferschichten eingetragen.')
            )
      )
    )
  );
};

export default EventDetail;
