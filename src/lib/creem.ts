/**
 * Creem.io Payment Integration
 * Documentation: https://docs.creem.io/features/checkout/checkout-api
 */

export interface CreemConfig {
  apiKey: string;
  mode: 'sandbox' | 'production';
}

export interface CreemCheckoutOptions {
  amount: number;
  currency: string;
  productName: string;
  productId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, any>;
}

export interface CreemPaymentResult {
  success: boolean;
  checkoutUrl?: string;
  paymentId?: string;
  error?: string;
}

/**
 * Create a checkout session and redirect to Creem payment page
 */
export async function createCheckout(options: CreemCheckoutOptions): Promise<CreemPaymentResult> {
  if (typeof window === 'undefined') {
    return { success: false, error: 'Window not available' };
  }

  try {
    // Call your backend API to create a checkout session
    // Your backend will securely call Creem.io API to create the session
    const response = await fetch('/api/creem/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to create checkout session' }));
      throw new Error(errorData.error || 'Failed to create checkout session');
    }

    const data = await response.json();

    if (data.checkoutUrl) {
      // Redirect to Creem checkout page
      window.location.href = data.checkoutUrl;
      return { success: true, checkoutUrl: data.checkoutUrl, paymentId: data.paymentId };
    }

    return { success: false, error: 'No checkout URL returned' };
  } catch (error) {
    console.error('Creem checkout error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Verify payment status (client-side helper)
 * Actual verification should happen on your backend
 */
export async function verifyPayment(paymentId: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    const response = await fetch(`/api/creem/verify?paymentId=${paymentId}`);
    const data = await response.json();
    return data.verified === true;
  } catch (error) {
    console.error('Payment verification error:', error);
    return false;
  }
}

/**
 * Check if user has unlocked the full report
 */
export function hasUnlockedReport(): boolean {
  if (typeof window === 'undefined') return false;

  const unlocked = localStorage.getItem('yandere-test-unlocked');
  return unlocked === 'true';
}

/**
 * Mark the report as unlocked after successful payment
 */
export function setReportUnlocked(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('yandere-test-unlocked', 'true');
  localStorage.setItem('yandere-test-unlocked-date', new Date().toISOString());
}

/**
 * Get the date when the report was unlocked
 */
export function getUnlockedDate(): Date | null {
  if (typeof window === 'undefined') return null;

  const dateStr = localStorage.getItem('yandere-test-unlocked-date');
  return dateStr ? new Date(dateStr) : null;
}

/**
 * Store test results for later access after payment
 */
export function saveTestResults(results: any): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('yandere-test-results', JSON.stringify({
    ...results,
    savedAt: new Date().toISOString(),
  }));
}

/**
 * Retrieve saved test results
 */
export function getSavedTestResults(): any | null {
  if (typeof window === 'undefined') return null;

  const resultsStr = localStorage.getItem('yandere-test-results');
  if (!resultsStr) return null;

  try {
    return JSON.parse(resultsStr);
  } catch {
    return null;
  }
}

/**
 * Clear saved test results (for privacy)
 */
export function clearTestResults(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('yandere-test-results');
}