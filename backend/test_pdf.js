const pdf = require('pdf-parse');
const fs = require('fs');

console.log('Type of pdf export:', typeof pdf);
console.log('Keys:', Object.keys(pdf));
console.log('Exports:', pdf);

// Create a dummy buffer to test if valid
const dummyBuffer = Buffer.from('Dummy PDF Content');

try {
    pdf(dummyBuffer).then(data => {
        console.log('Parsed text:', data.text);
    }).catch(err => {
        console.log('Parse error (expected for dummy buffer):', err.message);
    });
} catch (e) {
    console.error('Immediate execution error:', e);
}
