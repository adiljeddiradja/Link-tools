/**
 * Security Validators
 * 
 * Client-side validation utilities for input sanitization and validation.
 * These provide user-friendly validation BEFORE data reaches the server.
 * 
 * Note: Server-side validation is still required (never trust client input)!
 */

/**
 * Sanitize user input to prevent XSS attacks
 * Encodes HTML entities and trims whitespace
 * 
 * @param {string} input - Raw user input
 * @returns {string} - Sanitized input
 */
export function sanitizeInput(input) {
    if (typeof input !== 'string') return '';

    // Remove leading/trailing whitespace
    let sanitized = input.trim();

    // Encode HTML entities
    const htmlEntityMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        "/": '&#x2F;',
    };

    const htmlEntityRegex = /[&<>"'/]/ig;
    sanitized = sanitized.replace(htmlEntityRegex, (match) => htmlEntityMap[match]);

    return sanitized;
}

/**
 * Validate slug format
 * - Only alphanumeric, hyphens, and underscores
 * - 3-50 characters
 * 
 * @param {string} slug - Slug to validate
 * @returns {boolean} - True if valid
 */
export function isValidSlug(slug) {
    if (typeof slug !== 'string') return false;

    const slugRegex = /^[a-zA-Z0-9-_]{3,50}$/;
    return slugRegex.test(slug);
}

/**
 * Validate URL format
 * - Must be http:// or https://
 * - Max 2048 characters
 * - No localhost or internal IPs
 * 
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid
 */
export function isValidURL(url) {
    if (typeof url !== 'string') return false;

    // Length check
    if (url.length === 0 || url.length > 2048) return false;

    try {
        const urlObj = new URL(url);

        // Protocol check (only http/https)
        if (!['http:', 'https:'].includes(urlObj.protocol)) {
            return false;
        }

        // Block localhost and internal IPs
        const blockedHosts = [
            'localhost',
            '127.0.0.1',
            '0.0.0.0',
            '::1',
            '169.254.',  // Link-local
            '10.',       // Private network
            '172.16.',   // Private network
            '192.168.'   // Private network
        ];

        const hostname = urlObj.hostname.toLowerCase();
        if (blockedHosts.some(blocked => hostname.includes(blocked))) {
            return false;
        }

        return true;
    } catch {
        return false;
    }
}

/**
 * Validate profile handle format
 * - Only alphanumeric, hyphens, and underscores
 * - 3-30 characters
 * 
 * @param {string} handle - Handle to validate
 * @returns {boolean} - True if valid
 */
export function isValidHandle(handle) {
    if (typeof handle !== 'string') return false;

    const handleRegex = /^[a-zA-Z0-9-_]{3,30}$/;
    return handleRegex.test(handle);
}

/**
 * Validate hex color format
 * - Must be #RRGGBB format
 * 
 * @param {string} color - Color to validate
 * @returns {boolean} - True if valid
 */
export function isValidHexColor(color) {
    if (typeof color !== 'string') return false;

    const hexColorRegex = /^#[0-9a-fA-F]{6}$/;
    return hexColorRegex.test(color);
}

/**
 * Validate text length
 * 
 * @param {string} text - Text to validate
 * @param {number} minLength - Minimum length (inclusive)
 * @param {number} maxLength - Maximum length (inclusive)
 * @returns {boolean} - True if valid
 */
export function isValidLength(text, minLength = 0, maxLength = Infinity) {
    if (typeof text !== 'string') return false;

    const length = text.trim().length;
    return length >= minLength && length <= maxLength;
}

/**
 * Validate email format (basic)
 * Note: Use proper email validation library for production
 * 
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid format
 */
export function isValidEmail(email) {
    if (typeof email !== 'string') return false;

    // Basic email regex (not RFC 5322 compliant, but good enough)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

/**
 * Get validation error message for slug
 * 
 * @param {string} slug - Slug to validate
 * @returns {string|null} - Error message or null if valid
 */
export function getSlugError(slug) {
    if (!slug || slug.trim().length === 0) {
        return 'Slug is required';
    }

    if (slug.length < 3) {
        return 'Slug must be at least 3 characters';
    }

    if (slug.length > 50) {
        return 'Slug must be less than 50 characters';
    }

    if (!/^[a-zA-Z0-9-_]+$/.test(slug)) {
        return 'Slug can only contain letters, numbers, hyphens, and underscores';
    }

    return null;
}

/**
 * Get validation error message for URL
 * 
 * @param {string} url - URL to validate
 * @returns {string|null} - Error message or null if valid
 */
export function getURLError(url) {
    if (!url || url.trim().length === 0) {
        return 'URL is required';
    }

    if (url.length > 2048) {
        return 'URL is too long (max 2048 characters)';
    }

    try {
        const urlObj = new URL(url);

        if (!['http:', 'https:'].includes(urlObj.protocol)) {
            return 'URL must start with http:// or https://';
        }

        const hostname = urlObj.hostname.toLowerCase();
        const blockedHosts = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];

        if (blockedHosts.some(blocked => hostname.includes(blocked))) {
            return 'Cannot use localhost or internal IP addresses';
        }

        return null;
    } catch {
        return 'Invalid URL format';
    }
}

/**
 * Get validation error message for handle
 * 
 * @param {string} handle - Handle to validate
 * @returns {string|null} - Error message or null if valid
 */
export function getHandleError(handle) {
    if (!handle || handle.trim().length === 0) {
        return 'Handle is required';
    }

    if (handle.length < 3) {
        return 'Handle must be at least 3 characters';
    }

    if (handle.length > 30) {
        return 'Handle must be less than 30 characters';
    }

    if (!/^[a-zA-Z0-9-_]+$/.test(handle)) {
        return 'Handle can only contain letters, numbers, hyphens, and underscores';
    }

    return null;
}
