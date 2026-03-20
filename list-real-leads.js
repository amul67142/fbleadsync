const https = require('https');

const PAGE_TOKEN = 'EAAdZBaMhYnc0BQ6EGOVJTxEgtjetlOmeBCMXZAT2CFqfnaeVfmKi2iNDO9QClO6wgZAr5KEAUYhFy01QwhWqxsgqFjb3pZBxoFTj3ZCoRHXyAVVU1AyxNm2CHTVZAFZAhMm0gaaIZBFc7hB4h3FgzNLxgXwdYAe2HZCmcZBBYv14eRBvFAekVoTFBjsiwfDyZAAllmazRQZD';
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
        console.log(`Fetching lead forms for page ${PAGE_ID}...`);
        const forms = await makeRequest('GET', `/v19.0/${PAGE_ID}/leadgen_forms?access_token=${PAGE_TOKEN}`);
        
        if (!forms.data || forms.data.length === 0) {
            console.log('No forms found.');
            return;
        }

        for (const form of forms.data) {
            console.log(`\nChecking leads for form: ${form.name} (${form.id})`);
            const leads = await makeRequest('GET', `/v19.0/${form.id}/leads?access_token=${PAGE_TOKEN}`);
            console.log(JSON.stringify(leads, null, 2));
        }

    } catch (e) {
        console.error('Error:', e);
    }
}

run();
