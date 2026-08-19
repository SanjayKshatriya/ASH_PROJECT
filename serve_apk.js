const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
}

const apkPath = path.join(__dirname, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
const ip = getLocalIp();

const server = http.createServer((req, res) => {
    if (req.url === '/app-debug.apk') {
        if (!fs.existsSync(apkPath)) {
            res.writeHead(404);
            res.end('APK not found. Please build it first.');
            return;
        }
        res.writeHead(200, {
            'Content-Type': 'application/vnd.android.package-archive',
            'Content-Disposition': 'attachment; filename="AgroSmartHub.apk"',
            'Content-Length': fs.statSync(apkPath).size
        });
        fs.createReadStream(apkPath).pipe(res);
    } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
            <html>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <body style="font-family:sans-serif; text-align:center; padding-top:50px; background:#f0f2f5;">
                <h2>AgroSmartHub Mobile</h2>
                <p>Click below to install directly to your device.</p>
                <br><br>
                <a href="/app-debug.apk" style="font-size:24px; background:#4CAF50; color:white; padding:15px 30px; text-decoration:none; border-radius:10px; display:inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">Download APK</a>
            </body></html>
        `);
    }
});

server.listen(8080, '0.0.0.0', () => {
    console.log('\n======================================================');
    console.log('   DIRECT DOWNLOAD LINK READY FOR YOUR MOBILE');
    console.log('======================================================');
    console.log('1. Ensure your PC and phone are on the SAME Wi-Fi network.');
    console.log('2. Type the following exact URL in your mobile browser:\n');
    console.log(`   http://${ip}:8080/\n`);
    console.log('Press Ctrl+C to close this server when the download is done.');
});
