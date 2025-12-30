import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const now = new Date();

    // Get the earliest assigned contact that's still active
    const { data: earliestContact, error } = await supabaseAdmin
      .from('manager_contacts')
      .select('assigned_at, expires_at')
      .eq('manager_id', user.id)
      .gte('expires_at', now.toISOString())
      .order('assigned_at', { ascending: true })
      .limit(1)
      .single();

    if (error || !earliestContact) {
      // No active contacts, refresh will happen on next fetch
      return NextResponse.json({
        nextRefresh: now.toISOString(),
        hoursRemaining: 0,
        minutesRemaining: 0,
        totalSeconds: 0,
      });
    }

    const expiresAt = new Date(earliestContact.expires_at);
    const timeRemaining = expiresAt.getTime() - now.getTime();
    const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

    return NextResponse.json({
      nextRefresh: earliestContact.expires_at,
      hoursRemaining: Math.max(0, hoursRemaining),
      minutesRemaining: Math.max(0, minutesRemaining),
      totalSeconds: Math.max(0, Math.floor(timeRemaining / 1000)),
    });
  } catch (error) {
    console.error('Error fetching timer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timer' },
      { status: 500 }
    );
  }
}
