import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { getFeed } from '@/services/feedService';
import { parseFeedParams } from '@/lib/validation';
import { handleApiError } from '@/lib/errorHandler';

/**
 * Paginated Content Feed API Endpoint
 * GET /api/v1/feed?page=1&limit=20&sort=latest&source=TechCrunch&search=AI
 */
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const feedParams = parseFeedParams(searchParams);
    const result = await getFeed(feedParams);

    return NextResponse.json(
      {
        success: true,
        data: result.items,
        pagination: result.pagination
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
