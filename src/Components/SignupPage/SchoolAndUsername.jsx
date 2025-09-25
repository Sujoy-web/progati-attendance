// src/Components/SignupPage/SchoolAndUsername.jsx
import React, { useState } from 'react';

const SchoolAndUsername = ({ onNext, onBack, formData }) => {
  const [schoolName, setSchoolName] = useState('');
  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!schoolName.trim()) {
      setError('Please enter your school name');
      return;
    }
    
    if (!userName.trim()) {
      setError('Please enter your username');
      return;
    }
    
    setError('');
    // Pass school name and username to the next step
    onNext({ ...formData, schoolName, userName });
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-2 text-center">School & Username</h2>
      <p className="text-gray-400 text-center mb-6">
        Enter your school details and username
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="schoolName" className="block text-sm font-medium text-gray-300 mb-2">
            School Name
          </label>
          <input
            type="text"
            id="schoolName"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            placeholder="Enter your school name"
            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="userName" className="block text-sm font-medium text-gray-300 mb-2">
            Username
          </label>
          <input
            type="text"
            id="userName"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your username"
            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        
        <div className="flex justify-between items-center mb-6">
          <button
            type="button"
            onClick={onBack}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            ← Back
          </button>
        </div>
        
        <div className="flex justify-center">
          <button
            type="submit"
            className="py-2 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default SchoolAndUsername;