// src/services/assignApi.js
// Configuration for fallback to mock data if real API fails
const USE_MOCK_DATA_ON_ERROR = true; // Set to true to use mock data when real API fails

// Mock data for demo purposes - 5 students exactly
const mockClasses = ['I', 'II', 'III', 'IV', 'V'];
const mockSections = ['A', 'B'];
const mockSessions = ['2024-2025', '2025-2026'];

// Define exactly 5 mock students with initial state
let mockStudents = [
  {
    id: 1,
    name: 'John Smith',
    roll: '01',
    adm: 'ADM000001',
    class: 'I',
    section: 'A',
    session: '2024-2025',
    rfid: '1001', // Some students have RFID already assigned
    uniqueId: 'I-A-1'
  },
  {
    id: 2,
    name: 'Emily Johnson',
    roll: '02',
    adm: 'ADM000002',
    class: 'II',
    section: 'B',
    session: '2024-2025',
    rfid: '', // This student doesn't have RFID yet
    uniqueId: 'II-B-2'
  },
  {
    id: 3,
    name: 'Michael Brown',
    roll: '03',
    adm: 'ADM000003',
    class: 'III',
    section: 'A',
    session: '2025-2026',
    rfid: '3003', // Another assigned RFID
    uniqueId: 'III-A-3'
  },
  {
    id: 4,
    name: 'Sarah Davis',
    roll: '04',
    adm: 'ADM000004',
    class: 'IV',
    section: 'A',
    session: '2024-2025',
    rfid: '', // Unassigned
    uniqueId: 'IV-A-4'
  },
  {
    id: 5,
    name: 'Robert Wilson',
    roll: '05',
    adm: 'ADM000005',
    class: 'V',
    section: 'B',
    session: '2025-2026',
    rfid: '', // Unassigned
    uniqueId: 'V-B-5'
  }
];

// Mock API implementation
const mockAssignApi = {
  // Get dropdown options (classes, sections, sessions)
  getDropdownOptions: async () => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          classes: mockClasses,
          sections: mockSections,
          sessions: mockSessions
        });
      }, 300); // Simulate network delay
    });
  },

  // Get students with optional filters
  getStudents: async (classSel, sectionSel, sessionSel) => {
    return new Promise(resolve => {
      setTimeout(() => {
        let filtered = [...mockStudents];
        
        if (classSel) {
          filtered = filtered.filter(s => s.class === classSel);
        }
        if (sectionSel) {
          filtered = filtered.filter(s => s.section === sectionSel);
        }
        if (sessionSel) {
          filtered = filtered.filter(s => s.session === sessionSel);
        }
        
        resolve(filtered);
      }, 500); // Simulate network delay
    });
  },

  // Assign RFID to student
  assignRfidToStudent: async (student, rfid) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Update the mock data
        const index = mockStudents.findIndex(s => 
          s.uniqueId === `${student.class}-${student.section}-${student.id}`
        );
        
        if (index !== -1) {
          mockStudents[index].rfid = rfid;
          resolve({ ...mockStudents[index] });
        } else {
          reject(new Error('Student not found'));
        }
      }, 300); // Simulate network delay
    });
  },

  // Remove RFID from student
  removeRfidFromStudent: async (student) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Update the mock data
        const index = mockStudents.findIndex(s => 
          s.uniqueId === `${student.class}-${student.section}-${student.id}`
        );
        
        if (index !== -1) {
          mockStudents[index].rfid = '';
          resolve({ ...mockStudents[index] });
        } else {
          reject(new Error('Student not found'));
        }
      }, 300); // Simulate network delay
    });
  }
};

// Real API implementation
const realAssignApi = {
  // Get dropdown options (classes, sections, sessions)
  getDropdownOptions: async () => {
    const BASE_URL = import.meta.env.VITE_API_URL || '/api';
    try {
      const response = await fetch(`${BASE_URL}/options`);
      if (!response.ok) {
        throw new Error(`Failed to fetch dropdown options: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Real API error in getDropdownOptions:', error);
      if (USE_MOCK_DATA_ON_ERROR) {
        return mockAssignApi.getDropdownOptions();
      } else {
        throw error;
      }
    }
  },

  // Get students with filters
  getStudents: async (classSel, sectionSel, sessionSel) => {
    const BASE_URL = import.meta.env.VITE_API_URL || '/api';
    try {
      const params = new URLSearchParams();
      if (classSel) params.append('class', classSel);
      if (sectionSel) params.append('section', sectionSel);
      if (sessionSel) params.append('session', sessionSel);
      
      const response = await fetch(`${BASE_URL}/students?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch students: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Real API error in getStudents:', error);
      if (USE_MOCK_DATA_ON_ERROR) {
        // For mock data, we'll return all students and filter client-side
        const allStudents = await mockAssignApi.getStudents('', '', '');
        return allStudents.filter(student => {
          return (!classSel || student.class === classSel) && 
                 (!sectionSel || student.section === sectionSel) && 
                 (!sessionSel || student.session === sessionSel);
        });
      } else {
        throw error;
      }
    }
  },

  // Assign RFID to student
  assignRfidToStudent: async (student, rfid) => {
    const BASE_URL = import.meta.env.VITE_API_URL || '/api';
    try {
      const response = await fetch(`${BASE_URL}/rfid/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: student.id,
          rfid: rfid
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to assign RFID: ${response.status} - ${JSON.stringify(errorData)}`);
      }
      return response.json();
    } catch (error) {
      console.error('Real API error in assignRfidToStudent:', error);
      if (USE_MOCK_DATA_ON_ERROR) {
        // Mock assignment - just return the student with updated RFID
        return mockAssignApi.assignRfidToStudent(student, rfid);
      } else {
        throw error;
      }
    }
  },

  // Remove RFID from student
  removeRfidFromStudent: async (student) => {
    const BASE_URL = import.meta.env.VITE_API_URL || '/api';
    try {
      const response = await fetch(`${BASE_URL}/rfid/remove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: student.id
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to remove RFID: ${response.status} - ${JSON.stringify(errorData)}`);
      }
      return response.json();
    } catch (error) {
      console.error('Real API error in removeRfidFromStudent:', error);
      if (USE_MOCK_DATA_ON_ERROR) {
        // Mock removal - just return the student with empty RFID
        return mockAssignApi.removeRfidFromStudent(student);
      } else {
        throw error;
      }
    }
  }
};

// Configuration to determine which API to use
// Set to 'mock' to use mock data, 'real' to use real API, or 'auto' for real with fallback
const API_MODE = import.meta.env.VITE_API_MODE || 'mock'; // Default to mock for demo

// Export API based on configuration
let selectedApi;

if (API_MODE === 'mock') {
  selectedApi = mockAssignApi;
} else if (API_MODE === 'real') {
  selectedApi = realAssignApi;
} else { // 'auto' mode - try real API, fallback to mock
  selectedApi = {
    getDropdownOptions: async () => {
      const BASE_URL = import.meta.env.VITE_API_URL || '/api';
      try {
        const response = await fetch(`${BASE_URL}/options`);
        if (!response.ok) {
          throw new Error(`Failed to fetch dropdown options: ${response.status}`);
        }
        return response.json();
      } catch (error) {
        console.error('Real API error in getDropdownOptions:', error);
        return mockAssignApi.getDropdownOptions();
      }
    },

    getStudents: async (classSel, sectionSel, sessionSel) => {
      const BASE_URL = import.meta.env.VITE_API_URL || '/api';
      try {
        const params = new URLSearchParams();
        if (classSel) params.append('class', classSel);
        if (sectionSel) params.append('section', sectionSel);
        if (sessionSel) params.append('session', sessionSel);
        
        const response = await fetch(`${BASE_URL}/students?${params}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch students: ${response.status}`);
        }
        return response.json();
      } catch (error) {
        console.error('Real API error in getStudents:', error);
        // For mock data, we'll return all students and filter client-side
        const allStudents = await mockAssignApi.getStudents('', '', '');
        return allStudents.filter(student => {
          return (!classSel || student.class === classSel) && 
                 (!sectionSel || student.section === sectionSel) && 
                 (!sessionSel || student.session === sessionSel);
        });
      }
    },

    assignRfidToStudent: async (student, rfid) => {
      const BASE_URL = import.meta.env.VITE_API_URL || '/api';
      try {
        const response = await fetch(`${BASE_URL}/rfid/assign`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            student_id: student.id,
            rfid: rfid
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Failed to assign RFID: ${response.status} - ${JSON.stringify(errorData)}`);
        }
        return response.json();
      } catch (error) {
        console.error('Real API error in assignRfidToStudent:', error);
        // Mock assignment - just return the student with updated RFID
        return mockAssignApi.assignRfidToStudent(student, rfid);
      }
    },

    removeRfidFromStudent: async (student) => {
      const BASE_URL = import.meta.env.VITE_API_URL || '/api';
      try {
        const response = await fetch(`${BASE_URL}/rfid/remove`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            student_id: student.id
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Failed to remove RFID: ${response.status} - ${JSON.stringify(errorData)}`);
        }
        return response.json();
      } catch (error) {
        console.error('Real API error in removeRfidFromStudent:', error);
        // Mock removal - just return the student with empty RFID
        return mockAssignApi.removeRfidFromStudent(student);
      }
    }
  };
}

// Export API that uses configured mode
export const assignApi = selectedApi;

// Export both for flexibility
export { mockAssignApi, realAssignApi };