import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all managers with their stats
    const { data: managers, error: managersError } = await supabaseAdmin
      .from('managers')
      .select('*')
      .order('conversion_rate', { ascending: false });

    if (managersError) throw managersError;

    // Get all contacts with manager assignments
    const { data: allContacts, error: contactsError } = await supabaseAdmin
      .from('manager_contacts')
      .select(`
        id,
        assigned_at,
        expires_at,
        messaged,
        converted,
        rejected,
        messaged_at,
        converted_at,
        rejected_at,
        managers (name),
        contacts (contact_id, username, business, social_media, profile_link, location)
      `)
      .order('assigned_at', { ascending: false });

    if (contactsError) throw contactsError;

    // Get total contacts in pool
    const { count: totalContactsInPool, error: poolError } = await supabaseAdmin
      .from('contacts')
      .select('*', { count: 'exact', head: true });

    if (poolError) throw poolError;

    // Calculate overall stats
    const totalMessaged = allContacts?.filter(c => c.messaged).length || 0;
    const totalConverted = allContacts?.filter(c => c.converted).length || 0;
    const totalRejected = allContacts?.filter(c => c.rejected).length || 0;
    const totalPending = allContacts?.filter(c => !c.messaged).length || 0;
    const totalAssignments = allContacts?.length || 0;

    // Get active assignments (not expired)
    const now = new Date().toISOString();
    const activeAssignments = allContacts?.filter(c => c.expires_at >= now).length || 0;
    const expiredUnmessaged = allContacts?.filter(c => c.expires_at < now && !c.messaged).length || 0;

    return NextResponse.json({
      managers,
      contacts: allContacts,
      stats: {
        totalContactsInPool: totalContactsInPool || 0,
        totalAssignments,
        totalMessaged,
        totalConverted,
        totalRejected,
        totalPending,
        activeAssignments,
        expiredUnmessaged,
        overallConversionRate: totalMessaged > 0 ? ((totalConverted / totalMessaged) * 100).toFixed(2) : '0.00',
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
