const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const THEME_ROOT = path.join(__dirname, 'excision-theme');
app.use(express.json());

// Recursively list all files
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


// GET /theme-files/list
app.get('/theme-files/list', (req, res) => {
  try {
    const files = listFiles(THEME_ROOT);
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: 'Error listing files' });
  }
});

// GET /theme-files/:filepath(*) - Read a theme file
app.get('/theme-files/:filepath(*)', (req, res) => {
  const filePath = path.join(THEME_ROOT, req.params.filepath);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath, { headers: { 'Content-Disposition': 'inline' } });
  } else {
    res.status(404).send('File not found');
  }
});

// PUT /theme-files/:filepath(*) - Update a theme file
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

