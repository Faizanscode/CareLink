const fs = require('fs');
let c = fs.readFileSync('src/api/client.ts', 'utf8');
c = c.replace(/\\\`/g, '`').replace(/\\\$/g, '$');
fs.writeFileSync('src/api/client.ts', c);
