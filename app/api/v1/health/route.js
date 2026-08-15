import { NextResponse } from 'next/server';

/**
 * Health Check API Endpoint
 * GET /api/v1/health
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
}
