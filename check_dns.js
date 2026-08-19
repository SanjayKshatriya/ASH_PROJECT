const dns = require('dns');

dns.lookup('google.com', (err, addr) => {
    console.log('google.com:', err ? err.code : addr);
});

dns.lookup('mekkljheshjekexwpnso.supabase.co', (err, addr) => {
    console.log('supabase.co:', err ? err.code : addr);
});
