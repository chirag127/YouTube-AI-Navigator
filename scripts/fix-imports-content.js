const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all JS files in content directory
const files = glob.sync('extension/content/**/*.js');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Skip if already has gu helper
  if (content.includes('const gu = p => chrome.runtime.getURL(p)')) {
    return;
  }

  // Skip if no imports from shortcuts
  if (!content.includes('utils/shortcuts')) {
    return;
  }

  const imports = [];
  const lines = content.split('\n');
  let firstNonImportLine = 0;

  // Extract all import statements
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith('import ')) {
      imports.push(line);
    } else if (line.trim() && !line.trim().startsWith('//')) {
      firstNonImportLine = i;
      break;
    }
  }

  if (imports.length === 0) return;

  // Convert imports
  const convertedImports = ['const gu = p => chrome.runtime.getURL(p);', ''];

  imports.forEach(imp => {
    // Match: import { x, y as z } from '../../path/file.js';
    const match = imp.match(/import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/);
    if (match) {
      const imports = match[1].trim();
      let importPath = match[2];

      // Convert relative path to absolute
      if (importPath.startsWith('../../utils/shortcuts/')) {
        importPath = importPath.replace('../../utils/shortcuts/', 'utils/shortcuts/');
      } else if (importPath.startsWith('../')) {
        // Calculate absolute path from file location
        const fileDir = path.dirname(file).replace(/\\/g, '/').replace('extension/', '');
        const resolved = path.posix.resolve('/', fileDir, importPath).substring(1);
        importPath = resolved;
      } else if (importPath.startsWith('./')) {
        const fileDir = path.dirname(file).replace(/\\/g, '/').replace('extension/', '');
        const resolved = path.posix.join(fileDir, importPath.substring(2));
        importPath = resolved;
      }

      convertedImports.push(`const { ${imports} } = await import(gu('${importPath}'));`);
    }
  });

  // Remove old imports and add new ones
  const newLines = lines.slice(firstNonImportLine);
  const newContent = convertedImports.join('\n') + '\n' + newLines.join('\n');

  fs.writeFileSync(file, newContent, 'utf8');
  console.log(`Fixed: ${file}`);
});

console.log('Done!');
