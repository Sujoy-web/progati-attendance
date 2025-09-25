// src/services/assignApi.js
// Based on your Pydantic schema: AssignmentBase { user_id: int, card: int }

// REPLACE THESE BASE_URL AND ENDPOINTS WITH YOUR ACTUAL ONES
const BASE_URL = '/api'; // or '/api/v1' or whatever your base path is

export const assignApi = {
  // Get all RFID assignments (students with their RFID cards)
  // Returns: [{ id: 1, user_id: 123, card: 456 }, ...]
  getAssignments: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.class) params.append('class', filters.class);
    if (filters.section) params.append('section', filters.section);
    if (filters.session) params.append('session', filters.session);
    
    const response = await fetch(`${BASE_URL}/assignments?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch assignments: ${response.status}`);
    }
    return response.json();
  },

  // Get user/student list for dropdowns and table display
  // Returns: [{ id: 123, name: "Alice", roll: "01", class: "I", section: "A", session: "2025-2026" }, ...]
  getUsers: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.class) params.append('class', filters.class);
    if (filters.section) params.append('section', filters.section);
    if (filters.session) params.append('session', filters.session);
    
    const response = await fetch(`${BASE_URL}/users?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.status}`);
    }
    return response.json();
  },

  // Get dropdown options (classes, sections, sessions)
  getDropdownOptions: async () => {
    const response = await fetch(`${BASE_URL}/options`);
    if (!response.ok) {
      throw new Error(`Failed to fetch dropdown options: ${response.status}`);
    }
    return response.json();
  },

  // Create new RFID assignment (assign card to user)
  // Request body: { user_id: 123, card: 456 }
  // Returns: { id: 1, user_id: 123, card: 456 }
  createAssignment: async (userId, card) => {
    const response = await fetch(`${BASE_URL}/assignments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,  // integer from your schema
        card: card        // integer from your schema  
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to assign RFID: ${response.status} - ${JSON.stringify(errorData)}`);
    }
    return response.json();
  },

  // Update existing RFID assignment
  // Request body: { user_id: 123, card: 789 }
  // Returns: { id: 1, user_id: 123, card: 789 }
  updateAssignment: async (assignmentId, userId, card) => {
    const response = await fetch(`${BASE_URL}/assignments/${assignmentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        card: card
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to update RFID assignment: ${response.status} - ${JSON.stringify(errorData)}`);
    }
    return response.json();
  },

  // Remove RFID assignment (unassign card from user)
  deleteAssignment: async (assignmentId) => {
    const response = await fetch(`${BASE_URL}/assignments/${assignmentId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to remove RFID assignment: ${response.status}`);
    }
    return { success: true };
  },

  // Alternative: Remove assignment by user_id and card (if your backend supports it)
  deleteAssignmentByUserAndCard: async (userId, card) => {
    const response = await fetch(`${BASE_URL}/assignments`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        card: card
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to remove RFID assignment: ${response.status}`);
    }
    return { success: true };
  }
};