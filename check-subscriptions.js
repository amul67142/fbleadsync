const https = require('https');

const PAGE_ID = '230720813468970';
const USER_TOKEN = 'EAAdZBaMhYnc0BQZBfHY7e0LszcbLbc9UnGWZAlwcfAUna7Nk41wWLk4rh7NNK2RgmwKD3j7G0G7cF1kjdq9ZCX15NyyXmZBYmhspZAEJ1T8ZBISi3RfHkKNys9HeSfIQvDZBe1JVISbS3jF7del5mGVBebu63SjpZCRBjgkbKvIezDuq7fsOWBWkbqlxeyZA96';

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
                    resolve(data);
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.end();
    });
}

async function run() {
    try {
        console.log('Fetching Page Access Token...');
        const pageResponse = await makeRequest('GET', `/v19.0/${PAGE_ID}?fields=access_token&access_token=${USER_TOKEN}`);
        const PAGE_TOKEN = pageResponse.access_token;
        if (!PAGE_TOKEN) {
            console.error('Failed to get page access token:', pageResponse);
            return;
        }

        console.log('Checking current subscriptions for the page...');
        const subResponse = await makeRequest('GET', `/v19.0/${PAGE_ID}/subscribed_apps?access_token=${PAGE_TOKEN}`);
        
        console.log(JSON.stringify(subResponse, null, 2));

    } catch (e) {
        console.error('Error:', e);
    }
}

run();
