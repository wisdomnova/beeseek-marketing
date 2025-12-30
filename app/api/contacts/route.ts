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

    const now = new Date().toISOString();

    // Get current active contacts for this manager
    const { data: activeContacts, error: activeError } = await supabaseAdmin
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
      .gte('expires_at', now)
      .order('assigned_at', { ascending: true });

    if (activeError) throw activeError;

    // If manager has less than 5 active contacts, assign new ones
    const currentCount = activeContacts?.length || 0;
    
    if (currentCount < 5) {
      const needed = 5 - currentCount;
      await assignContactsToManager(user.id, needed);
      
      // Re-fetch after assignment
      const { data: updatedContacts, error: refetchError } = await supabaseAdmin
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
        .gte('expires_at', now)
        .order('assigned_at', { ascending: true });

      if (refetchError) throw refetchError;

      return NextResponse.json({ contacts: updatedContacts || [] });
    }

    return NextResponse.json({ contacts: activeContacts || [] });
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
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Get all contact IDs that are currently assigned and not expired
    const { data: assignedContactIds } = await supabaseAdmin
      .from('manager_contacts')
      .select('contact_id')
      .gte('expires_at', now.toISOString());

    const excludedIds = assignedContactIds?.map(ac => ac.contact_id) || [];

    // Get available contacts (not currently assigned to anyone)
    let query = supabaseAdmin
      .from('contacts')
      .select('id');

    if (excludedIds.length > 0) {
      query = query.not('id', 'in', `(${excludedIds.join(',')})`);
    }

    const { data: availableContacts } = await query.limit(count);

    if (!availableContacts || availableContacts.length === 0) {
      // If no available contacts, get contacts where messaged is false and expired
      const { data: expiredUnmessaged } = await supabaseAdmin
        .from('manager_contacts')
        .select('contact_id')
        .eq('messaged', false)
        .lt('expires_at', now.toISOString())
        .limit(count);

      if (expiredUnmessaged && expiredUnmessaged.length > 0) {
        // Assign these expired unmessaged contacts
        const assignments = expiredUnmessaged.map(contact => ({
          manager_id: managerId,
          contact_id: contact.contact_id,
          assigned_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
        }));

        await supabaseAdmin.from('manager_contacts').insert(assignments);

        // Log history
        const historyEntries = assignments.map(a => ({
          manager_id: managerId,
          contact_id: a.contact_id,
          action: 'assigned',
          details: { source: 'expired_unmessaged' },
        }));
        await supabaseAdmin.from('contact_history').insert(historyEntries);
      }
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
      .select('messaged, converted, rejected')
      .eq('manager_id', managerId);

    if (!managerContacts) return;

    const stats = {
      contacts_messaged: managerContacts.filter(c => c.messaged).length,
      contacts_converted: managerContacts.filter(c => c.converted).length,
    };

    const conversionRate = stats.contacts_messaged > 0
      ? (stats.contacts_converted / stats.contacts_messaged) * 100
      : 0;

    // Calculate days completed and missed (you'll need to implement this based on your logic)
    // For now, we'll keep the existing values

    await supabaseAdmin
      .from('managers')
      .update({
        contacts_messaged: stats.contacts_messaged,
        contacts_converted: stats.contacts_converted,
        conversion_rate: conversionRate.toFixed(2),
      })
      .eq('id', managerId);
  } catch (error) {
    console.error('Error updating manager stats:', error);
  }
}
