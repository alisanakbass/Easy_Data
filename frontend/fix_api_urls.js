import fs from 'fs';
import path from 'path';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(filePath));
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            results.push(filePath);
        }
    });
    return results;
}

const files = walk('./src');
let changedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Double quotes exact match:
    content = content.replace(/"http:\/\/localhost:8080(.*?(?="))/g, '`http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080$1`');
    // Single quotes exact match:
    content = content.replace(/'http:\/\/localhost:8080(.*?(?=\'))/g, '`http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080$1`');
    // Backticks exact match (excluding the backtick itself):
    content = content.replace(/`http:\/\/localhost:8080(.*?(?=`))/g, '`http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080$1');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        changedCount++;
        console.log(`Updated ${file}`);
    }
});
console.log('Modified ' + changedCount + ' files.');
