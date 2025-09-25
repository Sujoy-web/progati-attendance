// src/Components/SignupPage/Signup.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneInput from './PhoneInput';
import OTPVerification from './OTPVerification';
import SchoolAndUsername from './SchoolAndUsername';
import CreatePassword from './CreatePassword';
import GetStarted from './GetStarted';

const Signup = ({ onSignupComplete }) => {
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: School & Username, 4: Password, 5: Get Started
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  const handleNext = (newData) => {
    setFormData(prev => ({ ...prev, ...newData }));
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  const handleSignupComplete = (finalData) => {
    // Call the parent component's function to handle signup completion
    if (onSignupComplete) {
      onSignupComplete(finalData);
    }
    
    // Navigate to the RFID Assign page
    navigate('/assign');
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <PhoneInput onNext={handleNext} />;
      case 2:
        return <OTPVerification onNext={handleNext} onBack={handleBack} formData={formData} />;
      case 3:
        return <SchoolAndUsername onNext={handleNext} onBack={handleBack} formData={formData} />;
      case 4:
        return <CreatePassword onNext={handleNext} onBack={handleBack} formData={formData} />;
      case 5:
        return <GetStarted formData={formData} onBack={handleBack} onSignupComplete={handleSignupComplete} />;
      default:
        return <PhoneInput onNext={handleNext} />;
    }
  };

  // Progress indicator
  const progressPercentage = ((step - 1) / 4) * 100;

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Progress bar */}
      <div className="w-full bg-gray-700 h-1.5">
        <div 
          className="bg-blue-600 h-1.5 transition-all duration-300 ease-in-out" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      
      {/* Step indicator */}
      <div className="flex justify-center my-6">
        {[1, 2, 3, 4, 5].map((num) => (
          <div key={num} className="flex items-center">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                step >= num ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
              }`}
            >
              {num}
            </div>
            {num < 5 && (
              <div className={`w-12 h-0.5 ${step > num ? 'bg-blue-600' : 'bg-gray-700'}`}></div>
            )}
          </div>
        ))}
      </div>
      
      <div className="flex-grow flex items-center justify-center p-4">
        {renderStep()}
      </div>
    </div>
  );
};

export default Signup;