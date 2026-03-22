const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const results = {
  "API Links": {},
  "Internal Pages": {},
  "Images & Static Assets": {},
  "External Links": {},
  "Contact Links (Email/Phone)": {}
};

function processFile(filePath) {
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    return;
  }

  const regexes = [
    /(?:href|src)=["']([^"']+)["']/g,
    /(?:fetch|axios\.(?:get|post|put|delete|patch))\s*\(\s*["']([^"']+)["']/g,
    /["'](https?:\/\/[^"']+)["']/g,
    /["'](\/api\/[^"']+)["']/g,
    /["'](\/[^"']*\.(?:png|jpg|jpeg|svg|gif|webp))["']/g
  ];

  regexes.forEach(regex => {
    let match;
    while ((match = regex.exec(content)) !== null) {
      const link = match[1];
      const relPath = path.relative(__dirname, filePath).replace(/\\/g, '/');
      
      let category = "Internal Pages";
      if (link.startsWith('http')) {
        category = "External Links";
      } else if (link.startsWith('/api/') || link.includes('/api/')) {
        category = "API Links";
      } else if (link.match(/\.(png|jpg|jpeg|svg|gif|webp)$/i)) {
        category = "Images & Static Assets";
      } else if (link.startsWith('mailto:') || link.startsWith('tel:')) {
        category = "Contact Links (Email/Phone)";
      } else if (!link.startsWith('/')) {
        continue; // ignore random non-absolute strings
      }

      if (!results[category][link]) {
        results[category][link] = new Set();
      }
      results[category][link].add(relPath);
    }
  });
}

function walkDir(dir) {
  let files;
  try {
    files = fs.readdirSync(dir);
  } catch (e) {
    return;
  }
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.match(/\.(tsx|ts|jsx|js)$/)) {
      processFile(fullPath);
    }
  });
}

walkDir(srcDir);

let output = "";

for (const [category, links] of Object.entries(results)) {
  if (Object.keys(links).length === 0) continue;
  
  output += `### ${category}\n`;
  for (const [link, files] of Object.entries(links)) {
    output += `- **\`${link}\`**\n`;
    files.forEach(file => {
      output += `  - ${file}\n`;
    });
  }
  output += '\n';
}

fs.writeFileSync('links_output.md', output);
console.log('Script executed successfully!');
