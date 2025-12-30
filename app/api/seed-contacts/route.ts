import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST() {
  try {
    // Sample contacts to seed
    const sampleContacts = [
      { contact_id: 'CONT001', username: '@johndoe', business: 'Tech Startup Inc', social_media: 'Twitter', profile_link: 'https://twitter.com/johndoe' },
      { contact_id: 'CONT002', username: '@sarahsmith', business: 'Fashion Boutique', social_media: 'Instagram', profile_link: 'https://instagram.com/sarahsmith' },
      { contact_id: 'CONT003', username: '@mikebrown', business: 'Fitness Studio', social_media: 'Instagram', profile_link: 'https://instagram.com/mikebrown' },
      { contact_id: 'CONT004', username: '@emilychen', business: 'Digital Marketing', social_media: 'LinkedIn', profile_link: 'https://linkedin.com/in/emilychen' },
      { contact_id: 'CONT005', username: '@davidlee', business: 'Real Estate', social_media: 'Facebook', profile_link: 'https://facebook.com/davidlee' },
      { contact_id: 'CONT006', username: '@lisawang', business: 'Coffee Shop', social_media: 'Instagram', profile_link: 'https://instagram.com/lisawang' },
      { contact_id: 'CONT007', username: '@tomharris', business: 'Construction Co', social_media: 'LinkedIn', profile_link: 'https://linkedin.com/in/tomharris' },
      { contact_id: 'CONT008', username: '@annakim', business: 'Beauty Salon', social_media: 'Instagram', profile_link: 'https://instagram.com/annakim' },
      { contact_id: 'CONT009', username: '@jamespark', business: 'Auto Repair', social_media: 'Facebook', profile_link: 'https://facebook.com/jamespark' },
      { contact_id: 'CONT010', username: '@mariagonzalez', business: 'Restaurant', social_media: 'Instagram', profile_link: 'https://instagram.com/mariagonzalez' },
      { contact_id: 'CONT011', username: '@robertjones', business: 'Law Firm', social_media: 'LinkedIn', profile_link: 'https://linkedin.com/in/robertjones' },
      { contact_id: 'CONT012', username: '@jennifertaylor', business: 'Yoga Studio', social_media: 'Instagram', profile_link: 'https://instagram.com/jennifertaylor' },
      { contact_id: 'CONT013', username: '@kevinwhite', business: 'Photography', social_media: 'Instagram', profile_link: 'https://instagram.com/kevinwhite' },
      { contact_id: 'CONT014', username: '@rachelgreen', business: 'Event Planning', social_media: 'Facebook', profile_link: 'https://facebook.com/rachelgreen' },
      { contact_id: 'CONT015', username: '@danielmartin', business: 'Consulting', social_media: 'LinkedIn', profile_link: 'https://linkedin.com/in/danielmartin' },
      { contact_id: 'CONT016', username: '@laurawilson', business: 'Bakery', social_media: 'Instagram', profile_link: 'https://instagram.com/laurawilson' },
      { contact_id: 'CONT017', username: '@chrismoore', business: 'IT Services', social_media: 'LinkedIn', profile_link: 'https://linkedin.com/in/chrismoore' },
      { contact_id: 'CONT018', username: '@nancyanderson', business: 'Interior Design', social_media: 'Instagram', profile_link: 'https://instagram.com/nancyanderson' },
      { contact_id: 'CONT019', username: '@steventhomas', business: 'Accounting', social_media: 'LinkedIn', profile_link: 'https://linkedin.com/in/steventhomas' },
      { contact_id: 'CONT020', username: '@bettygarcia', business: 'Pet Grooming', social_media: 'Facebook', profile_link: 'https://facebook.com/bettygarcia' },
      { contact_id: 'CONT021', username: '@paulrodriguez', business: 'Plumbing', social_media: 'Facebook', profile_link: 'https://facebook.com/paulrodriguez' },
      { contact_id: 'CONT022', username: '@sandralee', business: 'Jewelry Store', social_media: 'Instagram', profile_link: 'https://instagram.com/sandralee' },
      { contact_id: 'CONT023', username: '@georgehall', business: 'Music Studio', social_media: 'Instagram', profile_link: 'https://instagram.com/georgehall' },
      { contact_id: 'CONT024', username: '@dorothyallen', business: 'Florist', social_media: 'Instagram', profile_link: 'https://instagram.com/dorothyallen' },
      { contact_id: 'CONT025', username: '@kenneththompson', business: 'Landscaping', social_media: 'Facebook', profile_link: 'https://facebook.com/kenneththompson' },
      { contact_id: 'CONT026', username: '@carolking', business: 'Graphic Design', social_media: 'Instagram', profile_link: 'https://instagram.com/carolking' },
      { contact_id: 'CONT027', username: '@edwardwright', business: 'Financial Planning', social_media: 'LinkedIn', profile_link: 'https://linkedin.com/in/edwardwright' },
      { contact_id: 'CONT028', username: '@helenlopez', business: 'Nail Salon', social_media: 'Instagram', profile_link: 'https://instagram.com/helenlopez' },
      { contact_id: 'CONT029', username: '@jasonscott', business: 'Roofing', social_media: 'Facebook', profile_link: 'https://facebook.com/jasonscott' },
      { contact_id: 'CONT030', username: '@sharonhill', business: 'Tutoring Service', social_media: 'Facebook', profile_link: 'https://facebook.com/sharonhill' },
    ];

    // Insert contacts
    const { error } = await supabaseAdmin
      .from('contacts')
      .upsert(sampleContacts, { onConflict: 'contact_id' });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: `${sampleContacts.length} contacts seeded successfully`,
    });
  } catch (error) {
    console.error('Seed contacts error:', error);
    return NextResponse.json(
      { error: 'Failed to seed contacts' },
      { status: 500 }
    );
  }
}
