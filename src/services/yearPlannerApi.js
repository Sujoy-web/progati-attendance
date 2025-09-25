// services/yearPlanner.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';


// Fetch sessions from backend
export const fetchSessions = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/sessions`);
    if (!response.ok) {
      throw new Error('Failed to fetch sessions');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching sessions:', error);
    throw error;
  }
};

// Fetch holidays from backend
export const fetchHolidays = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/holidays`);
    if (!response.ok) {
      throw new Error('Failed to fetch holidays');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching holidays:', error);
    throw error;
  }
};

// Create new holiday
export const createHoliday = async (holidayData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/holidays`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(holidayData),
    });
    if (!response.ok) {
      throw new Error('Failed to create holiday');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating holiday:', error);
    throw error;
  }
};

// Update existing holiday
export const updateHoliday = async (id, holidayData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/holidays/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(holidayData),
    });
    if (!response.ok) {
      throw new Error('Failed to update holiday');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating holiday:', error);
    throw error;
  }
};

// Delete holiday
export const deleteHoliday = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/holidays/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete holiday');
    }
    return true;
  } catch (error) {
    console.error('Error deleting holiday:', error);
    throw error;
  }
};

// Toggle holiday active status
export const toggleHolidayStatus = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/holidays/${id}/toggle-status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to toggle holiday status');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error toggling holiday status:', error);
    throw error;
  }
};