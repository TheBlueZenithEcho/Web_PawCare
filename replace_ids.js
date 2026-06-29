const fs = require('fs');

let bookings = fs.readFileSync('data/bookings.js', 'utf8');

// Replace specific old mock IDs
const mapping = {
  '"BK-20260628-001"': '"GS-00001"',
  '"BK-20260628-002"': '"GS-00002"',
  '"BK-20260628-003"': '"HT-00001"',
  '"BK-20260628-004"': '"GS-00003"',
  '"BK003"': '"HT-00002"',
  '"HT-001"': '"HT-00003"',
  '"HT-002"': '"HT-00004"',
  '"HT-003"': '"HT-00005"',
  '"BK-20260627-006"': '"GS-00004"',
  '"BK-20260627-007"': '"GS-00005"',
  '"BK-20260626-008"': '"GS-00006"',
  '"BK-20260626-009"': '"GS-00007"'
};

for (const [oldId, newId] of Object.entries(mapping)) {
  bookings = bookings.replace(new RegExp(`booking_id:\\s*${oldId}`, 'g'), `booking_id: ${newId}`);
}

fs.writeFileSync('data/bookings.js', bookings);

// Also need to update the logic in data/api.js for generating new bookings
let api = fs.readFileSync('data/api.js', 'utf8');
api = api.replace(
  /booking_id: \`BK-20260628-\$\{String\(dbBookings\.length \+ 1\)\.padStart\(3, '0'\)\}\`,/g,
  "booking_id: `${bookingData.service_category === 'Hotel' || bookingData.service_type === 'Hotel' ? 'HT' : 'GS'}-${String(dbBookings.length + 1).padStart(5, '0')}`,"
);
fs.writeFileSync('data/api.js', api);

console.log("Updated bookings and api");
