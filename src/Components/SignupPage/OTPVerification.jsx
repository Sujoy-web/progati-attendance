// src/Components/SignupPage/OTPVerification.jsx
import React, { useState, useEffect } from 'react';

const OTPVerification = ({ onNext, onBack, formData }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(30);
  const [resendDisabled, setResendDisabled] = useState(false);

  // Timer for resend OTP
  useEffect(() => {
    let interval;
    if (timer > 0 && !resendDisabled) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setResendDisabled(false);
    }
    return () => clearInterval(interval);
  }, [timer, resendDisabled]);

  const handleOtpChange = (index, value) => {
    if (/[^0-9]/.test(value)) return; // Only allow numbers
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if current is filled
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    // Clear error when user types
    if (error) setError('');
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }
    
    setError('');
    // In a real app, you would verify the OTP with your backend
    // For now, we'll simulate successful verification
    onNext({ ...formData, otp: otpValue });
  };

  const handleResendOTP = () => {
    setTimer(30);
    setResendDisabled(true);
    // In a real app, you would call your backend to resend OTP
    console.log('Resend OTP to', formData.phone);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-2 text-center">Verify Your Phone</h2>
      <p className="text-gray-400 text-center mb-6">
        Enter the 6-digit code sent to +91-{formData.phone}
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <div className="flex justify-between space-x-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-input-${index}`}
                type="text"
                inputMode="numeric"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-xl border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={1}
              />
            ))}
          </div>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <button
            type="button"
            onClick={onBack}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            ← Back
          </button>
          
          {resendDisabled ? (
            <p className="text-sm text-gray-400">
              Resend OTP in {timer}s
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResendOTP}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Resend OTP
            </button>
          )}
        </div>
        
        <div className="flex justify-center">
          <button
            type="submit"
            className="py-2 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
          >
            Verify & Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default OTPVerification;