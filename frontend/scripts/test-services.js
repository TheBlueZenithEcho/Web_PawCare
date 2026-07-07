const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

// We need to run this like NEXT does, but since it's ES module, we'll just require it dynamically if possible, or just copy the logic.
const { createClient } = require('@supabase/supabase-js');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function testFetchServices() {
  console.log('Fetching services from:', url);
  const { data, error } = await supabase.from('service').select('*');
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Services:', data);
  }
}
testFetchServices();
