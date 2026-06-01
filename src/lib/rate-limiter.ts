import { NextResponse } from "next/server";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export function rateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000
) {
  const now = Date.now();
  const record = store[identifier];

  if (!record || now > record.resetTime) {
    store[identifier] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return { success: true, limit: maxRequests, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  record.count++;
  return {
    success: true,
    limit: maxRequests,
    remaining: maxRequests - record.count,
  };
}

export function createRateLimitResponse(resetTime: number) {
  return NextResponse.json(
    {
      error: "Too many requests",
      message: "Please try again later",
      retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
    },
    {
      status: 429,
      headers: {
        "X-RateLimit-Reset": resetTime.toString(),
      },
    }
  );
}