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
    res.status(500).json({ error: err.message });
  }
});

// GET /theme-files/read?path=sections/header.liquid
app.get('/theme-files/read', (req, res) => {
  const relativePath = req.query.path;
  const fullPath = path.join(THEME_ROOT, relativePath);
  if (!fs.existsSync(fullPath)) {
    return res.status(404).send('File not found');
  }
  res.sendFile(fullPath);
});

// PUT /theme-files/write?path=sections/header.liquid
app.put('/theme-files/write', (req, res) => {
  const relativePath = req.query.path;
  const fullPath = path.join(THEME_ROOT, relativePath);
  try {
    fs.writeFileSync(fullPath, req.body.content || '', 'utf8');
    res.json({ status: 'updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log('Theme API running at http://localhost:3000');
});

