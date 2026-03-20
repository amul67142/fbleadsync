const https = require('https');
const querystring = require('querystring');
const fs = require('fs');

const PAGE_ID = '230720813468970';
const USER_TOKEN = 'EAAdZBaMhYnc0BQZBfHY7e0LszcbLbc9UnGWZAlwcfAUna7Nk41wWLk4rh7NNK2RgmwKD3j7G0G7cF1kjdq9ZCX15NyyXmZBYmhspZAEJ1T8ZBISi3RfHkKNys9HeScIQvDZBe1JVISbS3jF7del5mGVBebu63SjpZCRBjgkbKvIezDuq7fsOWBWkbqlxeyZA96';

function makeRequest(method, path, body = null, isJson = true) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'graph.facebook.com',
            port: 443,
            path: path,
            method: method,
            headers: {}
        };

        if (body) {
            if (isJson) {
                options.headers['Content-Type'] = 'application/json';
                body = JSON.stringify(body);
            } else {
                options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                body = querystring.stringify(body);
            }
        }

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
            req.write(body);
        }
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

        const results = [];

        console.log('Attempt 1: Query Params (leads)');
        results.push(await makeRequest('POST', `/v19.0/${PAGE_ID}/subscribed_apps?subscribed_fields=leads&access_token=${PAGE_TOKEN}`));

        console.log('Attempt 2: Form Data (leads)');
        results.push(await makeRequest('POST', `/v19.0/${PAGE_ID}/subscribed_apps`, {
            subscribed_fields: 'leads',
            access_token: PAGE_TOKEN
        }, false));

        console.log('Attempt 3: JSON Body (["leads"])');
        results.push(await makeRequest('POST', `/v19.0/${PAGE_ID}/subscribed_apps`, {
            subscribed_fields: ['leads'],
            access_token: PAGE_TOKEN
        }, true));

        console.log('Attempt 4: JSON Body (leads as string)');
        results.push(await makeRequest('POST', `/v19.0/${PAGE_ID}/subscribed_apps`, {
            subscribed_fields: 'leads',
            access_token: PAGE_TOKEN
        }, true));

        fs.writeFileSync('subscription-results.json', JSON.stringify(results, null, 2));
        console.log('Results saved to subscription-results.json');

    } catch (e) {
        console.error('Error:', e);
    }
}

run();
