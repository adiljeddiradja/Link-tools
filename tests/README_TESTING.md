# Security Testing Suite - Execution Guide

Panduan lengkap untuk menjalankan seluruh security testing dan penetration testing.

---

## 📋 Prerequisites

1. **Database migrations sudah dijalankan:**
   - ✅ `fix_rls_policies.sql`
   - ✅ `add_db_constraints.sql`
   - ✅ `create_rate_limits_table.sql`

2. **Environment variables sudah dikonfigurasi:**
   - ✅ `NEXT_PUBLIC_SUPABASE_URL`
   - ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - ✅ `SUPABASE_SERVICE_ROLE_KEY`

3. **Dev server running:**
   ```bash
   npm run dev
   ```

---

## 🧪 Test Suite Overview

| Test File | Type | Target | Duration |
|-----------|------|--------|----------|
| `penetration-test-rls.sql` | SQL | RLS Policies | 5 min |
| `validators.test.js` | Unit | Input Validation | 1 min |
| `penetration-test-rate-limit.js` | Penetration | Rate Limiting | 3 min |
| `security-headers.test.js` | Integration | HTTP Headers | 1 min |

---

## 1️⃣ RLS Policy Penetration Tests

**File:** [`tests/penetration-test-rls.sql`](file:///c:/Users/MyBook%20PRO%20K7.2/Documents/link-tool/tests/penetration-test-rls.sql)

**How to run:**
1. Open Supabase Dashboard → SQL Editor
2. Copy-paste content dari `penetration-test-rls.sql`
3. Run setiap test block satu per satu (uncomment yang di-comment)
4. Verifikasi hasil

**Expected Results:**
- ❌ Unauthorized INSERT/UPDATE/DELETE should FAIL
- ✅ Public READ on active data should SUCCEED
- ❌ Invalid data should be REJECTED by constraints

**Tests Include:**
- Attempt unauthorized INSERT on links
- Attempt to read inactive links (unauthenticated)
- Attempt to UPDATE/DELETE other user's data
- SQL injection via slug
- Invalid data format tests
- Constraint verification

---

## 2️⃣ Validator Unit Tests

**File:** [`tests/validators.test.js`](file:///c:/Users/MyBook%20PRO%20K7.2/Documents/link-tool/tests/validators.test.js)

**How to run:**
```bash
node tests/validators.test.js
```

**Tests Include:**
- `sanitizeInput()` - XSS prevention
- `isValidSlug()` - Slug format validation  
- `isValidURL()` - URL validation & protocol checks
- `isValidHandle()` - Profile handle validation
- `isValidHexColor()` - Color format validation
- `isValidEmail()` - Email format validation
- Error message functions

**Expected Output:**
```
✅ PASS: Should trim whitespace
✅ PASS: Should encode HTML entities for XSS prevention
✅ PASS: Valid slug with hyphens and numbers
...
RESULTS: X passed, 0 failed
```

---

## 3️⃣ Rate Limiting Penetration Tests

**File:** [`tests/penetration-test-rate-limit.js`](file:///c:/Users/MyBook%20PRO%20K7.2/Documents/link-tool/tests/penetration-test-rate-limit.js)

**Prerequisites:**
- Dev server must be running on `http://localhost:3000`

**How to run:**
```bash
node tests/penetration-test-rate-limit.js
```

**Tests Include:**
- Rate limit for `login` action (5 attempts/min)
- Rate limit for `signup` action (3 attempts/min)
- Bypass attempts with different user agents
- Stress test with concurrent requests
- Invalid request handling
- Rate limit reset verification

**Expected Output:**
```
✅ PASS: Rate limit working correctly (5 allowed, rest blocked)
✅ PASS: Rate limiting works even under concurrent load
...
RESULTS: X passed, 0 failed
```

**⚠️ Note:** This test makes real API calls and will trigger rate limits. You may need to wait 1 minute between runs.

---

## 4️⃣ Security Headers Tests

**File:** [`tests/security-headers.test.js`](file:///c:/Users/MyBook%20PRO%20K7.2/Documents/link-tool/tests/security-headers.test.js)

**Prerequisites:**
- Dev server must be running

**How to run:**
```bash
node tests/security-headers.test.js
```

**Tests Include:**
- Content-Security-Policy presence & directives
- X-Frame-Options (clickjacking protection)
- X-Content-Type-Options (MIME sniffing)
- Referrer-Policy
- Permissions-Policy
- X-XSS-Protection

**Expected Output:**
```
✅ PASS: content-security-policy
✅ PASS: x-frame-options
✅ PASS: x-content-type-options
...
🎉 All security headers are properly configured!
```

---

## 🚀 Quick Test All

Run all JavaScript tests in sequence:

```bash
# 1. Validator tests
node tests/validators.test.js

# 2. Rate limiting tests (make sure dev server is running)
node tests/penetration-test-rate-limit.js

# 3. Security headers tests
node tests/security-headers.test.js
```

**For SQL tests:**
- Manually run in Supabase SQL Editor

---

## 🐛 Manual Penetration Testing Checklist

Beyond automated tests, perform these manual checks:

### XSS Testing
- [ ] Try injecting `<script>alert('XSS')</script>` in link title
- [ ] Try injecting `<img src=x onerror=alert(1)>` in profile bio
- [ ] Check if CSP blocks inline scripts in browser console
- [ ] Verify user input is sanitized in UI

### SQL Injection Testing
- [ ] Try `' OR '1'='1` in slug field
- [ ] Try `'; DROP TABLE links; --` in any text field
- [ ] Verify database constraints reject malformed input

### Authentication Testing
- [ ] Try accessing `/profiles` without login → should redirect
- [ ] Try accessing `/editor/:id` without login → should redirect
- [ ] Try accessing another user's links via API
- [ ] Verify JWT token expiration

### Rate Limiting Testing
- [ ] Try logging in 6 times with wrong password rapidly
- [ ] Verify lockout message after 5 attempts
- [ ] Wait 1 minute, verify can login again
- [ ] Check `rate_limits` table in Supabase

### CORS Testing
- [ ] Try making API request from different origin
- [ ] Verify only allowed origins can access

### Clickjacking Testing
- [ ] Create HTML with `<iframe src="your-app-url">`
- [ ] Open in browser → should be blocked
- [ ] Check console for `X-Frame-Options` error

---

## 📊 Expected Test Results Summary

| Category | Tests | Expected Pass |
|----------|-------|---------------|
| **RLS Policies** | 10+ | 100% |
| **Validators** | 50+ | 100% |
| **Rate Limiting** | 8+ | 100% |
| **Security Headers** | 12+ | 100% |

**Total:** ~80+ automated tests

---

## 🔍 Interpreting Results

### If All Tests Pass ✅
- Security measures are working correctly
- Safe to deploy to production
- Continue with monitoring

### If Some Tests Fail ❌
1. **Review the error messages**
2. **Check which component failed:**
   - RLS → Review `fix_rls_policies.sql`
   - Validation → Review `validators.js`
   - Rate limiting → Review `rate-limit/route.js`
   - Headers → Review `next.config.mjs`
3. **Re-run migrations if needed**
4. **Test again**

---

## 📝 Reporting Issues

If you find a vulnerability:

1. **Document it:**
   - What was tested
   - Expected behavior
   - Actual behavior
   - Steps to reproduce

2. **Assess severity:**
   - 🔴 Critical: Allows unauthorized access to data
   - 🟡 High: Potential data leak or bypass
   - 🟢 Medium: Limited impact
   - 🔵 Low: Minor issue

3. **Fix and retest**

---

## 🛡️ Continuous Security Testing

**Recommendations:**
- Run validator tests before each deploy
- Run penetration tests weekly
- Monitor rate limit violations in production
- Review Supabase auth logs regularly
- Set up automated security scanning (e.g., npm audit)

---

## 📚 Additional Resources

- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)

---

**Status:** Ready for comprehensive security testing! 🚀
