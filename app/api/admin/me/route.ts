import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('admin-token')?.value;

  if (!token) {
    return NextResponse.json({ user: null });
  }

  const payload = await verifyToken(token);

  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({ user: payload });
}
