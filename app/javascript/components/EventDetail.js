import React from 'react';

// Cache bust: Updated 2025-07-30 for shifts_header and shifts_subtext support
console.log('🚀 EventDetail component loaded with shifts_header support - v2025-07-30-v3');

const EventDetail = ({ eventId }) => {
  const [event, setEvent] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [registrationStatus, setRegistrationStatus] = React.useState({});
  const [registrationErrors, setRegistrationErrors] = React.useState({});
  const [showRegistrationForm, setShowRegistrationForm] = React.useState(null);
  const [showSuccessDialog, setShowSuccessDialog] = React.useState(false);
  const [successDialogData, setSuccessDialogData] = React.useState({});
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
      setRegistrationErrors(prev => ({ ...prev, [shiftId]: null })); // Clear previous errors

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

        // Show success dialog with volunteer and shift information
        const shift = event.shifts.find(s => s.id === shiftId);
        const startFormatted = formatDateTimeWithDay(shift?.start_date, event.date);
        const endFormatted = formatDateTimeWithDay(shift?.end_date, event.date);

        setSuccessDialogData({
          volunteerName: volunteerInfo.name,
          shiftName: shift?.name || 'Unbekannte Schicht',
          eventName: event.name,
          shiftTime: shift ? `${startFormatted.text} - ${endFormatted.text}` : ''
        });
        setShowSuccessDialog(true);

        setVolunteerInfo({ name: '', email: '', phone: '' });

        // Refresh event data to show updated availability
        await fetchEvent();
      } else {
        const errorData = await response.json();
        console.error('❌ Registration failed:', errorData);

        // Extract specific error message
        let errorMessage = 'Fehler bei der Anmeldung';
        if (errorData.errors) {
          if (typeof errorData.errors === 'string') {
            errorMessage = errorData.errors;
          } else if (Array.isArray(errorData.errors)) {
            errorMessage = errorData.errors.join(', ');
          } else if (typeof errorData.errors === 'object') {
            // Handle field-specific errors like { email: ["is invalid"] }
            const errorMessages = Object.entries(errorData.errors)
              .map(([field, messages]) => {
                const fieldName = field === 'email' ? 'E-Mail' :
                                  field === 'name' ? 'Name' :
                                  field === 'phone' ? 'Telefon' : field;
                const messageList = Array.isArray(messages) ? messages : [messages];
                return `${fieldName}: ${messageList.join(', ')}`;
              });
            errorMessage = errorMessages.join('; ');
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }

        setRegistrationStatus(prev => ({ ...prev, [shiftId]: 'error' }));
        setRegistrationErrors(prev => ({ ...prev, [shiftId]: errorMessage }));
      }
    } catch (err) {
      console.error('❌ Registration error:', err);
      setRegistrationStatus(prev => ({ ...prev, [shiftId]: 'error' }));
      setRegistrationErrors(prev => ({
        ...prev,
        [shiftId]: 'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.'
      }));
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

  const formatDateTimeWithDay = (dateString, eventDate) => {
    const shiftDate = new Date(dateString);
    const eventDateObj = new Date(eventDate);

    // Check if the shift is on a different day than the event
    const isDifferentDay = shiftDate.toDateString() !== eventDateObj.toDateString();

    // Always show day name and time
    const dayName = shiftDate.toLocaleDateString('de-DE', { weekday: 'short' });
    const time = shiftDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

    return { text: `${dayName} ${time}`, isDifferent: isDifferentDay };
  };

  const groupShiftsByGroupName = (shifts) => {
    if (!shifts || shifts.length === 0) return {};

    // Sort shifts by start_date first
    const sortedShifts = [...shifts].sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

    // Group by group_name and then by date (weekday)
    return sortedShifts.reduce((groups, shift) => {
      const groupName = shift.group_name || 'Allgemeine Schichten';
      const shiftDate = new Date(shift.start_date);
      const dateKey = shiftDate.toDateString(); // Use full date as key for grouping
      const weekday = shiftDate.toLocaleDateString('de-DE', { weekday: 'long' });
      const dateFormatted = shiftDate.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      const combinedKey = `${groupName}__${dateKey}`;

      if (!groups[combinedKey]) {
        groups[combinedKey] = {
          groupName,
          weekday,
          date: dateFormatted,
          dateKey,
          shifts: []
        };
      }
      groups[combinedKey].shifts.push(shift);
      return groups;
    }, {});
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
            className: 'mt-4 inline-block bg-jfc-green text-white button-styled px-6 py-2 rounded-lg hover:bg-jfc-light-green transition-colors'
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
        className: 'mb-8'
      },
        React.createElement('div', {
          className: 'flex justify-between items-start'
        },
          React.createElement('div', null,
            React.createElement('h1', {
              className: 'text-4xl font-heading font-semibold mb-4 text-jfc-navy'
            }, event.name),
            React.createElement('p', {
              className: 'text-jfc-navy text-lg'
            }, `📅 ${formatDateTime(event.date)}`)
          ),
          React.createElement('a', {
            href: '/events',
            className: 'bg-gray-100 hover:bg-gray-200 text-gray-600 button-styled px-4 py-2 rounded-lg transition-colors border border-gray-200'
          }, '← Zurück')
        )
      ),

      // Shifts Section
      React.createElement('div', {
        className: 'grid gap-6'
      },
        React.createElement('div', {
          className: 'mb-6'
        },
          React.createElement('h2', {
            className: 'text-3xl font-heading font-semibold text-jfc-navy mb-3 mt-8'
          }, event.shifts_header || 'Verfügbare Schichten'),

          event.shifts_subtext && React.createElement('p', {
            className: 'text-lg text-gray-600 mb-4'
          }, event.shifts_subtext)
        ),

        event.shifts && event.shifts.length > 0
          ? Object.entries(groupShiftsByGroupName(event.shifts)).map(([combinedKey, groupData]) =>
              React.createElement('div', {
                key: combinedKey,
                className: 'mb-8'
              },
                React.createElement('div', {
                  className: 'mb-4'
                },
                  React.createElement('h3', {
                    className: 'text-2xl font-heading font-semibold text-jfc-navy mb-2 flex items-center'
                  },
                    React.createElement('span', {
                      className: 'w-3 h-3 bg-jfc-green rounded-full mr-3'
                    }),
                    `${groupData.groupName} - ${groupData.weekday}, ${groupData.date}`
                  ),
                  React.createElement('div', {
                    className: 'h-0.5 bg-gradient-to-r from-jfc-green to-transparent w-full'
                  })
                ),
                React.createElement('div', {
                  className: 'grid gap-4'
                },
                  groupData.shifts.map(shift =>
                    React.createElement('div', {
                      key: shift.id,
                      className: `bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-200 ${shift['full?'] ? 'opacity-75' : ''}`
                    },
                      React.createElement('div', {
                        className: `p-4 ${shift['full?'] ? 'bg-gray-50' : 'bg-white'}`
                      },
                        React.createElement('div', {
                          className: 'flex justify-between items-center mb-2'
                        },
                          React.createElement('div', {
                            className: 'flex-1'
                          },
                            React.createElement('h4', {
                              className: 'text-base font-heading font-semibold text-jfc-navy mb-1'
                            }, shift.name),
                            React.createElement('div', {
                              className: 'flex items-center text-jfc-gray text-xs space-x-3'
                            },
                              React.createElement('span', {
                                className: 'flex items-center'
                              },
                                React.createElement('span', {
                                  className: 'mr-1'
                                }, '⏰'),
                                (() => {
                                  const startFormatted = formatDateTimeWithDay(shift.start_date, event.date);
                                  const endFormatted = formatDateTimeWithDay(shift.end_date, event.date);

                                  return React.createElement('span', {}, `${startFormatted.text} - ${endFormatted.text}`);
                                })()
                              ),
                              React.createElement('span', {
                                className: 'flex items-center'
                              },
                                React.createElement('span', {
                                  className: 'mr-1'
                                }, '👥'),
                                `${shift.spots_taken || 0}/${shift.max_volunteers} Helfer`
                              )
                            )
                          ),
                          React.createElement('div', {
                            className: 'flex items-center space-x-2'
                          },
                            React.createElement('div', {
                              className: `inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                shift['full?']
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-green-100 text-green-700'
                              }`
                            },
                              shift['full?']
                                ? '✕ Ausgebucht'
                                : `✓ ${shift.spots_remaining} frei`
                            ),
                            // Registration Button (moved inline)
                            shift['full?']
                              ? null
                              : showRegistrationForm === shift.id
                                ? null // Form will be shown below
                                : registrationStatus[shift.id] === 'error'
                                  ? React.createElement('button', {
                                      onClick: () => setShowRegistrationForm(shift.id),
                                      className: 'bg-red-600 hover:bg-red-700 text-white button-styled font-semibold py-1 px-3 rounded text-xs transition-colors',
                                      title: registrationErrors[shift.id] || 'Fehler bei der Anmeldung'
                                    }, '❌ Erneut versuchen')
                                  : React.createElement('button', {
                                      onClick: () => setShowRegistrationForm(shift.id),
                                      className: 'bg-jfc-green hover:bg-jfc-light-green text-white button-styled font-semibold py-1 px-3 rounded text-xs transition-colors'
                                    }, 'Anmelden')
                          )
                        ),

                        // Registration Form (only shown when active)
                        showRegistrationForm === shift.id && !shift['full?']
                          ? React.createElement('div', {
                              className: 'bg-jfc-light-gray p-3 rounded mt-2'
                            },
                              React.createElement('h4', {
                                className: 'text-sm font-semibold text-jfc-navy mb-2'
                              }, 'Anmeldung'),

                              // Show error message if there was an error
                              registrationErrors[shift.id] && React.createElement('div', {
                                className: 'bg-red-50 border border-red-200 rounded p-2 mb-2'
                              },
                                React.createElement('div', {
                                  className: 'flex items-start'
                                },
                                  React.createElement('span', {
                                    className: 'text-red-500 mr-2 text-sm'
                                  }, '⚠️'),
                                  React.createElement('div', {
                                    className: 'flex-1'
                                  },
                                    React.createElement('p', {
                                      className: 'text-red-700 text-xs font-medium mb-1'
                                    }, 'Fehler bei der Anmeldung:'),
                                    React.createElement('p', {
                                      className: 'text-red-600 text-xs'
                                    }, registrationErrors[shift.id])
                                  )
                                )
                              ),

                              React.createElement('div', {
                                className: 'grid grid-cols-1 md:grid-cols-2 gap-2 mb-2'
                              },
                                React.createElement('input', {
                                  type: 'text',
                                  value: volunteerInfo.name,
                                  onChange: (e) => setVolunteerInfo(prev => ({ ...prev, name: e.target.value })),
                                  className: 'w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-jfc-green focus:border-transparent',
                                  placeholder: 'Name *',
                                  required: true
                                }),
                                React.createElement('input', {
                                  type: 'email',
                                  value: volunteerInfo.email,
                                  onChange: (e) => setVolunteerInfo(prev => ({ ...prev, email: e.target.value })),
                                  className: 'w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-jfc-green focus:border-transparent',
                                  placeholder: 'E-Mail *',
                                  required: true
                                })
                              ),
                              React.createElement('input', {
                                type: 'tel',
                                value: volunteerInfo.phone,
                                onChange: (e) => setVolunteerInfo(prev => ({ ...prev, phone: e.target.value })),
                                className: 'w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-jfc-green focus:border-transparent mb-2',
                                placeholder: 'Telefon (optional)'
                              }),
                              React.createElement('div', {
                                className: 'flex gap-2'
                              },
                                React.createElement('button', {
                                  onClick: () => handleRegister(shift.id),
                                  disabled: !volunteerInfo.name || !volunteerInfo.email || registrationStatus[shift.id] === 'loading',
                                  className: 'bg-jfc-green hover:bg-jfc-light-green text-white button-styled font-semibold py-1 px-3 rounded text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                                },
                                  registrationStatus[shift.id] === 'loading' ? 'Lädt...' : 'Bestätigen'
                                ),
                                React.createElement('button', {
                                  onClick: () => {
                                    setShowRegistrationForm(null);
                                    setRegistrationErrors(prev => ({ ...prev, [shift.id]: null })); // Clear error when closing
                                  },
                                  className: 'bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-1 px-3 rounded text-xs transition-colors'
                                }, 'Abbrechen')
                              )
                            )
                          : null,

                        // Show "ausgebucht" message if needed
                        shift['full?']
                          ? React.createElement('div', {
                              className: 'text-center py-1 mt-2'
                            },
                              React.createElement('p', {
                                className: 'text-gray-500 text-xs'
                              }, 'Alle Plätze sind belegt.')
                            )
                          : null
                      )
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
      ),

      // Success Dialog
      showSuccessDialog && React.createElement('div', {
        className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
        onClick: () => setShowSuccessDialog(false)
      },
        React.createElement('div', {
          className: 'bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-8 transform transition-all',
          onClick: (e) => e.stopPropagation()
        },
          React.createElement('div', {
            className: 'text-center'
          },
            React.createElement('div', {
              className: 'w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6'
            },
              React.createElement('div', {
                className: 'text-3xl'
              }, '✅')
            ),
            React.createElement('h3', {
              className: 'text-2xl font-heading font-semibold text-jfc-navy mb-4'
            }, 'Vielen Dank für Ihre Anmeldung!'),
            React.createElement('div', {
              className: 'text-left bg-jfc-light-gray rounded-lg p-4 mb-6'
            },
              React.createElement('p', {
                className: 'text-jfc-gray mb-2'
              }, React.createElement('strong', { className: 'text-jfc-navy' }, 'Helfer: '), successDialogData.volunteerName),
              React.createElement('p', {
                className: 'text-jfc-gray mb-2'
              }, React.createElement('strong', { className: 'text-jfc-navy' }, 'Veranstaltung: '), successDialogData.eventName),
              React.createElement('p', {
                className: 'text-jfc-gray mb-2'
              }, React.createElement('strong', { className: 'text-jfc-navy' }, 'Schicht: '), successDialogData.shiftName),
              React.createElement('p', {
                className: 'text-jfc-gray'
              }, React.createElement('strong', { className: 'text-jfc-navy' }, 'Zeit: '), successDialogData.shiftTime)
            ),
            React.createElement('p', {
              className: 'text-jfc-gray mb-6 text-sm leading-relaxed'
            }, 'Ihre Anmeldung wurde erfolgreich übermittelt. Sie erhalten in Kürze eine Bestätigungs-E-Mail mit allen wichtigen Informationen zu Ihrer Helferschicht.'),
            React.createElement('div', {
              className: 'flex gap-3'
            },
              React.createElement('button', {
                onClick: () => setShowSuccessDialog(false),
                className: 'flex-1 bg-jfc-green hover:bg-jfc-light-green text-white button-styled font-semibold py-3 px-6 rounded-lg transition-colors'
              }, 'Perfekt!')
            )
          )
        )
      )
    )
  );
};

export default EventDetail;
