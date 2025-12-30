import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { signToken } from '@/lib/jwt';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Fetch all managers
    const { data: managers, error } = await supabaseAdmin
      .from('managers')
      .select('*');

    if (error || !managers || managers.length === 0) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Find matching manager by comparing password
    let matchedManager = null;
    for (const manager of managers) {
      const isValid = await bcrypt.compare(password, manager.password);
      if (isValid) {
        matchedManager = manager;
        break;
      }
    }

    if (!matchedManager) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = await signToken({
      name: matchedManager.name,
      id: matchedManager.id,
    });

    // Set token in HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      user: {
        name: matchedManager.name,
        id: matchedManager.id,
      },
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
