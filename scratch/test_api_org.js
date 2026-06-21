const http = require('http');

const postData = JSON.stringify({
  email: 'hr@acme.com',
  password: 'Admin@1234'
});

const loginOptions = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const loginReq = http.request(loginOptions, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      const token = parsed.data?.accessToken || parsed.accessToken;
      console.log('Login Response:', JSON.stringify(parsed, null, 2));
      if (!token) {
        console.log('No token received');
        return;
      }
      
      // Get organization
      const orgOptions = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/organizations',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      const orgReq = http.request(orgOptions, (resOrg) => {
        let orgData = '';
        resOrg.on('data', (chunk) => { orgData += chunk; });
        resOrg.on('end', () => {
          try {
            console.log('Organization Response Status:', resOrg.statusCode);
            console.log('Organization Response:', JSON.stringify(JSON.parse(orgData), null, 2));
          } catch (e) {
            console.log('Error parsing org body:', orgData);
          }
        });
      });
      orgReq.end();

    } catch (e) {
      console.log('Error parsing login body:', data);
    }
  });
});

loginReq.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

loginReq.write(postData);
loginReq.end();
