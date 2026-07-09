const fs = require('fs');
const path = require('path');

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

function escapeStr(str) {
  if (typeof str !== 'string') return "''";
  return "'" + str.replace(/'/g, "''") + "'";
}

function generateSQL() {
  let sql = '-- Seed Data for Supabase\n\n';

  // 1. Products
  const products = parseExport(path.join(__dirname, '../data/products.js'));
  sql += '-- === PRODUCTS ===\n';
  
  const productVals = [];
  const variantVals = [];
  const imageVals = [];

  for (const p of products) {
    const pId = escapeStr(p.id);
    const catId = escapeStr(CATEGORY_MAP[p.category] || 'CAT00001');
    const brand = escapeStr(p.brand || '');
    const name = escapeStr(p.name || '');
    const desc = escapeStr(p.description || '');

    productVals.push(`(${pId}, ${catId}, ${brand}, ${name}, ${desc}, true)`);

    // Variants
    if (p.variants && p.variants.length > 0) {
      for (let i = 0; i < p.variants.length; i++) {
        const v = p.variants[i];
        variantVals.push(`(${escapeStr(p.id + '-V' + (i+1))}, ${pId}, ${escapeStr(p.id + '-' + (i+1))}, ${escapeStr(v)}, ${p.price || 0}, ${p.stock || 0})`);
      }
    } else {
      variantVals.push(`(${escapeStr(p.id + '-V1')}, ${pId}, ${escapeStr(p.id + '-1')}, 'Mặc định', ${p.price || 0}, ${p.stock || 0})`);
    }

    // Images
    if (p.image) {
      imageVals.push(`(${escapeStr(p.id + '-IMG')}, ${pId}, ${escapeStr(p.image)})`);
    }
  }

  if (productVals.length) {
    sql += `INSERT INTO public.product (product_id, category_id, brand, name, description, is_active) VALUES\n${productVals.join(',\n')} ON CONFLICT (product_id) DO NOTHING;\n\n`;
  }
  if (variantVals.length) {
    sql += `INSERT INTO public.product_variant (variant_id, product_id, sku, capacity_label, price, stock_quantity) VALUES\n${variantVals.join(',\n')} ON CONFLICT (variant_id) DO NOTHING;\n\n`;
  }
  if (imageVals.length) {
    sql += `INSERT INTO public.product_image (image_id, product_id, image_url) VALUES\n${imageVals.join(',\n')} ON CONFLICT (image_id) DO NOTHING;\n\n`;
  }

  // 2. Services
  const services = parseExport(path.join(__dirname, '../data/services.js'));
  sql += '-- === SERVICES ===\n';
  const serviceVals = [];
  for (const s of services) {
    serviceVals.push(`(${escapeStr(s.id)}, ${escapeStr(s.name)}, ${escapeStr(s.category || 'Grooming')}, ${escapeStr(s.description || '')}, true)`);
  }
  if (serviceVals.length) {
    sql += `INSERT INTO public.service (service_id, service_name, service_type, description, is_active) VALUES\n${serviceVals.join(',\n')} ON CONFLICT (service_id) DO NOTHING;\n\n`;
  }

  fs.writeFileSync(path.join(__dirname, '../insert.sql'), sql);
  console.log('Generated insert.sql');
}

generateSQL();
