// src/Components/Signin/CardSignin.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CardSignin = ({ onSigninComplete }) => {
  const [cardId, setCardId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [jwtToken, setJwtToken] = useState(null); // Store JWT token
  const navigate = useNavigate();

  // Auto focus on component mount
  useEffect(() => {
    const inputElement = document.getElementById('card-scanner');
    if (inputElement) {
      inputElement.focus();
    }
  }, []);

  // Handle card ID input (simulating card scan)
  const handleCardInput = (e) => {
    const inputValue = e.target.value;
    setCardId(inputValue);
    
    // When we reach 10 characters, automatically attempt to sign in
    if (inputValue.length === 10) {
      handleSignin(inputValue);
    }
  };

  const validateCardId = (cardId) => {
    // Simple validation for card ID (10 alphanumeric characters)
    const cardIdRegex = /^[a-zA-Z0-9]{10}$/;
    return cardIdRegex.test(cardId);
  };

  const handleSignin = async (cardIdToUse = cardId) => {
    if (!cardIdToUse.trim()) {
      setError('Please scan a card');
      return;
    }
    
    if (!validateCardId(cardIdToUse)) {
      setError('Please scan a valid 10-character card');
      setCardId(''); // Clear the input to allow new scan
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // allow cookies
        body: JSON.stringify({ cardId: cardIdToUse}), // For now, use cardId as password for API compatibility
      });

      // ✅ Read JWT from Authorization header
      const authHeader = response.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        setJwtToken(token);
        console.log('JWT Token:', token); // For demo; remove in production
      }

      const data = await response.json();

      if (response.ok) {
        if (onSigninComplete) onSigninComplete(data.user);
        navigate('/attendance');
      } else {
        setError(data.message || 'Invalid card ID');
        setCardId(''); // Clear the input to allow new scan
      }
    } catch (err) {
      console.error('Sign-in error:', err);
      setError('Unable to connect to server. Please try again.');
      setCardId(''); // Clear the input to allow new scan
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 px-4">
      <div className="w-full max-w-lg">
        <div className="bg-black bg-opacity-80 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-800 p-10">
        
          
          {/* Hidden input for card scanning */}
          <input
            type="text"
            id="card-scanner"
            value={cardId}
            onChange={handleCardInput}
            className="absolute opacity-0 w-0 h-0"
            maxLength={10}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck="false"
          />
          
          <div className="text-center mb-8">
            <div className="mx-auto bg-gradient-to-r from-blue-600 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Welcome to Attendance Manager
</h2>
            <p className="text-2xl text-gray-300 mb-1">Tap your access card to sign in</p>
            <p className="text-lg text-gray-400">Hold your card near the device</p>
          </div>
          
          <div className="flex justify-center my-12">
            <img 
              src="/src/assets/rfid.png" 
              alt="RFID Scanner" 
              className="w-32 h-32 object-contain animate-bounce"
            />
          </div>
          
          {error && (
            <div className="bg-red-900 bg-opacity-50 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-sm flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}
          
          {loading && (
            <div className="flex justify-center mb-6">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
          
          <div className="mt-12 text-center">
            <p className="text-gray-400 mb-2">Having trouble with card scan?</p>
            <button
              onClick={() => navigate('/signin')}
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors text-lg"
            >
              Sign in with Phone/Email
            </button>
          </div>
          
          {jwtToken && (
            <div className="mt-4">
              <p className="text-green-400 text-sm">JWT token received!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardSignin;