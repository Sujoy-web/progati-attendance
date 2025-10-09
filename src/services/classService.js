// src/services/classService.js
import apiClient from './api';

// Fetch all classes from the backend
export const fetchClasses = async () => {
  try {
    const response = await apiClient.get('/classes');
    // The backend should return data in the format:
    // [{ id: 1, name: "Class V" }, { id: 2, name: "Class VI" }, { id: 3, name: "Class VII" }, ...]
    return response.data;
  } catch (error) {
    console.error('Error fetching classes:', error);
    throw error;
  }
};

// Mock data function that returns classes in the required format
export const fetchClassesMock = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return mock data in the format: { id: 1, name: "Class V" }, { id: 2, name: "Class VI" }, { id: 3, name: "Class VII" }
  return [
    { id: 1, name: "Class V" },
    { id: 2, name: "Class VI" },
    { id: 3, name: "Class VII" },
    { id: 4, name: "Class VIII" },
    { id: 5, name: "Class IX" },
    { id: 6, name: "Class X" }
  ];
};

// You can add other class-related API functions here as needed:
// export const createClass = async (classData) => { ... };
// export const updateClass = async (id, classData) => { ... };
// export const deleteClass = async (id) => { ... };