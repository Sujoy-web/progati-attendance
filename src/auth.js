// src/auth.js
// Authentication utilities for the application

// Function to get the current user from localStorage
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

// Function to save user to localStorage
export const setCurrentUser = (user) => {
  try {
    localStorage.setItem('user', JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user to localStorage:', error);
  }
};

// Function to remove user from localStorage (logout)
export const removeCurrentUser = () => {
  try {
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Error removing user from localStorage:', error);
  }
};

// Function to get JWT token from localStorage
export const getToken = () => {
  try {
    return localStorage.getItem('token');
  } catch (error) {
    console.error('Error getting token from localStorage:', error);
    return null;
  }
};

// Function to set JWT token in localStorage
export const setToken = (token) => {
  try {
    localStorage.setItem('token', token);
  } catch (error) {
    console.error('Error setting token in localStorage:', error);
  }
};

// Function to remove token from localStorage
export const removeToken = () => {
  try {
    localStorage.removeItem('token');
  } catch (error) {
    console.error('Error removing token from localStorage:', error);
  }
};

// Function to check if user is authenticated
export const isAuthenticated = () => {
  const token = getToken();
  const user = getCurrentUser();
  
  return !!(token && user);
};

// Function to logout user
export const logout = () => {
  removeCurrentUser();
  removeToken();
};

// Function to login user (this would typically be called after successful API authentication)
export const login = async (credentials) => {
  try {
    // This is a placeholder for actual API call
    // const response = await fetch('/api/login', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(credentials),
    // });
    // 
    // if (response.ok) {
    //   const data = await response.json();
    //   setToken(data.token);
    //   setCurrentUser(data.user);
    //   return { success: true, user: data.user };
    // } else {
    //   const error = await response.json();
    //   return { success: false, message: error.message };
    // }

    // For now, we'll simulate a successful login
    // In a real application, you'd replace this with an actual API call
    
    const mockUser = {
      id: Date.now(), // Unique ID for each login
      username: credentials.username,
      email: `${credentials.username}@example.com`,
      phone: credentials.username, // Store phone number as username since it's used for login
      role: 'admin',
      loginTime: new Date().toISOString()
    };
    
    setToken('mock-jwt-token-' + Date.now()); // Make token unique
    setCurrentUser(mockUser);
    
    return { success: true, user: mockUser };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: error.message };
  }
};

// Function to register user (placeholder)
export const register = async (userData) => {
  try {
    // This is a placeholder for actual API call
    // const response = await fetch('/api/register', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(userData),
    // });
    // 
    // if (response.ok) {
    //   const data = await response.json();
    //   return { success: true, user: data.user };
    // } else {
    //   const error = await response.json();
    //   return { success: false, message: error.message };
    // }

    // For now, we'll simulate a successful registration
    return { success: true, message: 'Registration successful' };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: error.message };
  }
  
};

// Function to check user role
export const hasRole = (requiredRole) => {
  const user = getCurrentUser();
  return user && user.role === requiredRole;
};

// Function to get user role
export const getUserRole = () => {
  const user = getCurrentUser();
  return user ? user.role : null;
};