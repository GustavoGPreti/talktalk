'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ConfirmarPage() {
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const termsAccepted = localStorage.getItem('talktalk_terms_accepted');
    const privacyAccepted = localStorage.getItem('talktalk_privacy_accepted');
    
    if (termsAccepted === 'true' && privacyAccepted === 'true') {
      setConfirmed(true);
    }
  }, []);

  const handleConfirm = () => {
    localStorage.setItem('talktalk_terms_accepted', 'true');
    localStorage.setItem('talktalk_privacy_accepted', 'true');
    setConfirmed(true);
    
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
      <div className="max-w-md mx-auto p-8">
        {!confirmed ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/20 dark:border-gray-700/30"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Confirmation Required
            </h1>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              To continue using TalkTalk, you need to accept our terms of use and privacy policy.
            </p>
            
            <div className="space-y-4">
              <button
                onClick={handleConfirm}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                ✅ Accept and Continue
              </button>
              
              <Link
                href="/termos"
                className="block w-full text-center px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
              >
                📋 Read Full Terms
              </Link>
              
              <Link
                href="/"
                className="block text-center text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/20 dark:border-gray-700/30"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-green-600 mb-4">
              ✅ Confirmed!
            </h1>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Thank you! Your terms have been accepted. Redirecting to the homepage...
            </p>
            
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
