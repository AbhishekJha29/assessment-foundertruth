import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { register } from '@/services/authService';
import { validateRegister } from '@/lib/validation';
import { handleApiError } from '@/lib/errorHandler';

/**
 * User Registration API Endpoint
 * POST /api/v1/auth/register
 */
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json().catch(() => ({}));
    const validatedData = validateRegister(body);
    const result = await register(validatedData);

    return NextResponse.json(
      {
        success: true,
        message: 'User registered successfully',
        data: result
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
