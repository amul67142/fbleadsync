const https = require('https');

const PAGE_TOKEN = 'EAAdZBaMhYnc0BQ6EGOVJTxEgtjetlOmeBCMXZAT2CFqfnaeVfmKi2iNDO9QClO6wgZAr5KEAUYhFy01QwhWqxsgqFjb3pZBxoFTj3ZCoRHXyAVVU1AyxNm2CHTVZAFZAhMm0gaaIZBFc7hB4h3FgzNLxgXwdYAe2HZCmcZBBYv14eRBvFAekVoTFBjsiwfDyZAAllmazRQZD';

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
        console.log('Debugging Page Access Token...');
        const res = await makeRequest('GET', `/debug_token?input_token=${PAGE_TOKEN}&access_token=${PAGE_TOKEN}`);
        console.log(JSON.stringify(res, null, 2));

    } catch (e) {
        console.error('Error:', e);
    }
}

run();
