const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://fkizlhcipjikyajibtzx.supabase.co';
const supabaseKey = 'sb_publishable_Z7fo-7kBUESzP4XnjBjbLw_Kt-73Rzb';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // Thử các format khác nhau để tìm ra constraint yêu cầu gì
  const testCases = [
    // slot_start, slot_end
    ['2026-07-17T10:30:00', '2026-07-17T12:00:00'],      // +90 min, no timezone
    ['2026-07-17T10:30:00+07:00', '2026-07-17T12:00:00+07:00'], // +90 min, with TZ
    ['2026-07-17T03:30:00Z', '2026-07-17T05:00:00Z'],    // UTC equivalent
    ['2026-07-17T10:30:00', '2026-07-17T11:00:00'],      // +30 min
    ['2026-07-17T10:30:00', '2026-07-17T18:00:00'],      // same day end of day
  ];

  for (const [start, end] of testCases) {
    const { error } = await supabase.from('booking_service').insert([{
      booking_service_id: 'BSVTEST2',
      booking_id: 'BGS00001',
      service_id: 'SER00001',
      groomer_id: 'STF00002',
      table_id: 'TAB00002',
      slot_start: start,
      slot_end: end,
      price: 200000
    }]);

    if (error) {
      console.log(`❌ [${start} → ${end}]: ${error.message}`);
    } else {
      console.log(`✅ SUCCESS! [${start} → ${end}]`);
      await supabase.from('booking_service').delete().eq('booking_service_id', 'BSVTEST2');
      break;
    }
  }
}
run();
