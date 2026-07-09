const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

const testStaff = [
  // 5 Admins
  { staff_id: 'STAFF-101', first_name: 'Admin', last_name: 'One', role: 'Admin', email: 'admin1@pawcare.com', password_hash: 'admin123' },
  { staff_id: 'STAFF-102', first_name: 'Admin', last_name: 'Two', role: 'Admin', email: 'admin2@pawcare.com', password_hash: 'admin123' },
  { staff_id: 'STAFF-103', first_name: 'Admin', last_name: 'Three', role: 'Admin', email: 'admin3@pawcare.com', password_hash: 'admin123' },
  { staff_id: 'STAFF-104', first_name: 'Admin', last_name: 'Four', role: 'Admin', email: 'admin4@pawcare.com', password_hash: 'admin123' },
  { staff_id: 'STAFF-105', first_name: 'Admin', last_name: 'Five', role: 'Admin', email: 'admin5@pawcare.com', password_hash: 'admin123' },
  // 2 Staff
  { staff_id: 'STAFF-201', first_name: 'Staff', last_name: 'One', role: 'Staff', email: 'staff1@pawcare.com', password_hash: 'staff123' },
  { staff_id: 'STAFF-202', first_name: 'Staff', last_name: 'Two', role: 'Staff', email: 'staff2@pawcare.com', password_hash: 'staff123' }
];

async function seedStaff() {
  console.log('Seeding admin and staff test accounts to Supabase (compatible columns)...');
  for (const s of testStaff) {
    const { data, error } = await supabase.from('staff').upsert(s, { onConflict: 'staff_id' }).select();
    if (error) {
      console.error(`Failed to seed ${s.email}:`, error.message);
    } else {
      console.log(`Seeded successfully: ${s.email} (Role: ${s.role})`);
    }
  }
}

seedStaff();
