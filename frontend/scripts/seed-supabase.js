const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const url = 'https://fkizlhcipjikyajibtzx.supabase.co';
const key = 'sb_publishable_Z7fo-7kBUESzP4XnjBjbLw_Kt-73Rzb';
const supabase = createClient(url, key);

function parseExport(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const sanitized = content.replace(/export\s+const\s+\w+\s*=\s*/g, 'module.exports = ');
  const tmpPath = filePath + '.tmp.js';
  fs.writeFileSync(tmpPath, sanitized);
  const data = require(tmpPath);
  fs.unlinkSync(tmpPath);
  return data;
}

const CATEGORY_MAP = {
  'Thức ăn': 'CAT00001',
  'Đồ chơi': 'CAT00002',
  'Phụ kiện': 'CAT00003',
  'Dinh dưỡng': 'CAT00004',
  'Vệ sinh': 'CAT00005'
};

async function seed() {
  console.log('Seeding data to Supabase...');

  // 1. Seed Products
  try {
    const products = parseExport(path.join(__dirname, '../data/products.js'));
    console.log(`Found ${products.length} products to seed.`);
    for (const p of products) {
      // Insert Product
      const productData = {
        product_id: p.id,
        category_id: CATEGORY_MAP[p.category] || 'CAT00001',
        brand: p.brand || '',
        name: p.name || '',
        description: p.description || '',
        is_active: true
      };
      
      const { error: pErr } = await supabase.from('product').upsert(productData, { onConflict: 'product_id' });
      if (pErr) console.log('Err product:', p.id, pErr.message);

      // Insert Variants
      if (p.variants && p.variants.length > 0) {
        for (let i = 0; i < p.variants.length; i++) {
          const v = p.variants[i];
          const variantData = {
            variant_id: `${p.id}-V${i+1}`,
            product_id: p.id,
            sku: `${p.id}-${i+1}`,
            capacity_label: v,
            price: p.price || 0,
            stock_quantity: p.stock || 0
          };
          const { error: vErr } = await supabase.from('product_variant').upsert(variantData, { onConflict: 'variant_id' });
          if (vErr) console.log('Err variant:', variantData.variant_id, vErr.message);
        }
      } else {
        const variantData = {
          variant_id: `${p.id}-V1`,
          product_id: p.id,
          sku: `${p.id}-1`,
          capacity_label: 'Mặc định',
          price: p.price || 0,
          stock_quantity: p.stock || 0
        };
        const { error: vErr } = await supabase.from('product_variant').upsert(variantData, { onConflict: 'variant_id' });
        if (vErr) console.log('Err variant:', variantData.variant_id, vErr.message);
      }

      // Insert Image
      if (p.image) {
        const imgData = {
          image_id: `${p.id}-IMG`,
          product_id: p.id,
          image_url: p.image
        };
        const { error: iErr } = await supabase.from('product_image').upsert(imgData, { onConflict: 'image_id' });
        if (iErr) console.log('Err image:', imgData.image_id, iErr.message);
      }
    }
    console.log('Products seeding done.');
  } catch(e) {
    console.log('Error seeding products:', e.message);
  }

  // 2. Seed Services
  try {
    const services = parseExport(path.join(__dirname, '../data/services.js'));
    console.log(`Found ${services.length} services to seed.`);
    for (const s of services) {
      const srvData = {
        service_id: s.id,
        service_name: s.name,
        service_type: s.category || 'Grooming',
        description: s.description || '',
        is_active: true
      };
      // For price, since service table doesn't have price, the price might be in another table or maybe missing.
      // We will just insert service for now.
      const { error: sErr } = await supabase.from('service').upsert(srvData, { onConflict: 'service_id' });
      if (sErr) console.log('Err service:', s.id, sErr.message);
    }
    console.log('Services seeding done.');
  } catch(e) {
    console.log('Error seeding services:', e.message);
  }

  console.log('Seeding completed!');
}

seed();
