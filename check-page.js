const https = require('https');
const fs = require('fs');

const USER_TOKEN = 'EAAdZBaMhYnc0BQZBZBuuU9MODNIZAxGH4XOjBAZABIHQIOiztFngFeul2g8HJXuuMtFgZAQIP7Ek9knYDO3oZBASPbEpFJ4yx1cIlwJnFgVNqEZCw5OKJ5sX8sNvN2cSN0HtAy3N9ZADfyCSoQzlj7uVot50Gj6e3BWGkW0OUTZCv56jSWAqPlTT6TZC0mvw3cALDN12vUunvG2DN6ZC39uiVrFozI5WkFGsEudPf9vNpOPPM9fRzhu6jJZCRLGbwYtC0bGZBamdRHNEbqHyuCIOsZD';
const PAGE_ID = '230720813468970';

function makeRequest(method, path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'graph.facebook.com',
            port: 443,
            path: path,
            method: method
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    console.error('Failed to parse response:', data);
                    reject(e);
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.end();
    });
}

async function run() {
    try {
        console.log(`Checking access to Page ID: ${PAGE_ID}...`);
        const pageResponse = await makeRequest('GET', `/v19.0/${PAGE_ID}?fields=name,access_token&access_token=${USER_TOKEN}`);
        
        console.log(JSON.stringify(pageResponse, null, 2));

    } catch (e) {
        console.error('Error:', e);
    }
}

run();
