const { createClient } = require('@supabase/supabase-js');
const url = 'https://fkizlhcipjikyajibtzx.supabase.co';
const key = 'sb_publishable_Z7fo-7kBUESzP4XnjBjbLw_Kt-73Rzb';
const supabase = createClient(url, key);

async function checkTable(tableName) {
  console.log(`\nChecking table: ${tableName}...`);
  const { data, error } = await supabase.from(tableName).select('*').limit(3);
  
  if (error) {
    console.error(`Error fetching from ${tableName}:`, error.message);
  } else {
    console.log(`Success! Fetched ${data.length} rows.`);
    if (data.length > 0) {
      console.log('Sample row:', data[0]);
    }
  }
}

async function run() {
  await checkTable('service');
  await checkTable('service_duration_rule');
}

run();
