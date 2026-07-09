const fs = require('fs');
const url = 'https://fkizlhcipjikyajibtzx.supabase.co/rest/v1/';
const apiKey = 'sb_publishable_Z7fo-7kBUESzP4XnjBjbLw_Kt-73Rzb';

async function main() {
  try {
    const res = await fetch(url, {
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`
      }
    });
    const spec = await res.json();
    
    // Save to a scratch file
    fs.writeFileSync('d:/Workspace/Web/Web_PawCare/scratch/openapi.json', JSON.stringify(spec, null, 2));
    console.log('Saved OpenAPI spec successfully!');
    
    // Search for maximum lengths or patterns in definitions
    const definitions = spec.definitions || {};
    for (const [tableName, definition] of Object.entries(definitions)) {
      const properties = definition.properties || {};
      for (const [colName, prop] of Object.entries(properties)) {
        if (prop.maxLength === 8 || (prop.description && prop.description.includes('8'))) {
          console.log(`Table: ${tableName}, Column: ${colName}, Type: ${prop.type}, MaxLength: ${prop.maxLength}, Desc: ${prop.description}`);
        }
      }
    }
  } catch (err) {
    console.error('Error fetching spec:', err);
  }
}

main();
