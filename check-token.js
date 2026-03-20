const https = require('https');
const fs = require('fs');

const USER_TOKEN = 'EAAdZBaMhYnc0BQZBfHY7e0LszcbLbc9UnGWZAlwcfAUna7Nk41wWLk4rh7NNK2RgmwKD3j7G0G7cF1kjdq9ZCX15NyyXmZBYmhspZAEJ1T8ZBISi3RfHkKNys9HeScIQvDZBe1JVISbS3jF7del5mGVBebu63SjpZCRBjgkbKvIezDuq7fsOWBWkbqlxeyZA96';

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
        const results = {};
        
        console.log('Fetching permissions for new token...');
        results.permissions = await makeRequest('GET', `/v19.0/me/permissions?access_token=${USER_TOKEN}`);

        console.log('Fetching pages for new token...');
        results.pages = await makeRequest('GET', `/v19.0/me/accounts?access_token=${USER_TOKEN}`);

        fs.writeFileSync('token-report.json', JSON.stringify(results, null, 2));
        console.log('Report saved to Token-report.json');

    } catch (e) {
        console.error('Error:', e);
    }
}

run();
