const fs = require('fs');
const path = require('path');

const key = process.env.WEB3FORMS_ACCESS_KEY || '';
const output = `window.WEB3FORMS_ACCESS_KEY = '${key.replace(/'/g, "\\'")}';\n`;

fs.writeFileSync(path.join(__dirname, '../js/config.js'), output);
console.log('Generated js/config.js');
