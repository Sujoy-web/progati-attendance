// src/Components/SignupPage/PhoneInput.jsx
import React, { useState } from 'react';

const PhoneInput = ({ onNext }) => {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const validatePhone = (phoneNumber) => {
    // Simple validation for phone number (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phoneNumber);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validatePhone(phone)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    
    setError('');
    // Pass phone number to the next step
    onNext({ phone });
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Enter Your Phone Number</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
            Phone Number
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-600 bg-gray-700 text-gray-300 text-sm">
              +91
            </span>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="Enter your 10-digit phone number"
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-r-md border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              maxLength={10}
            />
          </div>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          <p className="mt-2 text-sm text-gray-400">
            We'll send an OTP to this number for verification.
          </p>
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

export default PhoneInput;