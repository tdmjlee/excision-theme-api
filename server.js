const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const THEME_ROOT = path.join(__dirname, 'excision-theme');
app.use(express.json());

// Helper: Recursively list all theme files
function listFiles(dir, baseDir = '') {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (let file of list) {
    const relPath = path.join(baseDir, file.name);
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      results = results.concat(listFiles(fullPath, relPath));
    } else {
      results.push(relPath);
    }
  }
  return results;
}

// List all theme files
app.get('/theme-files/list', (req, res) => {
  try {
    const files = listFiles(THEME_ROOT);
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: 'Error listing files' });
  }
});

// Get a specific theme file
app.get('/theme-files/:filepath(*)', (req, res) => {
  const requestedPath = req.params.filepath;
  const filePath = path.join(THEME_ROOT, requestedPath);
  console.log('GET requested for:', requestedPath);

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath, {
      headers: {
        'Content-Disposition': 'inline'
      }
    });
  } else {
    console.error('File not found:', filePath);
    res.status(404).send('File not found');
  }
});

// Update a theme file
app.put('/theme-files/:filepath(*)', (req, res) => {
  const filePath = path.join(THEME_ROOT, req.params.filepath);
  try {
    fs.writeFileSync(filePath, req.body.content || '', 'utf8');
    res.json({ status: 'updated' });
  } catch (err) {
    res.status(500).json({ error: 'Error writing file' });
  }
});

app.listen(3000, () => {
  console.log('Theme API running at http://localhost:3000');
});

