// src/Components/SignupPage/GetStarted.jsx
import React from 'react';

const GetStarted = ({ formData, onBack, onSignupComplete }) => {
  const handleComplete = () => {
    // In a real app, you would send the form data to your backend to complete the signup
    console.log('Final signup data:', formData);
    
    // Call the function to indicate signup is complete
    onSignupComplete(formData);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-lg shadow-lg text-center">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-white mb-3">Account Created Successfully!</h2>
      <p className="text-gray-400 mb-6">
        Your account has been created. Here are your details:
      </p>
      
      <div className="bg-gray-700 rounded-lg p-4 mb-6 text-left">
        <div className="mb-2">
          <span className="text-gray-400 text-sm">Phone:</span>
          <p className="text-white">+91-{formData.phone}</p>
        </div>
        <div className="mb-2">
          <span className="text-gray-400 text-sm">School:</span>
          <p className="text-white">{formData.schoolName}</p>
        </div>
        <div className="mb-2">
          <span className="text-gray-400 text-sm">Username:</span>
          <p className="text-white">{formData.userName}</p>
        </div>
      </div>
      
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
          type="button"
          onClick={handleComplete}
          className="py-2 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default GetStarted;