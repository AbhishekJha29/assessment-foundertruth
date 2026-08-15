import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { login } from '@/services/authService';
import { validateLogin } from '@/lib/validation';
import { handleApiError } from '@/lib/errorHandler';

/**
 * User Login API Endpoint
 * POST /api/v1/auth/login
 */
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json().catch(() => ({}));
    const validatedCredentials = validateLogin(body);
    const result = await login(validatedCredentials);

    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        data: result
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
