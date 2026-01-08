'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { createCheckout, setReportUnlocked, hasUnlockedReport } from '@/lib/creem';

interface CreemPaymentButtonProps {
  testResults: any;
  onPaymentSuccess?: () => void;
  className?: string;
}

export function CreemPaymentButton({ testResults, onPaymentSuccess, className = '' }: CreemPaymentButtonProps) {
  const t = useTranslations('love-possession-calculator');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if already unlocked
  if (hasUnlockedReport()) {
    return null;
  }

  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await createCheckout({
        amount: 299, // $2.99 in cents
        currency: 'USD',
        productName: 'Yandere Test Full Report',
        productId: 'prod_2zI7EwSBcDxLK86eKiTGwG',
        successUrl: `${window.location.origin}${window.location.pathname}?payment=success`,
        cancelUrl: `${window.location.origin}${window.location.pathname}?payment=cancelled`,
        metadata: {
          testType: 'yandere-possession',
          results: JSON.stringify(testResults),
        },
      });

      if (result.success) {
        // Payment initiated successfully
        // The user will be redirected to Creem checkout
        // After successful payment, they'll return with ?payment=success
        // We'll handle that in the page component
      } else {
        setError(result.error || 'Payment failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Payment error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`creem-payment-button ${className}`}>
      <button
        onClick={handlePayment}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Unlock Full Report - $2.99
          </span>
        )}
      </button>

      {error && (
        <div className="mt-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <p className="mt-3 text-xs text-center text-gray-500">
        🔒 Secure payment powered by Creem.io
      </p>
    </div>
  );
}

interface PaywallProps {
  testResults: any;
  onPaymentSuccess?: () => void;
}

export function Paywall({ testResults, onPaymentSuccess }: PaywallProps) {
  const t = useTranslations('love-possession-calculator');

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 md:p-12 border border-purple-200">
      <div className="text-center max-w-2xl mx-auto">
        {/* Lock Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full mb-6">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          Unlock Your Full Yandere Diagnosis
        </h2>

        {/* Description */}
        <p className="text-gray-700 mb-8 text-lg">
          You've completed the test! Get your complete personalized report including:
        </p>

        {/* Features List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left">
          <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-purple-200">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Detailed Analysis</h3>
              <p className="text-sm text-gray-600">In-depth breakdown of all 4 dimensions</p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-purple-200">
            <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Personalized Advice</h3>
              <p className="text-sm text-gray-600">Tailored recommendations for you</p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-purple-200">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Comparison Charts</h3>
              <p className="text-sm text-gray-600">See how you compare to others</p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-purple-200">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Lifetime Access</h3>
              <p className="text-sm text-gray-600">View your report anytime, forever</p>
            </div>
          </div>
        </div>

        {/* Price Guarantee */}
        <div className="bg-white rounded-xl p-4 mb-6 border-2 border-purple-300">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-4xl font-bold text-purple-600">$2.99</span>
            <span className="text-gray-500 line-through text-xl">$9.99</span>
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">70% OFF</span>
          </div>
          <p className="text-sm text-gray-600">Limited time offer - Unlock your complete Yandere analysis</p>
        </div>

        {/* Payment Button */}
        <CreemPaymentButton testResults={testResults} onPaymentSuccess={onPaymentSuccess} />

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>Secure Payment</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span>Instant Access</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 01-.723 3.976 3.066 3.066 0 01-3.976 0 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 01-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 01.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Satisfaction Guaranteed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
