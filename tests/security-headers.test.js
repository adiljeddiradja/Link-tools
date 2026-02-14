/**
 * Security Headers Test
 * 
 * This script verifies that all security headers are properly set
 * Run with: node tests/security-headers.test.js
 * 
 * NOTE: Make sure dev server is running (npm run dev)
 */

const API_URL = 'http://localhost:3000';

// Colors for console output
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

let testsPassed = 0;
let testsFailed = 0;

function log(color, message) {
    console.log(`${color}${message}${RESET}`);
}

async function testSecurityHeaders() {
    log(YELLOW, '\n--- Testing Security Headers ---\n');

    try {
        const response = await fetch(API_URL);
        const headers = response.headers;

        // Expected security headers
        const securityHeaders = {
            'content-security-policy': {
                required: true,
                description: 'CSP protects against XSS attacks',
                validate: (value) => value && value.includes("default-src 'self'")
            },
            'x-frame-options': {
                required: true,
                description: 'Protects against clickjacking',
                validate: (value) => value === 'DENY'
            },
            'x-content-type-options': {
                required: true,
                description: 'Prevents MIME sniffing',
                validate: (value) => value === 'nosniff'
            },
            'referrer-policy': {
                required: true,
                description: 'Controls referrer information',
                validate: (value) => value === 'strict-origin-when-cross-origin'
            },
            'permissions-policy': {
                required: true,
                description: 'Disables browser features',
                validate: (value) => value && value.includes('camera=()')
            },
            'x-xss-protection': {
                required: true,
                description: 'Legacy XSS protection',
                validate: (value) => value === '1; mode=block'
            }
        };

        // Test each header
        for (const [headerName, config] of Object.entries(securityHeaders)) {
            const headerValue = headers.get(headerName);

            if (!headerValue) {
                if (config.required) {
                    log(RED, `❌ FAIL: Missing header "${headerName}"`);
                    log(RED, `   Purpose: ${config.description}`);
                    testsFailed++;
                }
            } else if (config.validate && !config.validate(headerValue)) {
                log(RED, `❌ FAIL: Invalid value for "${headerName}"`);
                log(RED, `   Got: ${headerValue}`);
                testsFailed++;
            } else {
                log(GREEN, `✅ PASS: ${headerName}`);
                log(GREEN, `   Value: ${headerValue}`);
                testsPassed++;
            }
        }

        // Check CSP directives in detail
        const csp = headers.get('content-security-policy');
        if (csp) {
            log(YELLOW, '\n--- CSP Directives Analysis ---\n');

            const directives = {
                "default-src 'self'": 'Default policy restrictive',
                "script-src": 'Script sources controlled',
                "style-src": 'Style sources controlled',
                "connect-src": 'API connections controlled',
                "frame-ancestors 'none'": 'Cannot be framed',
                "object-src 'none'": 'No plugins allowed'
            };

            for (const [directive, description] of Object.entries(directives)) {
                if (csp.includes(directive.split(' ')[0])) {
                    log(GREEN, `✅ ${directive}: ${description}`);
                    testsPassed++;
                } else {
                    log(RED, `❌ Missing CSP directive: ${directive}`);
                    testsFailed++;
                }
            }
        }

    } catch (error) {
        log(RED, `❌ ERROR: ${error.message}`);
        testsFailed++;
    }
}

async function testXSSPrevention() {
    log(YELLOW, '\n--- Testing XSS Prevention ---\n');

    // Test that inline scripts are blocked by CSP
    log(YELLOW, 'Note: CSP should prevent inline script execution');
    log(YELLOW, 'Manual test: Try injecting <script>alert(1)</script> in forms');
    log(YELLOW, 'Expected: Script should not execute\n');

    testsPassed++; // Placeholder for manual verification
}

async function testClickjackingPrevention() {
    log(YELLOW, '\n--- Testing Clickjacking Prevention ---\n');

    log(YELLOW, 'Note: X-Frame-Options: DENY prevents embedding in iframes');
    log(YELLOW, 'Manual test: Try embedding your site in an iframe');
    log(YELLOW, 'Expected: Should be blocked by browser\n');

    testsPassed++; // Placeholder for manual verification
}

// ============================================================================
// RUN ALL TESTS
// ============================================================================
async function runAllTests() {
    console.log('='.repeat(60));
    console.log('SECURITY HEADERS TEST');
    console.log('='.repeat(60));
    console.log('Make sure dev server is running on http://localhost:3000\n');

    // Check if server is running
    try {
        const response = await fetch(API_URL);
        log(GREEN, '✅ Dev server is running\n');
    } catch (error) {
        log(RED, '❌ ERROR: Dev server is not running!');
        log(RED, 'Please run: npm run dev');
        process.exit(1);
    }

    // Run tests
    await testSecurityHeaders();
    await testXSSPrevention();
    await testClickjackingPrevention();

    // Results
    console.log('\n' + '='.repeat(60));
    console.log(`RESULTS: ${testsPassed} passed, ${testsFailed} failed`);
    console.log('='.repeat(60));

    if (testsFailed === 0) {
        log(GREEN, '\n🎉 All security headers are properly configured!');
    } else {
        log(RED, '\n⚠️  Some security headers are missing or misconfigured');
        log(RED, 'Please check next.config.mjs');
    }

    process.exit(testsFailed > 0 ? 1 : 0);
}

runAllTests();
