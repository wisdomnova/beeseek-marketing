import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('admin-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contact_id, username, business, social_media, profile_link, location } = await request.json();

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const { data: existingContact, error: checkError } = await supabaseAdmin
      .from('contacts')
      .select('id')
      .eq('username', username)
      .single();

    if (existingContact) {
      return NextResponse.json(
        { error: 'A contact with this username already exists' },
        { status: 400 }
      );
    }

    // Auto-generate contact_id if not provided
    const finalContactId = contact_id || `C${Date.now().toString().slice(-8)}`;

    // Insert new contact
    const { data: newContact, error } = await supabaseAdmin
      .from('contacts')
      .insert({
        contact_id: finalContactId,
        username,
        business: business || null,
        social_media: social_media || null,
        profile_link: profile_link || null,
        location: location || null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'Contact ID already exists' },
          { status: 400 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      contact: newContact,
      message: 'Contact added successfully',
    });
  } catch (error) {
    console.error('Error adding contact:', error);
    return NextResponse.json(
      { error: 'Failed to add contact' },
      { status: 500 }
    );
  }
}
