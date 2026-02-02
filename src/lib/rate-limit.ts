import { NextRequest, NextResponse } from 'next/server'

interface RateLimitOptions {
  interval: number // Time window in milliseconds
  uniqueTokenPerInterval: number // Max number of unique tokens per interval
}

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

// In-memory store for rate limiting
// In production, use Redis or similar
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Clean every minute

export function rateLimit(options: RateLimitOptions) {
  const { interval, uniqueTokenPerInterval } = options

  return {
    check: async (request: NextRequest, limit: number): Promise<RateLimitResult> => {
      // Get client identifier (IP address or token)
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                 request.headers.get('x-real-ip') ||
                 'unknown'

      const key = `${ip}-${request.nextUrl.pathname}`
      const now = Date.now()

      // Get or create rate limit entry
      let entry = rateLimitStore.get(key)

      if (!entry || entry.resetTime < now) {
        // Create new entry
        entry = {
          count: 0,
          resetTime: now + interval,
        }
        rateLimitStore.set(key, entry)
      }

      // Increment count
      entry.count++

      const remaining = Math.max(0, limit - entry.count)
      const success = entry.count <= limit

      return {
        success,
        limit,
        remaining,
        reset: entry.resetTime,
      }
    },
  }
}

// Pre-configured rate limiters for different use cases
export const authRateLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
})

export const apiRateLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 1000,
})

export const strictRateLimiter = rateLimit({
  interval: 60 * 60 * 1000, // 1 hour
  uniqueTokenPerInterval: 100,
})

// Helper function to create rate limit response
export function rateLimitResponse(result: RateLimitResult): NextResponse {
  return NextResponse.json(
    {
      error: 'Çok fazla istek gönderdiniz. Lütfen biraz bekleyin.',
      retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
    },
    {
      status: 429,
      headers: {
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.reset.toString(),
        'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
      },
    }
  )
}

// Middleware-style rate limiting function
export async function withRateLimit(
  request: NextRequest,
  options: {
    limit: number
    type?: 'auth' | 'api' | 'strict'
  }
): Promise<RateLimitResult> {
  const { limit, type = 'api' } = options

  let limiter
  switch (type) {
    case 'auth':
      limiter = authRateLimiter
      break
    case 'strict':
      limiter = strictRateLimiter
      break
    default:
      limiter = apiRateLimiter
  }

  return limiter.check(request, limit)
}
