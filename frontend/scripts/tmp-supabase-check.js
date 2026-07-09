const { createClient } = require('@supabase/supabase-js');
const url = 'https://fkizlhcipjikyajibtzx.supabase.co';
const key = 'sb_publishable_Z7fo-7kBUESzP4XnjBjbLw_Kt-73Rzb';
const supabase = createClient(url, key);

(async () => {
  const tables = ['products', 'product', 'services', 'service', 'bookings', 'booking'];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(3);
    console.log('TABLE', table);
    console.log(JSON.stringify({ data, error }, null, 2));
  }
})();
