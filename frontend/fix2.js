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

    // The buggy text is: `http://${window.location.hostname === "localhost" ? "localhost" : window.location.hostname}:8080`"
    // The goal is to remove any trailing " or ' that was incorrectly added after the backtick.

    // This regex matches the pattern and checks if there's an extra quote after it.
    content = content.replace(/(`http:\/\/\$\{window\.location\.hostname === "localhost" \? "localhost" : window\.location\.hostname\}:8080[^`]*`)["']/g, '$1');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        changedCount++;
        console.log(`Updated ${file}`);
    }
});
console.log(`Modified ${changedCount} files.`);
