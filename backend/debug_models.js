const https = require('https');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error('No API Key found in .env');
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log(`Querying: ${url.replace(apiKey, 'HIDDEN_KEY')}`);

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.error) {
                console.error('API Error:', json.error);
            } else if (json.models) {
                console.log('✅ Available Models:');
                json.models.forEach(m => console.log(` - ${m.name} (${m.supportedGenerationMethods})`));
            } else {
                console.log('Unknown response:', json);
            }
        } catch (e) {
            console.error('Failed to parse JSON:', e.message);
            console.log('Raw:', data);
        }
    });

}).on('error', (err) => {
    console.error('Request Error:', err.message);
});
