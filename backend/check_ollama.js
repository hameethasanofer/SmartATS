const http = require('http');

const options = {
    hostname: '127.0.0.1',
    port: 11434,
    path: '/api/tags',
    method: 'GET'
};

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Ollama is reachable!');
        console.log('Status Code:', res.statusCode);
        try {
            const json = JSON.parse(data);
            console.log('Available Models:', JSON.stringify(json.models.map(m => m.name), null, 2));
        } catch (e) {
            console.log('Raw Response:', data);
        }
    });
});

req.on('error', (error) => {
    console.error('Error connecting to Ollama:', error.message);
    console.log('Please ensure Ollama is installed and running (default port 11434).');
});

req.end();
