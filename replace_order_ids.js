const fs = require('fs');

let orders = fs.readFileSync('data/ordersApi.js', 'utf8');

// The orders in ordersApi.js are ORD-1001, ORD-1002, etc. up to ORD-1011
for (let i = 1; i <= 11; i++) {
  const oldId = `ORD-10${i.toString().padStart(2, '0')}`;
  const newId = `SP-000${i.toString().padStart(2, '0')}`;
  orders = orders.replace(new RegExp(oldId, 'g'), newId);
}

// Update the creation logic in data/ordersApi.js
orders = orders.replace(
  /order_id: \`ORD-\$\{Math\.floor\(1000 \+ Math\.random\(\) \* 9000\)\}\`,/g,
  "order_id: `SP-${String(dbOrders.length + 1).padStart(5, '0')}`,"
);

fs.writeFileSync('data/ordersApi.js', orders);

// Let's also check pages/staff/shop/index.jsx for 'OD-...'
let shopIndex = fs.readFileSync('pages/staff/shop/index.jsx', 'utf8');
shopIndex = shopIndex.replace(/'OD-\.\.\.'/g, "'SP-...'");
fs.writeFileSync('pages/staff/shop/index.jsx', shopIndex);

console.log("Updated ordersApi.js and shop index");
