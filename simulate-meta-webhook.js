const http = require('http');

// Simulate the JSON body from Meta
const metaBody = {
  object: 'page',
  entry: [
    {
      id: '230720813468970',
      time: Math.floor(Date.now() / 1000),
      changes: [
        {
          value: {
            form_id: '1942124341942124', // Correct form ID for Pune kanpur
            leadgen_id: '10161405021575834', // This lead ID is in that form
            page_id: '230720813468970',
            adgroup_id: '123',
            ad_id: '456'
          },
          field: 'leadgen'
        }
      ]
    }
  ]
};

const postData = JSON.stringify(metaBody);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/meta/webhook',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.setEncoding('utf8');
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  res.on('end', () => {
    console.log(`BODY: ${body}`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(postData);
req.end();
