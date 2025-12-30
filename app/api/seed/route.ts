import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    const managers = [
      { name: 'tosin', password: 'tosin', contacts_messaged: 342, contacts_converted: 87, days_missed: 2, days_completed: 28, conversion_rate: 25.4 },
      { name: 'jimi', password: 'jimi', contacts_messaged: 298, contacts_converted: 92, days_missed: 1, days_completed: 29, conversion_rate: 30.9 },
      { name: 'kunle', password: 'kunle', contacts_messaged: 315, contacts_converted: 79, days_missed: 3, days_completed: 27, conversion_rate: 25.1 },
    ];

    for (const manager of managers) {
      const hashedPassword = await bcrypt.hash(manager.password, 10);
      
      await supabaseAdmin
        .from('managers')
        .upsert({
          name: manager.name,
          password: hashedPassword,
          contacts_messaged: manager.contacts_messaged,
          contacts_converted: manager.contacts_converted,
          days_missed: manager.days_missed,
          days_completed: manager.days_completed,
          conversion_rate: manager.conversion_rate,
        }, { onConflict: 'name' });
    }

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    await supabaseAdmin
      .from('admins')
      .upsert({
        username: 'admin',
        password: adminPassword,
      }, { onConflict: 'username' });

    return NextResponse.json({ success: true, message: 'Managers and admin seeded successfully' });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed data' },
      { status: 500 }
    );
  }
}
