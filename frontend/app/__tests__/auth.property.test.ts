// Feature: phase-1-foundation, Property 5: valid credentials produce HTTP-only cookie
// Feature: phase-1-foundation, Property 6: invalid credentials always return 401
// Validates: Requirements 5.3, 5.4

import * as fc from 'fast-check';
import { NextRequest } from 'next/server';

// Set up env vars before importing the route handler
process.env.BRIANNA_PASSWORD = 'test-brianna-pass';
process.env.BETHANY_PASSWORD = 'test-bethany-pass';
process.env.SESSION_SECRET = 'test-session-secret';

// Import after env vars are set
import { POST } from '../api/auth/login/route';

/**
 * Helper: build a NextRequest with a JSON body for the login route.
 */
function makeLoginRequest(body: { email: string; password: string }): NextRequest {
  return new NextRequest('http://localhost/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/**
 * Property 5: Valid credentials produce an HTTP-only session cookie
 *
 * For any valid staff credential pair (either account), the auth API should
 * return HTTP 200 and set a cookie named `cronan_session` with the HttpOnly flag.
 */
describe('Property 5: Valid credentials produce an HTTP-only session cookie', () => {
  it('returns 200 and sets HttpOnly cookie for any valid staff account', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('brianna@cronantech.com', 'bethany@cronantech.com'),
        async (email) => {
          const password = email.startsWith('brianna')
            ? process.env.BRIANNA_PASSWORD!
            : process.env.BETHANY_PASSWORD!;

          const req = makeLoginRequest({ email, password });
          const res = await POST(req);

          if (res.status !== 200) return false;

          const setCookieHeader = res.headers.get('set-cookie');
          if (!setCookieHeader) return false;

          // The Set-Cookie header should contain HttpOnly
          return setCookieHeader.toLowerCase().includes('httponly');
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 6: Invalid credentials always return 401
 *
 * For any credential pair that does not match a known staff account,
 * the auth API should return HTTP 401 and should not set a session cookie.
 */
describe('Property 6: Invalid credentials always return 401', () => {
  it('returns 401 and sets no session cookie for any non-matching credentials', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({ email: fc.emailAddress(), password: fc.string() }).filter(
          ({ email }) =>
            !['brianna@cronantech.com', 'bethany@cronantech.com'].includes(email)
        ),
        async ({ email, password }) => {
          const req = makeLoginRequest({ email, password });
          const res = await POST(req);

          if (res.status !== 401) return false;

          // No session cookie should be set
          const setCookieHeader = res.headers.get('set-cookie');
          if (setCookieHeader && setCookieHeader.includes('cronan_session')) {
            // Allow only if it's a clear/expiry (Max-Age=0), but on 401 there should be none
            return false;
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
