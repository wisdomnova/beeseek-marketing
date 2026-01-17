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

    const skipAutoAssign = request.nextUrl.searchParams.get('skipAutoAssign') === 'true';
    const now = new Date().toISOString();

    // Get all messaged contacts for this manager (permanent - no expiration check)
    const { data: messagedContacts, error: messagedError } = await supabaseAdmin
      .from('manager_contacts')
      .select(`
        id,
        contact_id,
        assigned_at,
        expires_at,
        messaged,
        converted,
        rejected,
        messaged_at,
        converted_at,
        rejected_at,
        notes,
        contacts (
          contact_id,
          username,
          business,
          social_media,
          profile_link,
          location
        )
      `)
      .eq('manager_id', user.id)
      .eq('messaged', true)
      .order('messaged_at', { ascending: false });

    if (messagedError) throw messagedError;

    // Get unmessaged contacts for today (with expiration at end of day)
    const { data: unmessagedContacts, error: unmessagedError } = await supabaseAdmin
      .from('manager_contacts')
      .select(`
        id,
        contact_id,
        assigned_at,
        expires_at,
        messaged,
        converted,
        rejected,
        messaged_at,
        converted_at,
        rejected_at,
        notes,
        contacts (
          contact_id,
          username,
          business,
          social_media,
          profile_link,
          location
        )
      `)
      .eq('manager_id', user.id)
      .eq('messaged', false)
      .gte('expires_at', now)
      .order('assigned_at', { ascending: true });

    if (unmessagedError) throw unmessagedError;

    // If manager has less than 5 unmessaged contacts, assign new ones (unless skipped)
    const unmessagedCount = unmessagedContacts?.length || 0;
    
    if (!skipAutoAssign && unmessagedCount < 5) {
      const needed = 5 - unmessagedCount;
      await assignContactsToManager(user.id, needed);
      
      // Re-fetch unmessaged contacts after assignment
      const { data: updatedUnmessaged, error: refetchError } = await supabaseAdmin
        .from('manager_contacts')
        .select(`
          id,
          contact_id,
          assigned_at,
          expires_at,
          messaged,
          converted,
          rejected,
          messaged_at,
          converted_at,
          rejected_at,
          notes,
          contacts (
            contact_id,
            username,
            business,
            social_media,
            profile_link,
            location
          )
        `)
        .eq('manager_id', user.id)
        .eq('messaged', false)
        .gte('expires_at', now)
        .order('assigned_at', { ascending: true });

      if (refetchError) throw refetchError;

      // Combine unmessaged + messaged contacts (unmessaged first so managers see new contacts at top)
      const allContacts = [...(updatedUnmessaged || []), ...(messagedContacts || [])];
      return NextResponse.json({ contacts: allContacts });
    }

    // Combine unmessaged + messaged contacts (unmessaged first so managers see new contacts at top)
    const allContacts = [...(unmessagedContacts || []), ...(messagedContacts || [])];
    return NextResponse.json({ contacts: allContacts });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

// Helper function to assign contacts to a manager
async function assignContactsToManager(managerId: number, count: number) {
  try {
    const now = new Date();
    
    // Calculate end of today (midnight)
    const expiresAt = new Date(now);
    expiresAt.setHours(23, 59, 59, 999); // Set to end of today

    // Get all contact IDs that have been messaged, rejected, or converted by ANY manager
    const { data: usedContactIds } = await supabaseAdmin
      .from('manager_contacts')
      .select('contact_id')
      .or('messaged.eq.true,rejected.eq.true,converted.eq.true');

    const excludedIds = usedContactIds?.map(ac => ac.contact_id) || [];

    // Get available contacts (never messaged, rejected, or converted)
    let query = supabaseAdmin
      .from('contacts')
      .select('id');

    if (excludedIds.length > 0) {
      query = query.not('id', 'in', `(${excludedIds.join(',')})`);
    }

    const { data: availableContacts } = await query.limit(count);

    if (!availableContacts || availableContacts.length === 0) {
      // If no available contacts, no more contacts in pool
      return;
    }

    // Randomly shuffle and assign
    const shuffled = availableContacts.sort(() => Math.random() - 0.5);
    const toAssign = shuffled.slice(0, count);

    const assignments = toAssign.map(contact => ({
      manager_id: managerId,
      contact_id: contact.id,
      assigned_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    }));

    await supabaseAdmin.from('manager_contacts').insert(assignments);

    // Log history
    const historyEntries = assignments.map(a => ({
      manager_id: managerId,
      contact_id: a.contact_id,
      action: 'assigned',
      details: { source: 'new_assignment' },
    }));
    await supabaseAdmin.from('contact_history').insert(historyEntries);
  } catch (error) {
    console.error('Error assigning contacts:', error);
    throw error;
  }
}

// Update contact status
export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { managerContactId, action, notes } = await request.json();

    if (!managerContactId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const updateData: any = { updated_at: now };

    if (action === 'message') {
      updateData.messaged = true;
      updateData.messaged_at = now;
    } else if (action === 'convert') {
      updateData.converted = true;
      updateData.converted_at = now;
      updateData.messaged = true;
      if (!updateData.messaged_at) updateData.messaged_at = now;
    } else if (action === 'reject') {
      updateData.rejected = true;
      updateData.rejected_at = now;
      updateData.messaged = true;
      if (!updateData.messaged_at) updateData.messaged_at = now;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('manager_contacts')
      .update(updateData)
      .eq('id', managerContactId)
      .eq('manager_id', user.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Update manager stats
    await updateManagerStats(user.id);

    // Log history
    await supabaseAdmin.from('contact_history').insert({
      manager_id: user.id,
      contact_id: updated.contact_id,
      action: action,
      details: { notes },
    });

    return NextResponse.json({ success: true, contact: updated });
  } catch (error) {
    console.error('Error updating contact:', error);
    return NextResponse.json(
      { error: 'Failed to update contact' },
      { status: 500 }
    );
  }
}

// Update manager statistics
async function updateManagerStats(managerId: number) {
  try {
    // Get all contacts for this manager
    const { data: managerContacts } = await supabaseAdmin
      .from('manager_contacts')
      .select('messaged, converted, rejected, assigned_at, messaged_at')
      .eq('manager_id', managerId);

    if (!managerContacts) return;

    const stats = {
      contacts_messaged: managerContacts.filter(c => c.messaged).length,
      contacts_converted: managerContacts.filter(c => c.converted).length,
    };

    const conversionRate = stats.contacts_messaged > 0
      ? (stats.contacts_converted / stats.contacts_messaged) * 100
      : 0;

    // Calculate days completed and missed
    const daysMap = new Map<string, boolean>();
    
    managerContacts.forEach(contact => {
      const assignedDate = new Date(contact.assigned_at).toISOString().split('T')[0];
      
      // If contact was messaged on this day, mark day as completed
      if (contact.messaged && contact.messaged_at) {
        daysMap.set(assignedDate, true);
      } else if (!daysMap.has(assignedDate)) {
        // If no message on this day yet, mark as potentially missed
        daysMap.set(assignedDate, false);
      }
    });

    const days_completed = Array.from(daysMap.values()).filter(v => v).length;
    const days_missed = Array.from(daysMap.values()).filter(v => !v).length;

    await supabaseAdmin
      .from('managers')
      .update({
        contacts_messaged: stats.contacts_messaged,
        contacts_converted: stats.contacts_converted,
        conversion_rate: conversionRate.toFixed(2),
        days_completed: days_completed,
        days_missed: days_missed,
      })
      .eq('id', managerId);
  } catch (error) {
    console.error('Error updating manager stats:', error);
  }
}
