const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

// Ensure uploads directory exists
const UPLOAD_DIR = path.join(__dirname, 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Configure Multer for disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${Date.now()}_${base}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/bmp', 'image/tiff'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Unsupported file type'));
  }
});

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/] }));

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/', (req, res) => {
  res.json({ message: 'Frontend should call /vision. This server exposes Ollama-only vision JSON API.' });
});

// Helper to get a fetch function in Node 16
async function getFetchFn() {
  if (typeof fetch === 'function') return fetch;
  const mod = await import('node-fetch');
  return mod.default;
}

// Vision route using Ollama qwen3-vl (JSON API)
app.post('/vision', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded.' });
  }
  const imagePath = req.file.path;
  const prompt = (req.body.prompt || 'Describe this image.').trim();
  const model = (req.body.model || 'qwen3-vl').trim();

  try {
    const bytes = fs.readFileSync(imagePath);
    const base64 = Buffer.from(bytes).toString('base64');

    const fetchFn = await getFetchFn();
    const response = await fetchFn('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        images: [base64],
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama HTTP ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const respText = data && typeof data.response === 'string' ? data.response : JSON.stringify(data);

    res.json({ response: respText });
  } catch (err) {
    console.error('Vision error:', err);
    res.status(500).json({ error: err.message || 'Unknown error' });
  } finally {
    try { fs.unlinkSync(imagePath); } catch {}
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Ollama Vision server running on http://localhost:${port}`);
});
