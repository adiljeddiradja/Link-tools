import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

// Initialize Supabase client with service role for rate limiting
// Note: Service role key should ONLY be used server-side
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

/**
 * Rate limiting configuration
 * Adjust these values based on your needs
 */
const RATE_LIMITS = {
    login: {
        maxAttempts: 5,      // Max 5 attempts
        windowMs: 60000,     // Per 1 minute
        blockDuration: 300000 // Block for 5 minutes after exceeding
    },
    signup: {
        maxAttempts: 3,
        windowMs: 60000,
        blockDuration: 600000 // 10 minutes
    },
    api_request: {
        maxAttempts: 30,
        windowMs: 60000,
        blockDuration: 60000 // 1 minute
    }
};

/**
 * Get client IP address from headers
 */
function getClientIP(headersList) {
    return (
        headersList.get('x-forwarded-for')?.split(',')[0].trim() ||
        headersList.get('x-real-ip') ||
        headersList.get('cf-connecting-ip') || // Cloudflare
        'unknown'
    );
}

/**
 * Check rate limit for a given identifier and action
 */
async function checkRateLimit(identifier, action) {
    const config = RATE_LIMITS[action] || RATE_LIMITS.api_request;
    const now = Date.now();
    const windowStart = new Date(now - config.windowMs);

    // Query recent attempts within the time window
    const { data: attempts, error } = await supabase
        .from('rate_limits')
        .select('timestamp')
        .eq('identifier', identifier)
        .eq('action', action)
        .gte('timestamp', windowStart.toISOString())
        .order('timestamp', { ascending: false });

    if (error) {
        console.error('Rate limit check error:', error);
        // Fail open (allow request) on database errors to avoid blocking legitimate users
        return {
            allowed: true,
            remaining: config.maxAttempts,
            retryAfter: null
        };
    }

    const attemptCount = attempts?.length || 0;

    // Check if limit exceeded
    if (attemptCount >= config.maxAttempts) {
        const oldestAttempt = attempts[attempts.length - 1];
        const retryAfter = new Date(
            new Date(oldestAttempt.timestamp).getTime() + config.windowMs
        );

        return {
            allowed: false,
            remaining: 0,
            retryAfter: retryAfter.toISOString(),
            message: `Too many ${action} attempts. Please try again later.`
        };
    }

    // Record this attempt
    const { error: insertError } = await supabase
        .from('rate_limits')
        .insert({
            identifier,
            action,
            timestamp: new Date(now).toISOString()
        });

    if (insertError) {
        console.error('Rate limit record error:', insertError);
    }

    return {
        allowed: true,
        remaining: config.maxAttempts - attemptCount - 1,
        retryAfter: null
    };
}

/**
 * POST /api/rate-limit
 * 
 * Check if a request is within rate limits
 * 
 * Body:
 * - action: string (e.g., 'login', 'signup', 'api_request')
 * - identifier: string (optional - defaults to client IP)
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const { action = 'api_request', identifier: customIdentifier } = body;

        // Get client IP if no custom identifier provided
        const headersList = await headers();
        const identifier = customIdentifier || getClientIP(headersList);

        // Validate action
        if (!action || typeof action !== 'string') {
            return NextResponse.json(
                { error: 'Invalid action parameter' },
                { status: 400 }
            );
        }

        // Check rate limit
        const result = await checkRateLimit(identifier, action);

        // Set rate limit headers (standard headers used by many APIs)
        const responseHeaders = {
            'X-RateLimit-Limit': String(RATE_LIMITS[action]?.maxAttempts || RATE_LIMITS.api_request.maxAttempts),
            'X-RateLimit-Remaining': String(result.remaining),
        };

        if (result.retryAfter) {
            responseHeaders['X-RateLimit-Reset'] = result.retryAfter;
            responseHeaders['Retry-After'] = String(
                Math.ceil((new Date(result.retryAfter).getTime() - Date.now()) / 1000)
            );
        }

        if (!result.allowed) {
            return NextResponse.json(
                {
                    allowed: false,
                    message: result.message,
                    retryAfter: result.retryAfter
                },
                {
                    status: 429, // Too Many Requests
                    headers: responseHeaders
                }
            );
        }

        return NextResponse.json(
            {
                allowed: true,
                remaining: result.remaining
            },
            {
                status: 200,
                headers: responseHeaders
            }
        );
    } catch (error) {
        console.error('Rate limit API error:', error);

        // Fail open on unexpected errors
        return NextResponse.json(
            {
                allowed: true,
                error: 'Rate limit check failed'
            },
            { status: 200 }
        );
    }
}
