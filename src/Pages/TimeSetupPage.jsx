// Pages/TimeSetupPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TimeSetupPage() {
  const [setups, setSetups] = useState([]);
  const [counter, setCounter] = useState(1);
  const [openDropdown, setOpenDropdown] = useState(null); // Track which dropdown is open
  const [openSetupIds, setOpenSetupIds] = useState(new Set()); // Track which setups are open
  const [saveMessage, setSaveMessage] = useState(null); // Track save message
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 }); // Track dropdown position
  const [loadingClasses, setLoadingClasses] = useState(false); // Track loading state for classes
  const [filterDate, setFilterDate] = useState(''); // Track the selected date for filtering

  // State for classes fetched from API
  const [classOptions, setClassOptions] = useState([]);

  // Weekdays for schedule table
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Fetch classes from API when component mounts
  useEffect(() => {
    fetchClasses();
  }, []);

  // Close dropdown when clicking outside
  const dropdownRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
        // Reset dropdown position when closing
        setDropdownPosition({ top: 0, left: 0, width: 0 });
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Function to fetch classes from API
  const fetchClasses = async () => {
    setLoadingClasses(true);
    try {
      // In a real application, this would be your actual API call
      // const response = await fetch('/api/classes');
      // const data = await response.json();
      // setClassOptions(data);

      // For now, using mock data, replace this with your actual API call
      const mockClasses = [
        { value: 'class-I', label: 'I' },
        { value: 'class-II', label: 'II' },
        { value: 'class-III', label: 'III' },
        { value: 'class-IV', label: 'IV' },
        { value: 'class-V', label: 'V' }
      ];
      
      setClassOptions(mockClasses);
    } catch (error) {
      console.error('Error fetching classes:', error);
      // Handle error appropriately
    } finally {
      setLoadingClasses(false);
    }
  };

  const addNewSetup = () => {
    const newSetup = {
      id: Date.now(), // Unique ID for the setup
      name: `Setup ${counter}`,
      selectedClasses: [], // Changed to an array for multiple classes
      startDate: '',
      endDate: '',
      isEditingName: false,
      loading: false,
      showScheduleTable: false, // Added to control table visibility
      showMainScheduleTable: false, // Added to control main schedule table visibility
      scheduleData: weekdays.map(weekday => ({
        day: weekday,
        endTime: '',
        outTime: '',
        isOffDay: false
      }))
    };
    setSetups([...setups, newSetup]);
    setCounter(counter + 1);
  };

  const handleNameChange = (id, newName) => {
    setSetups(setups.map(setup => 
      setup.id === id ? { ...setup, name: newName } : setup
    ));
  };

  const toggleEditName = (id) => {
    setSetups(setups.map(setup => 
      setup.id === id ? { ...setup, isEditingName: !setup.isEditingName } : setup
    ));
  };

  const deleteSetup = (id) => {
    setSetups(setups.filter(setup => setup.id !== id));
  };

  const handleGenerateSchedule = async (id) => {
    setSetups(setups.map(setup => {
      if (setup.id === id) {
        // Basic validation
        if (setup.selectedClasses.length === 0 || !setup.startDate || !setup.endDate) {
          alert('Please select at least one class and fill in all fields for this setup');
          return setup;
        }

        // Show the schedule table after successful generation
        return { ...setup, loading: true, showScheduleTable: true };
      }
      return setup;
    }));

    try {
      // In a real application, you would make an API call here
      // const response = await fetch(`/api/time-setup/${id}/generate`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     id,
      //     selectedClasses: setups.find(s => s.id === id).selectedClasses,
      //     startDate: setups.find(s => s.id === id).startDate,
      //     endDate: setups.find(s => s.id === id).endDate
      //   }),
      // });

      // if (response.ok) {
      //   const result = await response.json();
      //   // Update state with the result
      // } else {
      //   throw new Error('Failed to generate schedule');
      // }

      // Simulate API call after a short delay
      setTimeout(() => {
        setSetups(prevSetups => 
          prevSetups.map(setup => 
            setup.id === id 
              ? { ...setup, loading: false } 
              : setup
          )
        );
        alert('Schedule generated successfully! Schedule table is now visible.');
        setOpenDropdown(null); // Close dropdown after generation
      }, 1000);
    } catch (error) {
      console.error('Error generating schedule:', error);
      setSetups(prevSetups => 
        prevSetups.map(setup => 
          setup.id === id 
            ? { ...setup, loading: false } 
            : setup
        )
      );
      alert('Error generating schedule. Please try again.');
    }
  };

  const updateSetupField = (id, field, value) => {
    setSetups(setups.map(setup => 
      setup.id === id ? { ...setup, [field]: value } : setup
    ));
  };

  // Handle class selection for a specific setup
  const handleClassSelection = (setupId, classValue) => {
    setSetups(setups.map(setup => {
      if (setup.id === setupId) {
        const isSelected = setup.selectedClasses.includes(classValue);
        if (isSelected) {
          // Remove the class if already selected
          return {
            ...setup,
            selectedClasses: setup.selectedClasses.filter(c => c !== classValue)
          };
        } else {
          // Add the class if not selected
          return {
            ...setup,
            selectedClasses: [...setup.selectedClasses, classValue]
          };
        }
      }
      return setup;
    }));
  };

  // Update schedule data for a specific day
  const updateScheduleData = (setupId, day, field, value) => {
    setSetups(setups.map(setup => {
      if (setup.id === setupId) {
        const updatedScheduleData = setup.scheduleData.map(item => {
          if (item.day === day) {
            // If setting as off day, clear the time fields
            if (field === 'isOffDay' && value) {
              return { ...item, [field]: value, endTime: '', outTime: '' };
            }
            return { ...item, [field]: value };
          }
          return item;
        });
        return { ...setup, scheduleData: updatedScheduleData };
      }
      return setup;
    }));
  };

  // Update times for all days based on Monday's time (when changing Monday)
  const updateScheduleDataSynced = (setupId, day, field, value) => {
    setSetups(setups.map(setup => {
      if (setup.id === setupId) {
        // If it's Monday and we're changing a time field, update all days
        if (day === 'Monday' && (field === 'endTime' || field === 'outTime')) {
          const updatedScheduleData = setup.scheduleData.map(item => {
            // For the selected day (Monday), update normally
            if (item.day === day) {
              return { ...item, [field]: value };
            }
            // For other days, update only the specific field if it's not an off day
            return item.isOffDay ? item : { ...item, [field]: value };
          });
          return { ...setup, scheduleData: updatedScheduleData };
        } 
        // If it's not Monday, update just the specific day
        else if (day !== 'Monday' && (field === 'endTime' || field === 'outTime')) {
          const updatedScheduleData = setup.scheduleData.map(item => {
            if (item.day === day) {
              return { ...item, [field]: value };
            }
            return item;
          });
          return { ...setup, scheduleData: updatedScheduleData };
        }
        // Handle off day toggling
        else if (field === 'isOffDay') {
          const updatedScheduleData = setup.scheduleData.map(item => {
            if (item.day === day) {
              // If setting as off day, clear the time fields
              if (value) {
                return { ...item, [field]: value, endTime: '', outTime: '' };
              }
              return { ...item, [field]: value };
            }
            return item;
          });
          return { ...setup, scheduleData: updatedScheduleData };
        }
      }
      return setup;
    }));
  };

  // Generate main schedule table to show the final result
  const generateMainScheduleTable = async (id) => {
    setSetups(prevSetups => {
      const updatedSetups = prevSetups.map(setup => {
        if (setup.id === id) {
          // Create a deep copy of schedule data for the preview schedule
          const dateRange = generateDateRange(setup.startDate, setup.endDate, setup.scheduleData);
          const previewScheduleData = dateRange.map(item => ({
            ...item,
            identifier: item.date, // Original items use date as identifier
            isDuplicate: false
          }));
          
          return { 
            ...setup, 
            showMainScheduleTable: true,
            previewScheduleData: previewScheduleData
          };
        }
        return setup;
      });
      
      return updatedSetups;
    });
    
    // In a real application, you would make an API call to save the generated schedule
    try {
      // Example API call for generating the main schedule
      // const response = await fetch(`/api/time-setup/${id}/generate`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     setupId: id,
      //     previewData: dateRange
      //   }),
      // });
      // 
      // if (!response.ok) {
      //   throw new Error('Failed to generate schedule');
      // }
    } catch (error) {
      console.error('Error generating schedule:', error);
      // You might want to show an error message to the user
    }
  };

  // Update preview schedule data for a specific date
  const updatePreviewScheduleData = async (setupId, identifier, field, value) => {
    setSetups(prevSetups => {
      const updatedSetups = prevSetups.map(setup => {
        if (setup.id === setupId) {
          const updatedPreviewData = setup.previewScheduleData.map(item => {
            // Update both original dates and duplicates based on identifier
            if (item.identifier === identifier || 
                (!item.isDuplicate && item.date === identifier)) {
              // If setting as off day, clear the time fields
              if (field === 'isOffDay' && value) {
                return { ...item, [field]: value, endTime: '', outTime: '' };
              }
              return { ...item, [field]: value };
            }
            return item;
          });
          
          return { ...setup, previewScheduleData: updatedPreviewData };
        }
        return setup;
      });
      
      return updatedSetups;
    });
    
    // In a real application, you would make an API call to update the specific schedule item
    try {
      // Example API call for updating individual schedule item
      // const response = await fetch(`/api/schedule/${setupId}`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     setupId,
      //     identifier,
      //     field,
      //     value
      //   }),
      // });
      // 
      // if (!response.ok) {
      //   throw new Error('Failed to update schedule');
      // }
    } catch (error) {
      console.error('Error updating schedule:', error);
      // You might want to show an error message to the user
    }
  };

  // Duplicate a date for a specific class
  const duplicateDateForClass = async (setupId, dateItem, selectedClass) => {
    if (!selectedClass) return; // If no class selected, do nothing
    
    setSetups(prevSetups => {
      const updatedSetups = prevSetups.map(setup => {
        if (setup.id === setupId) {
          // Create a duplicate of the date item for the selected class
          const duplicateItem = {
            ...dateItem,
            isDuplicate: true,
            originalDate: dateItem.date,
            class: selectedClass,
            identifier: `${dateItem.date}-${selectedClass}-${Date.now()}` // Unique identifier for the duplicate
          };
          
          const updatedPreviewData = [...setup.previewScheduleData, duplicateItem];
          return { ...setup, previewScheduleData: updatedPreviewData };
        }
        return setup;
      });
      
      return updatedSetups;
    });
    
    // In a real application, you would make an API call to create the duplicate
    try {
      // Example API call for duplicating a date for a specific class
      // const response = await fetch(`/api/schedule/duplicate`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     setupId,
      //     dateItem,
      //     selectedClass
      //   }),
      // });
      // 
      // if (!response.ok) {
      //   throw new Error('Failed to duplicate date');
      // }
    } catch (error) {
      console.error('Error duplicating date:', error);
      // You might want to show an error message to the user
    }
  };

  // Delete a duplicated date
  const deleteDuplicateDate = async (setupId, identifier) => {
    setSetups(prevSetups => {
      const updatedSetups = prevSetups.map(setup => {
        if (setup.id === setupId) {
          const updatedPreviewData = setup.previewScheduleData.filter(item => 
            item.identifier !== identifier
          );
          
          return { ...setup, previewScheduleData: updatedPreviewData };
        }
        return setup;
      });
      
      return updatedSetups;
    });
    
    // In a real application, you would make an API call to delete the duplicate
    try {
      // Example API call for deleting a duplicate date
      // const response = await fetch(`/api/schedule/${identifier}`, {
      //   method: 'DELETE',
      // });
      // 
      // if (!response.ok) {
      //   throw new Error('Failed to delete date');
      // }
    } catch (error) {
      console.error('Error deleting date:', error);
      // You might want to show an error message to the user
    }
  };

  // Determine available classes for a specific setup
  const getAvailableClassesForSetup = (currentSetupId) => {
    const allSelectedClasses = setups
      .filter(setup => setup.id !== currentSetupId)
      .flatMap(setup => setup.selectedClasses);
    return classOptions.filter(option => !allSelectedClasses.includes(option.value));
  };

  // Toggle the dropdown for a specific setup
  const toggleDropdown = (setupId) => {
    if (openDropdown === setupId) {
      setOpenDropdown(null);
    } else {
      // Calculate position for the dropdown
      const dropdownElement = document.getElementById(`class-dropdown-${setupId}`);
      if (dropdownElement) {
        const rect = dropdownElement.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        setDropdownPosition({
          top: rect.bottom + scrollTop,
          left: rect.left + scrollLeft,
          width: rect.width
        });
      }
      setOpenDropdown(setupId);
    }
  };

  // Function to generate dates between start and end date
  const generateDateRange = (startDate, endDate, scheduleData) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const date = new Date(start);
    const dates = [];
    
    while (date <= end) {
      // Adjust for JavaScript's day numbering (Sunday = 0, Monday = 1, etc.)
      // Our weekdays array starts with Monday = 0, Tuesday = 1, etc.
      const dayIndex = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      let dayName;
      
      if (dayIndex === 0) { // Sunday
        dayName = weekdays[6]; // Map Sunday to the last day in our array (Sunday)
      } else {
        dayName = weekdays[dayIndex - 1]; // Monday = 0, Tuesday = 1, etc.
      }
      
      const daySchedule = scheduleData.find(d => d.day === dayName) || { isOffDay: false, endTime: '', outTime: '' };
      
      dates.push({
        date: date.toISOString().split('T')[0],
        day: dayName,
        isOffDay: daySchedule.isOffDay,
        endTime: daySchedule.endTime,
        outTime: daySchedule.outTime
      });
      date.setDate(date.getDate() + 1);
    }
    
    return dates;
  };

  // Function to toggle setup visibility
  const toggleSetup = (setupId) => {
    setOpenSetupIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(setupId)) {
        newSet.delete(setupId);
      } else {
        newSet.add(setupId);
      }
      return newSet;
    });
  };

  // Function to download all setups as JSON
  const downloadAllSetups = () => {
    const setupsToDownload = setups
      .filter(setup => setup.showMainScheduleTable) // Only include setups that have preview schedules
      .map(setup => {
        return {
          id: setup.id,
          name: setup.name,
          selectedClasses: setup.selectedClasses,
          startDate: setup.startDate,
          endDate: setup.endDate,
          previewScheduleData: setup.previewScheduleData,
          // Include all fields that should be part of the schedule
        };
      });

    const dataStr = JSON.stringify(setupsToDownload, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'time_setups.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Function to save all setups
  const saveAllSetups = async () => {
    try {
      // Prepare the data to send to the API
      const setupsToSave = setups
        .filter(setup => setup.showMainScheduleTable) // Only include setups that have preview schedules
        .map(setup => {
          return {
            id: setup.id,
            name: setup.name,
            selectedClasses: setup.selectedClasses,
            startDate: setup.startDate,
            endDate: setup.endDate,
            previewScheduleData: setup.previewScheduleData,
            // Add any additional fields that your API expects
          };
        });

      if (setupsToSave.length === 0) {
        setSaveMessage("No setups to save!");
        setTimeout(() => setSaveMessage(null), 3000);
        return;
      }

      // In a real application, this would be your actual API call
      // const response = await fetch('/api/time-setup', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(setupsToSave),
      // });

      // if (response.ok) {
      //   setSaveMessage("All setups saved successfully!");
      // } else {
      //   const errorData = await response.json();
      //   setSaveMessage(`Error: ${errorData.message || 'Failed to save setups'}`);
      // }

      // For now, using mock success, replace with your actual API call
      console.log('Saving setups:', setupsToSave);
      setSaveMessage("All setups saved successfully!");
      
    } catch (error) {
      console.error('Error saving setups:', error);
      setSaveMessage(`Error: ${error.message || 'Failed to save setups'}`);
    } finally {
      // Clear the message after 3 seconds
      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);
    }
  };

  // Function to print all setups
  const printAllSetups = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    const printDocument = printWindow.document;

    // Build HTML content for printing
    let printContent = `
      <html>
        <head>
          <title>Time Setup Schedules</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .setup { margin-bottom: 30px; page-break-inside: avoid; }
            .setup-header { background-color: #f0f0f0; padding: 10px; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            @media print {
              body { -webkit-print-color-adjust: exact; color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <h1>Time Setup Schedules</h1>
    `;

    // Add each setup to the print content
    setups
      .filter(setup => setup.showMainScheduleTable) // Only include setups that have preview schedules
      .forEach(setup => {
        const classLabels = setup.selectedClasses.map(value => {
          const classOption = classOptions.find(opt => opt.value === value);
          return classOption ? classOption.label : '';
        }).join(', ');

        printContent += `
          <div class="setup">
            <div class="setup-header">
              <h2>${setup.name}</h2>
              <p><strong>Classes:</strong> ${classLabels}</p>
              <p><strong>Period:</strong> ${setup.startDate} to ${setup.endDate}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>SL</th>
                  <th>Date</th>
                  <th>Day</th>
                  <th>End Time to In</th>
                  <th>Start Out Time</th>
                  <th>Off Day/Holiday</th>
                  <th>Class</th>
                </tr>
              </thead>
              <tbody>
        `;

        if (setup.previewScheduleData) {
          setup.previewScheduleData.forEach((dateItem, index) => {
            printContent += `
              <tr ${dateItem.isOffDay ? 'style="background-color: #ffebee;"' : ''}>
                <td>${index + 1}</td>
                <td>${dateItem.date}</td>
                <td>${dateItem.day}</td>
                <td>${dateItem.endTime}</td>
                <td>${dateItem.outTime}</td>
                <td>${dateItem.isOffDay ? 'Yes' : 'No'}</td>
                <td>${dateItem.class || (dateItem.isDuplicate ? 'Duplicate' : 'All Classes')}</td>
              </tr>
            `;
          });
        }

        printContent += `
              </tbody>
            </table>
          </div>
        `;
      });

    printContent += `
        </body>
      </html>
    `;

    // Write the content to the print window and print
    printDocument.write(printContent);
    printDocument.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-gray-100">
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Time Setup</h1>
        <p className="text-gray-400">Configure time schedules for attendance tracking</p>
      </div>

      {/* Buttons for setup management */}
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <button
          onClick={addNewSetup}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
        >
          Add Setup
        </button>
        <button
          onClick={saveAllSetups}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors"
        >
          Save All Setup
        </button>
        <button
          onClick={printAllSetups}
          className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded transition-colors"
        >
          Print
        </button>
        <button
          onClick={downloadAllSetups}
          className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition-colors"
        >
          Download
        </button>
      </div>

      <div ref={dropdownRef}>
        {/* Save message */}
        {saveMessage && (
          <div className="fixed top-4 right-4 z-50 p-4 bg-green-700 text-white rounded-lg shadow-lg">
            {saveMessage}
          </div>
        )}

        {/* List of setups */}
        <div className="space-y-6 relative z-30">
          {setups.map((setup) => {
            const availableClasses = getAvailableClassesForSetup(setup.id);
            const isSetupOpen = openSetupIds.has(setup.id);
            
            return (
              <div key={setup.id} className="bg-gray-800 rounded-lg overflow-hidden">
                <div 
                  className="flex justify-between items-center p-4 cursor-pointer bg-gray-700"
                  onClick={() => toggleSetup(setup.id)}
                >
                  <div className="flex items-center">
                    {setup.isEditingName ? (
                      <input
                        type="text"
                        value={setup.name}
                        onChange={(e) => handleNameChange(setup.id, e.target.value)}
                        onBlur={() => toggleEditName(setup.id)}
                        onKeyDown={(e) => e.key === 'Enter' && toggleEditName(setup.id)}
                        className="bg-gray-600 text-white p-1 rounded border border-gray-500 mr-2"
                        autoFocus
                      />
                    ) : (
                      <h3 
                        className="text-lg font-semibold text-white cursor-pointer hover:text-blue-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleEditName(setup.id);
                        }}
                      >
                        {setup.name}
                      </h3>
                    )}
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSetup(setup.id);
                      }}
                      className="text-red-500 hover:text-red-700 transition-colors mr-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <svg 
                      className={`w-5 h-5 text-gray-400 transform ${isSetupOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>

                {/* Collapsible content */}
                {isSetupOpen && (
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-300 mb-1">Select Classes</label>
                        
                        {/* Custom dropdown that looks like input */}
                        <div 
                          id={`class-dropdown-${setup.id}`}
                          className="w-full p-2 rounded bg-gray-600 border border-gray-500 text-white cursor-pointer flex justify-between items-center"
                          onClick={() => toggleDropdown(setup.id)}
                        >
                          <span>
                            {setup.selectedClasses.length > 0 
                              ? setup.selectedClasses.map(value => {
                                  const classOption = classOptions.find(opt => opt.value === value);
                                  return classOption ? classOption.label : '';
                                }).join(', ')
                              : "Choose classes"}
                          </span>
                          <svg 
                            className={`w-4 h-4 ml-2 transform ${openDropdown === setup.id ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24" 
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                          </svg>
                        </div>
                        
                        {/* Dropdown with checkboxes - shown only when this setup's dropdown is open */}
                        {openDropdown === setup.id && (
                          <div className="fixed z-[9999] w-[260px] bg-gray-600 border border-gray-500 rounded shadow-lg max-h-60 overflow-y-auto" 
                            style={{ 
                              top: `${dropdownPosition.top}px`, 
                              left: `${dropdownPosition.left}px`,
                              width: `${dropdownPosition.width}px`
                            }}>
                            {availableClasses.map(option => {
                              const isSelected = setup.selectedClasses.includes(option.value);
                              
                              return (
                                <div 
                                  key={option.value} 
                                  className="flex items-center p-2 hover:bg-gray-500"
                                >
                                  <input
                                    type="checkbox"
                                    id={`class-${setup.id}-${option.value}`}
                                    checked={isSelected}
                                    onChange={() => handleClassSelection(setup.id, option.value)}
                                    className="mr-2 h-4 w-4 text-blue-600 bg-gray-700 border-gray-500 rounded focus:ring-blue-500"
                                  />
                                  <label 
                                    htmlFor={`class-${setup.id}-${option.value}`}
                                    className="text-sm text-white flex-1"
                                  >
                                    {option.label}
                                  </label>
                                </div>
                              );
                            })}
                            {/* Show already selected classes in other setups as disabled */}
                            {classOptions
                              .filter(option => !availableClasses.some(avail => avail.value === option.value))
                              .map(option => (
                                <div 
                                  key={option.value} 
                                  className="flex items-center p-2 text-gray-400"
                                >
                                  <input
                                    type="checkbox"
                                    id={`class-${setup.id}-${option.value}-disabled`}
                                    checked={false}
                                    disabled
                                    className="mr-2 h-4 w-4 text-gray-400 bg-gray-700 border-gray-500 rounded"
                                  />
                                  <label 
                                    htmlFor={`class-${setup.id}-${option.value}-disabled`}
                                    className="text-sm text-gray-400 flex-1"
                                  >
                                    {option.label} (Selected)
                                  </label>
                                </div>
                              ))
                            }
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={setup.startDate}
                          onChange={(e) => updateSetupField(setup.id, 'startDate', e.target.value)}
                          className="w-full p-2 rounded bg-gray-600 border border-gray-500 text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                        <input
                          type="date"
                          value={setup.endDate}
                          onChange={(e) => updateSetupField(setup.id, 'endDate', e.target.value)}
                          className="w-full p-2 rounded bg-gray-600 border border-gray-500 text-white"
                        />
                      </div>

                      <div className="flex items-end">
                        <button
                          onClick={() => handleGenerateSchedule(setup.id)}
                          disabled={setup.loading}
                          className={`w-full py-2 px-4 rounded transition-colors ${
                            setup.loading 
                              ? 'bg-gray-500 cursor-not-allowed' 
                              : 'bg-green-600 hover:bg-green-700'
                          } text-white`}
                        >
                          {setup.loading ? 'Generating...' : 'Generate'}
                        </button>
                      </div>
                    </div>

                    {/* Schedule Table - shown after clicking Generate */}
                    {setup.showScheduleTable && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold text-white mb-3">Schedule Table</h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full border-collapse border border-gray-500 rounded-lg bg-gray-600">
                            <thead>
                              <tr className="border-b border-gray-500">
                                <th className="py-2 px-4 text-left text-sm font-medium text-gray-300 border border-gray-500">Day</th>
                                <th className="py-2 px-4 text-left text-sm font-medium text-gray-300 border border-gray-500">End Time</th>
                                <th className="py-2 px-4 text-left text-sm font-medium text-gray-300 border border-gray-500">Out Time</th>
                                <th className="py-2 px-4 text-left text-sm font-medium text-gray-300 border border-gray-500">Off Day</th>
                              </tr>
                            </thead>
                            <tbody>
                              {setup.scheduleData.map((dayData, index) => (
                                <tr 
                                  key={index} 
                                  className={`border-b border-gray-500 hover:bg-gray-550 ${dayData.isOffDay ? 'bg-red-900 bg-opacity-30' : ''}`}
                                >
                                  <td className={`py-2 px-4 text-sm ${dayData.isOffDay ? 'text-red-300' : 'text-gray-200'} border border-gray-500`}>
                                    {dayData.day}
                                  </td>
                                  <td className="py-2 px-4 border border-gray-500">
                                    <input
                                      type="time"
                                      value={dayData.endTime}
                                      onChange={(e) => 
                                        dayData.day === 'Monday' 
                                          ? updateScheduleDataSynced(setup.id, dayData.day, 'endTime', e.target.value)
                                          : updateScheduleData(setup.id, dayData.day, 'endTime', e.target.value)
                                      }
                                      disabled={dayData.isOffDay}
                                      className="w-full p-1 rounded bg-gray-700 border border-gray-500 text-white text-sm"
                                    />
                                  </td>
                                  <td className="py-2 px-4 border border-gray-500">
                                    <input
                                      type="time"
                                      value={dayData.outTime}
                                      onChange={(e) => 
                                        dayData.day === 'Monday' 
                                          ? updateScheduleDataSynced(setup.id, dayData.day, 'outTime', e.target.value)
                                          : updateScheduleData(setup.id, dayData.day, 'outTime', e.target.value)
                                      }
                                      disabled={dayData.isOffDay}
                                      className="w-full p-1 rounded bg-gray-700 border border-gray-500 text-white text-sm"
                                    />
                                  </td>
                                  <td className="py-2 px-4 border border-gray-500">
                                    <input
                                      type="checkbox"
                                      checked={dayData.isOffDay}
                                      onChange={(e) => updateScheduleData(setup.id, dayData.day, 'isOffDay', e.target.checked)}
                                      className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-500 rounded focus:ring-blue-500"
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        
                        {/* Generate Schedule Button - for scheduling once table is filled */}
                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={() => generateMainScheduleTable(setup.id)}
                            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors"
                          >
                            Generate Schedule
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Preview Schedule Table - shown after clicking Generate Schedule */}
                    {setup.showMainScheduleTable && (
                      <div className="mt-8 bg-gray-700 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold text-white">
                            Preview Schedule for Classes: {setup.selectedClasses.map(value => {
                              const classOption = classOptions.find(opt => opt.value === value);
                              return classOption ? classOption.label : '';
                            }).join(', ')}
                          </h3>
                          <div className="flex items-center">
                            <label className="text-sm text-gray-300 mr-2">Filter by Date:</label>
                            <input
                              type="date"
                              value={filterDate}
                              onChange={(e) => setFilterDate(e.target.value)}
                              className="p-1 rounded bg-gray-600 border border-gray-500 text-white text-sm mr-2"
                            />
                            <button 
                              onClick={() => setFilterDate('')}
                              className="bg-gray-600 hover:bg-gray-700 text-white py-1 px-2 rounded text-sm transition-colors mr-2"
                            >
                              Clear
                            </button>
                            <button className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm transition-colors">
                              Save
                            </button>
                          </div>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="min-w-full border-collapse border border-gray-500 rounded-lg bg-gray-600">
                            <thead>
                              <tr className="border-b border-gray-500 bg-gray-700">
                                <th className="py-2 px-4 text-left text-sm font-medium text-gray-300 border border-gray-500">SL</th>
                                <th className="py-2 px-4 text-left text-sm font-medium text-gray-300 border border-gray-500">Date</th>
                                <th className="py-2 px-4 text-left text-sm font-medium text-gray-300 border border-gray-500">Day</th>
                                <th className="py-2 px-4 text-left text-sm font-medium text-gray-300 border border-gray-500">End Time to In</th>
                                <th className="py-2 px-4 text-left text-sm font-medium text-gray-300 border border-gray-500">Start Out Time</th>
                                <th className="py-2 px-4 text-left text-sm font-medium text-gray-300 border border-gray-500">Off Day/Holiday</th>
                                <th className="py-2 px-4 text-left text-sm font-medium text-gray-300 border border-gray-500">Class</th>
                                <th className="py-2 px-4 text-left text-sm font-medium text-gray-300 border border-gray-500">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {setup.previewScheduleData && 
                                setup.previewScheduleData
                                  .filter(dateItem => !filterDate || dateItem.date === filterDate)
                                  .map((dateItem, index) => (
                                <tr 
                                  key={`${dateItem.date}-${index}`} 
                                  className={`border-b border-gray-500 hover:bg-gray-550 ${dateItem.isOffDay ? 'bg-red-900 bg-opacity-30' : ''}`}
                                >
                                  <td className={`py-2 px-4 border border-gray-500 ${dateItem.isOffDay ? 'text-red-300' : 'text-gray-200'}`}>
                                    {index + 1}
                                  </td>
                                  <td className={`py-2 px-4 border border-gray-500 ${dateItem.isOffDay ? 'text-red-300' : 'text-gray-200'}`}>
                                    {dateItem.date}
                                  </td>
                                  <td className={`py-2 px-4 border border-gray-500 ${dateItem.isOffDay ? 'text-red-300' : 'text-gray-200'}`}>
                                    {dateItem.day}
                                  </td>
                                  <td className="py-2 px-4 border border-gray-500">
                                    <input
                                      type="time"
                                      value={dateItem.endTime}
                                      onChange={(e) => updatePreviewScheduleData(setup.id, dateItem.identifier || dateItem.date, 'endTime', e.target.value)}
                                      disabled={dateItem.isOffDay}
                                      className="w-full p-1 rounded bg-gray-700 border border-gray-500 text-white text-sm"
                                    />
                                  </td>
                                  <td className="py-2 px-4 border border-gray-500">
                                    <input
                                      type="time"
                                      value={dateItem.outTime}
                                      onChange={(e) => updatePreviewScheduleData(setup.id, dateItem.identifier || dateItem.date, 'outTime', e.target.value)}
                                      disabled={dateItem.isOffDay}
                                      className="w-full p-1 rounded bg-gray-700 border border-gray-500 text-white text-sm"
                                    />
                                  </td>
                                  <td className="py-2 px-4 border border-gray-500">
                                    <input
                                      type="checkbox"
                                      checked={dateItem.isOffDay}
                                      onChange={(e) => updatePreviewScheduleData(setup.id, dateItem.identifier || dateItem.date, 'isOffDay', e.target.checked)}
                                      className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-500 rounded focus:ring-blue-500"
                                    />
                                  </td>
                                  <td className="py-2 px-4 border border-gray-500">
                                    <select
                                      className="w-full p-1 rounded bg-gray-700 border border-gray-500 text-white text-sm"
                                      onChange={(e) => duplicateDateForClass(setup.id, dateItem, e.target.value)}
                                      value=""
                                    >
                                      <option value="">Select Class</option>
                                      {setup.selectedClasses.map(value => {
                                        const classOption = classOptions.find(opt => opt.value === value);
                                        return (
                                          <option key={value} value={value}>
                                            {classOption ? classOption.label : ''}
                                          </option>
                                        );
                                      })}
                                    </select>
                                  </td>
                                  <td className="py-2 px-4 border border-gray-500">
                                    {dateItem.isDuplicate ? (
                                      <button 
                                        className="text-red-500 hover:text-red-300 text-sm"
                                        onClick={() => deleteDuplicateDate(setup.id, dateItem.identifier)}
                                      >
                                        Delete
                                      </button>
                                    ) : (
                                      <span className="text-gray-500">-</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
