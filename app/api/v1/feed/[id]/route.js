import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { getContentById } from '@/services/feedService';
import { validateObjectId } from '@/lib/validation';
import { handleApiError } from '@/lib/errorHandler';

/**
 * Single Content Item API Endpoint
 * GET /api/v1/feed/:id
 */
export async function GET(req, { params }) {
  try {
    await connectDB();
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams || {};

    validateObjectId(id, 'content ID');
    const item = await getContentById(id);

    return NextResponse.json(
      {
        success: true,
        data: item
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
