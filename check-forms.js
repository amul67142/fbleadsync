const https = require('https');
const fs = require('fs');

const USER_TOKEN = 'EAAdZBaMhYnc0BQZBfHY7e0LszcbLbc9UnGWZAlwcfAUna7Nk41wWLk4rh7NNK2RgmwKD3j7G0G7cF1kjdq9ZCX15NyyXmZBYmhspZAEJ1T8ZBISi3RfHkKNys9HeScIQvDZBe1JVISbS3jF7del5mGVBebu63SjpZCRBjgkbKvIezDuq7fsOWBWkbqlxeyZA96';
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
        console.log(`Getting Page Access Token for Page ID: ${PAGE_ID}...`);
        const pageResponse = await makeRequest('GET', `/v19.0/${PAGE_ID}?fields=access_token&access_token=${USER_TOKEN}`);
        
        if (!pageResponse.access_token) {
            console.error('Failed to get Page Access Token:', pageResponse);
            fs.writeFileSync('forms-report.json', JSON.stringify({ error: 'Failed to get Page Access Token', response: pageResponse }, null, 2));
            return;
        }

        const PAGE_TOKEN = pageResponse.access_token;
        console.log('Successfully retrieved Page Access Token.');

        console.log(`Fetching lead forms for Page ID: ${PAGE_ID}...`);
        const formsResponse = await makeRequest('GET', `/v19.0/${PAGE_ID}/leadgen_forms?access_token=${PAGE_TOKEN}`);
        
        fs.writeFileSync('forms-report.json', JSON.stringify(formsResponse, null, 2));
        console.log('Report saved to forms-report.json');

    } catch (e) {
        console.error('Error:', e);
    }
}

run();
