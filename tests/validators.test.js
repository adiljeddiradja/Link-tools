/**
 * Unit Tests for Validators
 * 
 * Run with: node tests/validators.test.js
 */

import {
    sanitizeInput,
    isValidSlug,
    isValidURL,
    isValidHandle,
    isValidHexColor,
    isValidLength,
    isValidEmail,
    getSlugError,
    getURLError,
    getHandleError
} from '../lib/validators.js';

// Simple test framework
let testsPassed = 0;
let testsFailed = 0;

function assert(condition, testName) {
    if (condition) {
        console.log(`✅ PASS: ${testName}`);
        testsPassed++;
    } else {
        console.log(`❌ FAIL: ${testName}`);
        testsFailed++;
    }
}

function assertEquals(actual, expected, testName) {
    if (actual === expected) {
        console.log(`✅ PASS: ${testName}`);
        testsPassed++;
    } else {
        console.log(`❌ FAIL: ${testName}`);
        console.log(`   Expected: ${expected}`);
        console.log(`   Actual: ${actual}`);
        testsFailed++;
    }
}

console.log('='.repeat(60));
console.log('UNIT TESTS: Validators');
console.log('='.repeat(60));

// ============================================================================
// TEST: sanitizeInput
// ============================================================================
console.log('\n--- sanitizeInput Tests ---');

assert(
    sanitizeInput('  hello  ') === 'hello',
    'Should trim whitespace'
);

assert(
    sanitizeInput('<script>alert("xss")</script>') === '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;',
    'Should encode HTML entities for XSS prevention'
);

assert(
    sanitizeInput('normal text') === 'normal text',
    'Should not modify normal text'
);

assert(
    sanitizeInput("it's a test & <tag>") === 'it&#x27;s a test &amp; &lt;tag&gt;',
    'Should encode special characters'
);

// ============================================================================
// TEST: isValidSlug
// ============================================================================
console.log('\n--- isValidSlug Tests ---');

assert(isValidSlug('valid-slug-123'), 'Valid slug with hyphens and numbers');
assert(isValidSlug('abc'), 'Minimum length slug (3 chars)');
assert(isValidSlug('a'.repeat(50)), 'Maximum length slug (50 chars)');
assert(isValidSlug('test_underscore'), 'Slug with underscores');

assert(!isValidSlug('ab'), 'Reject slug too short (< 3 chars)');
assert(!isValidSlug('a'.repeat(51)), 'Reject slug too long (> 50 chars)');
assert(!isValidSlug('invalid slug!'), 'Reject slug with spaces');
assert(!isValidSlug('invalid@slug'), 'Reject slug with special chars');
assert(!isValidSlug(''), 'Reject empty slug');
assert(!isValidSlug(null), 'Reject null slug');

// ============================================================================
// TEST: isValidURL
// ============================================================================
console.log('\n--- isValidURL Tests ---');

assert(isValidURL('https://example.com'), 'Valid HTTPS URL');
assert(isValidURL('http://example.com'), 'Valid HTTP URL');
assert(isValidURL('https://example.com/path/to/page?query=1'), 'Valid URL with path and query');

assert(!isValidURL('javascript:alert(1)'), 'Reject javascript: protocol (XSS)');
assert(!isValidURL('data:text/html,<script>alert(1)</script>'), 'Reject data: protocol');
assert(!isValidURL('ftp://example.com'), 'Reject FTP protocol');
assert(!isValidURL('http://localhost/test'), 'Reject localhost');
assert(!isValidURL('http://127.0.0.1/test'), 'Reject 127.0.0.1');
assert(!isValidURL('http://192.168.1.1/test'), 'Reject private IP');
assert(!isValidURL(''), 'Reject empty URL');
assert(!isValidURL('not a url'), 'Reject invalid URL format');
assert(!isValidURL('x'.repeat(2049)), 'Reject URL too long (> 2048 chars)');

// ============================================================================
// TEST: isValidHandle
// ============================================================================
console.log('\n--- isValidHandle Tests ---');

assert(isValidHandle('validhandle'), 'Valid handle');
assert(isValidHandle('user_123'), 'Valid handle with underscore and numbers');
assert(isValidHandle('user-name'), 'Valid handle with hyphen');
assert(isValidHandle('abc'), 'Minimum length handle (3 chars)');
assert(isValidHandle('a'.repeat(30)), 'Maximum length handle (30 chars)');

assert(!isValidHandle('ab'), 'Reject handle too short (< 3 chars)');
assert(!isValidHandle('a'.repeat(31)), 'Reject handle too long (> 30 chars)');
assert(!isValidHandle('invalid handle'), 'Reject handle with space');
assert(!isValidHandle('invalid@handle'), 'Reject handle with special chars');
assert(!isValidHandle(''), 'Reject empty handle');

// ============================================================================
// TEST: isValidHexColor
// ============================================================================
console.log('\n--- isValidHexColor Tests ---');

assert(isValidHexColor('#000000'), 'Valid black color');
assert(isValidHexColor('#FFFFFF'), 'Valid white color');
assert(isValidHexColor('#ff5733'), 'Valid lowercase hex color');
assert(isValidHexColor('#FF5733'), 'Valid uppercase hex color');
assert(isValidHexColor('#aB12cD'), 'Valid mixed case hex color');

assert(!isValidHexColor('#000'), 'Reject short hex (3 chars)');
assert(!isValidHexColor('#0000000'), 'Reject long hex (7 chars)');
assert(!isValidHexColor('000000'), 'Reject hex without #');
assert(!isValidHexColor('#gggggg'), 'Reject invalid hex chars');
assert(!isValidHexColor('rgb(0,0,0)'), 'Reject RGB format');

// ============================================================================
// TEST: isValidLength
// ============================================================================
console.log('\n--- isValidLength Tests ---');

assert(isValidLength('hello', 1, 10), 'Valid length within range');
assert(isValidLength('', 0, 10), 'Valid empty string with min 0');
assert(isValidLength('test', 4, 4), 'Valid exact length match');

assert(!isValidLength('hi', 3, 10), 'Reject too short');
assert(!isValidLength('toolongtext', 1, 5), 'Reject too long');
assert(isValidLength('  trim me  ', 5, 10), 'Should trim before checking length (7 chars after trim)');

// ============================================================================
// TEST: isValidEmail
// ============================================================================
console.log('\n--- isValidEmail Tests ---');

assert(isValidEmail('user@example.com'), 'Valid email');
assert(isValidEmail('test.user@example.co.uk'), 'Valid email with subdomain');
assert(isValidEmail('user+tag@example.com'), 'Valid email with plus sign');

assert(!isValidEmail('invalid'), 'Reject email without @');
assert(!isValidEmail('@example.com'), 'Reject email without username');
assert(!isValidEmail('user@'), 'Reject email without domain');
assert(!isValidEmail('user @example.com'), 'Reject email with space');
assert(!isValidEmail(''), 'Reject empty email');

// ============================================================================
// TEST: getSlugError
// ============================================================================
console.log('\n--- getSlugError Tests ---');

assertEquals(getSlugError('valid-slug'), null, 'No error for valid slug');
assertEquals(getSlugError(''), 'Slug is required', 'Error for empty slug');
assertEquals(getSlugError('ab'), 'Slug must be at least 3 characters', 'Error for too short');
assertEquals(getSlugError('a'.repeat(51)), 'Slug must be less than 50 characters', 'Error for too long');
assertEquals(getSlugError('invalid slug!'), 'Slug can only contain letters, numbers, hyphens, and underscores', 'Error for invalid chars');

// ============================================================================
// TEST: getURLError
// ============================================================================
console.log('\n--- getURLError Tests ---');

assertEquals(getURLError('https://example.com'), null, 'No error for valid URL');
assertEquals(getURLError(''), 'URL is required', 'Error for empty URL');
assertEquals(getURLError('javascript:alert(1)'), 'URL must start with http:// or https://', 'Error for javascript protocol');
assertEquals(getURLError('http://localhost'), 'Cannot use localhost or internal IP addresses', 'Error for localhost');

// ============================================================================
// TEST: getHandleError
// ============================================================================
console.log('\n--- getHandleError Tests ---');

assertEquals(getHandleError('validhandle'), null, 'No error for valid handle');
assertEquals(getHandleError(''), 'Handle is required', 'Error for empty handle');
assertEquals(getHandleError('ab'), 'Handle must be at least 3 characters', 'Error for too short');
assertEquals(getHandleError('a'.repeat(31)), 'Handle must be less than 30 characters', 'Error for too long');
assertEquals(getHandleError('invalid handle'), 'Handle can only contain letters, numbers, hyphens, and underscores', 'Error for invalid chars');

// ============================================================================
// RESULTS
// ============================================================================
console.log('\n' + '='.repeat(60));
console.log(`RESULTS: ${testsPassed} passed, ${testsFailed} failed`);
console.log('='.repeat(60));

process.exit(testsFailed > 0 ? 1 : 0);
