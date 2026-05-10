import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const replaceMap = {
  'bg-[#0a0a0a]': 'bg-background',
  'bg-[#141414]': 'bg-card',
  'bg-[#1e1e1e]': 'bg-secondary',
  'text-[#F5F5F5]': 'text-foreground',
  'text-[#8A8A8A]': 'text-secondary-foreground',
  'text-[#4A4A4A]': 'text-muted-foreground',
  'border-[rgba(255,255,255,0.08)]': 'border-border-subtle',
  'border-[rgba(255,255,255,0.04)]': 'border-border',
};

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    for (const [key, value] of Object.entries(replaceMap)) {
      content = content.split(key).join(value);
    }
    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated ${filePath}`);
    }
  }
});
