import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { addBookmark, removeBookmark } from '@/services/bookmarkService';
import { validateObjectId } from '@/lib/validation';
import { handleApiError } from '@/lib/errorHandler';

/**
 * Add Bookmark API Endpoint
 * POST /api/v1/feed/:id/bookmark
 * Requires Authorization: Bearer <token>
 */
export async function POST(req, { params }) {
  try {
    await connectDB();
    const user = await verifyAuth(req);
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id: contentId } = resolvedParams || {};

    validateObjectId(contentId, 'content ID');
    const bookmark = await addBookmark(user._id || user.id, contentId);

    return NextResponse.json(
      {
        success: true,
        message: 'Bookmark added successfully',
        data: bookmark
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Remove Bookmark API Endpoint
 * DELETE /api/v1/feed/:id/bookmark
 * Requires Authorization: Bearer <token>
 */
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const user = await verifyAuth(req);
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id: contentId } = resolvedParams || {};

    validateObjectId(contentId, 'content ID');
    const result = await removeBookmark(user._id || user.id, contentId);

    return NextResponse.json(
      {
        success: true,
        message: result.message || 'Bookmark removed successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
