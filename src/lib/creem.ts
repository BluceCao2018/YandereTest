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
 * Generate a unique test ID
 */
export function generateTestId(): string {
  return `test_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
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
 * Check if a specific test ID has been unlocked
 */
export function hasTestUnlocked(testId: string): boolean {
  if (typeof window === 'undefined') return false;

  const unlockedTests = localStorage.getItem('yandere-unlocked-tests');
  if (!unlockedTests) return false;

  try {
    const unlockedTestsList = JSON.parse(unlockedTests);
    return Array.isArray(unlockedTestsList) && unlockedTestsList.includes(testId);
  } catch {
    return false;
  }
}

/**
 * Mark a specific test as unlocked
 */
export function setTestUnlocked(testId: string): void {
  if (typeof window === 'undefined') return;

  let unlockedTests: string[] = [];

  const existing = localStorage.getItem('yandere-unlocked-tests');
  if (existing) {
    try {
      unlockedTests = JSON.parse(existing);
      if (!Array.isArray(unlockedTests)) {
        unlockedTests = [];
      }
    } catch {
      unlockedTests = [];
    }
  }

  if (!unlockedTests.includes(testId)) {
    unlockedTests.push(testId);
    localStorage.setItem('yandere-unlocked-tests', JSON.stringify(unlockedTests));
  }

  // Store the unlock date for this test
  const unlockDates = JSON.parse(localStorage.getItem('yandere-test-unlock-dates') || '{}');
  unlockDates[testId] = new Date().toISOString();
  localStorage.setItem('yandere-test-unlock-dates', JSON.stringify(unlockDates));
}

/**
 * Get the unlock date for a specific test
 */
export function getTestUnlockDate(testId: string): Date | null {
  if (typeof window === 'undefined') return null;

  const unlockDates = JSON.parse(localStorage.getItem('yandere-test-unlock-dates') || '{}');
  const dateStr = unlockDates[testId];
  return dateStr ? new Date(dateStr) : null;
}

/**
 * Legacy function - Check if user has unlocked the full report
 * @deprecated Use hasTestUnlocked(testId) instead
 */
export function hasUnlockedReport(): boolean {
  if (typeof window === 'undefined') return false;
  const unlocked = localStorage.getItem('yandere-test-unlocked');
  return unlocked === 'true';
}

/**
 * Legacy function - Mark the report as unlocked after successful payment
 * @deprecated Use setTestUnlocked(testId) instead
 */
export function setReportUnlocked(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('yandere-test-unlocked', 'true');
  localStorage.setItem('yandere-test-unlocked-date', new Date().toISOString());
}

/**
 * Legacy function - Get the date when the report was unlocked
 * @deprecated Use getTestUnlockDate(testId) instead
 */
export function getUnlockedDate(): Date | null {
  if (typeof window === 'undefined') return null;
  const dateStr = localStorage.getItem('yandere-test-unlocked-date');
  return dateStr ? new Date(dateStr) : null;
}

export type TestSubject = 'self' | 'partner';

export interface TestResultData {
  testId: string; // Unique identifier for this test
  testSubject: TestSubject; // 'self' or 'partner'
  answers: number[];
  controlDesire: number;
  jealousyIntensity: number;
  emotionalDependency: number;
  relationshipInsecurity: number;
  totalScore: number;
  percentage: number;
  // Random seeds for reproducible content
  randomSeeds?: {
    controlTitle?: number;
    controlCopy?: number;
    jealousyTitle?: number;
    jealousyCopy?: number;
    dependencyTitle?: number;
    dependencyCopy?: number;
    insecurityTitle?: number;
    insecurityCopy?: number;
    redFlagMessage?: number;
    redFlagUnlockText?: number;
    shareCopy?: number;
  };
  savedAt: string;
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
 * Store test results with random seeds for reproducible content
 */
export function saveTestResultsWithSeeds(data: TestResultData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('yandere-test-results', JSON.stringify({
    ...data,
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

/**
 * Get the current test ID from localStorage
 */
export function getCurrentTestId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('yandere-current-test-id');
}

/**
 * Set the current test ID
 */
export function setCurrentTestId(testId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('yandere-current-test-id', testId);
}

/**
 * Clear the current test ID
 */
export function clearCurrentTestId(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('yandere-current-test-id');
}

/**
 * Get storage key suffix based on test subject
 */
function getStorageKeySuffix(testSubject: TestSubject): string {
  return testSubject === 'partner' ? '-partner' : '-self';
}

/**
 * Save test results for a specific subject (self or partner)
 */
export function saveTestResultsBySubject(data: TestResultData): void {
  if (typeof window === 'undefined') return;
  const suffix = getStorageKeySuffix(data.testSubject);
  localStorage.setItem(`yandere-test-results${suffix}`, JSON.stringify({
    ...data,
    savedAt: new Date().toISOString(),
  }));
}

/**
 * Get saved test results for a specific subject
 */
export function getSavedTestResultsBySubject(testSubject: TestSubject): TestResultData | null {
  if (typeof window === 'undefined') return null;
  const suffix = getStorageKeySuffix(testSubject);
  const resultsStr = localStorage.getItem(`yandere-test-results${suffix}`);
  if (!resultsStr) return null;

  try {
    return JSON.parse(resultsStr);
  } catch {
    return null;
  }
}

/**
 * Get current test ID for a specific subject
 */
export function getCurrentTestIdBySubject(testSubject: TestSubject): string | null {
  if (typeof window === 'undefined') return null;
  const suffix = getStorageKeySuffix(testSubject);
  return localStorage.getItem(`yandere-current-test-id${suffix}`);
}

/**
 * Set current test ID for a specific subject
 */
export function setCurrentTestIdBySubject(testId: string, testSubject: TestSubject): void {
  if (typeof window === 'undefined') return;
  const suffix = getStorageKeySuffix(testSubject);
  localStorage.setItem(`yandere-current-test-id${suffix}`, testId);
}

/**
 * Clear current test ID for a specific subject
 */
export function clearCurrentTestIdBySubject(testSubject: TestSubject): void {
  if (typeof window === 'undefined') return;
  const suffix = getStorageKeySuffix(testSubject);
  localStorage.removeItem(`yandere-current-test-id${suffix}`);
}

/**
 * Check if any test results exist
 */
export function hasAnyTestResults(): { self: boolean; partner: boolean } {
  return {
    self: getSavedTestResultsBySubject('self') !== null,
    partner: getSavedTestResultsBySubject('partner') !== null,
  };
}