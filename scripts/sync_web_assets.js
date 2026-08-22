const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const assetsDir = path.join(projectRoot, 'android', 'app', 'src', 'main', 'assets');

// Files and folders to copy
const itemsToCopy = ['index.html', 'app.html', 'sw.js', 'css', 'js'];

function copyRecursive(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    if (isDirectory) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        fs.readdirSync(src).forEach(childItemName => {
            copyRecursive(path.join(src, childItemName), path.join(dest, childItemName));
        });
    } else if (exists) {
        const destDir = path.dirname(dest);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }
        fs.copyFileSync(src, dest);
    }
}

console.log('Syncing Web Assets to Android assets directory...');
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
}

itemsToCopy.forEach(item => {
    const srcPath = path.join(projectRoot, item);
    const destPath = path.join(assetsDir, item);
    if (fs.existsSync(srcPath)) {
        copyRecursive(srcPath, destPath);
        console.log(`Copied ${item} -> android/app/src/main/assets/${item}`);
    } else {
        console.warn(`Warning: Source item ${item} does not exist.`);
    }
});

console.log('Web assets sync completed successfully!');
