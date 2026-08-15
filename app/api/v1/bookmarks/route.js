import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { getUserBookmarks } from '@/services/bookmarkService';
import { handleApiError } from '@/lib/errorHandler';

/**
 * List User Bookmarks API Endpoint
 * GET /api/v1/bookmarks
 * Requires Authorization: Bearer <token>
 */
export async function GET(req) {
  try {
    await connectDB();
    const user = await verifyAuth(req);
    const bookmarks = await getUserBookmarks(user._id || user.id);

    return NextResponse.json(
      {
        success: true,
        count: bookmarks.length,
        data: bookmarks
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
