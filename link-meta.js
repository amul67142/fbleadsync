const https = require('https');

const PAGE_ID = '230720813468970';
const USER_TOKEN = 'EAAdZBaMhYnc0BQZBfHY7e0LszcbLbc9UnGWZAlwcfAUna7Nk41wWLk4rh7NNK2RgmwKD3j7G0G7cF1kjdq9ZCX15NyyXmZBYmhspZAEJ1T8ZBISi3RfHkKNys9HeScIQvDZBe1JVISbS3jF7del5mGVBebu63SjpZCRBjgkbKvIezDuq7fsOWBWkbqlxeyZA96';

function makeRequest(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'graph.facebook.com',
            port: 443,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
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
        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function run() {
    try {
        console.log('Fetching Page Access Token...');
        const pageResponse = await makeRequest('GET', `/v19.0/${PAGE_ID}?fields=access_token&access_token=${USER_TOKEN}`);
        
        if (!pageResponse.access_token) {
            console.error('Failed to get page access token:', pageResponse);
            return;
        }
        
        const PAGE_TOKEN = pageResponse.access_token;
        console.log('Successfully retrieved Page Token.');

        console.log('Subscribing App to Page Leads...');
        // Fixed: Use 'leadgen' instead of 'leads' as per v19.0 requirements
        const subResponse = await makeRequest('POST', `/v19.0/${PAGE_ID}/subscribed_apps?subscribed_fields=leadgen&access_token=${PAGE_TOKEN}`);
        
        console.log('Subscription Response:', JSON.stringify(subResponse, null, 2));

        if (subResponse.success || subResponse.ok) {
            console.log('✅ Successfully resubscribed the app to page leads!');
        } else {
            console.log('❌ Failed to resubscribe. Check error details above.');
        }

    } catch (e) {
        console.error('Error:', e);
    }
}

run();
