const token = 'sb_secret_OO0e2DcNUmhlu2R2hO9yHw_FhM0QX5h'; // Replace with an actual token from your app
const header = JSON.parse(Buffer.from(token.split('.')[0], 'base64').toString());
console.log('JWT header:', header);