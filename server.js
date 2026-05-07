const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'mailforge_super_secret_key_123';

// Setup uploads directory
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Setup multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// ══════════════════════════════════════════════
//  DATABASE SETUP (SQLite)
// ══════════════════════════════════════════════
const dbPath = process.env.DB_PATH || path.join(__dirname, 'mailforge.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    smtp_email TEXT DEFAULT '',
    smtp_password TEXT DEFAULT '',
    smtp_subject TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    email TEXT NOT NULL,
    selected INTEGER DEFAULT 1,
    UNIQUE(user_id, email),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

// Insert default admin if not exists
const adminExists = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
if (!adminExists) {
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)').run('admin', hash, 'admin');
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ══════════════════════════════════════════════
//  AUTH & MIDDLEWARES
// ══════════════════════════════════════════════
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido ou expirado.' });
    req.user = user;
    next();
  });
}

function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
  }
}

// Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
  }

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, role: user.role, username: user.username });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ id: req.user.id, username: req.user.username, role: req.user.role });
});

// ══════════════════════════════════════════════
//  ADMIN ENDPOINTS (User Management)
// ══════════════════════════════════════════════
app.get('/api/users', authenticateToken, isAdmin, (req, res) => {
  const users = db.prepare('SELECT id, username, role FROM users').all();
  res.json(users);
});

app.post('/api/users', authenticateToken, isAdmin, (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Usuário e senha obrigatórios.' });

  try {
    const hash = bcrypt.hashSync(password, 10);
    const result = db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)').run(username, hash, role || 'user');
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.status(400).json({ error: 'Usuário já existe.' });
    } else {
      res.status(500).json({ error: 'Erro ao criar usuário.' });
    }
  }
});

app.delete('/api/users/:id', authenticateToken, isAdmin, (req, res) => {
  if (parseInt(req.params.id) === req.user.id) {
    return res.status(400).json({ error: 'Você não pode deletar a si mesmo.' });
  }
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ══════════════════════════════════════════════
//  SMTP CONFIG ENDPOINTS (Per User)
// ══════════════════════════════════════════════
app.get('/api/smtp-config', authenticateToken, (req, res) => {
  try {
    const row = db.prepare('SELECT smtp_email, smtp_password, smtp_subject FROM users WHERE id = ?').get(req.user.id);
    if (row && row.smtp_email) {
      res.json({ exists: true, email: row.smtp_email, password: row.smtp_password, subject: row.smtp_subject || '' });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar configuração SMTP.' });
  }
});

app.post('/api/smtp-config', authenticateToken, (req, res) => {
  const { email, password, subject } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha de app são obrigatórios.' });
  }
  try {
    db.prepare('UPDATE users SET smtp_email = ?, smtp_password = ?, smtp_subject = ? WHERE id = ?').run(email, password, subject || '', req.user.id);
    res.json({ success: true, message: 'Configuração SMTP salva!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao salvar configuração SMTP.' });
  }
});

// ══════════════════════════════════════════════
//  CONTACTS ENDPOINTS (Per User)
// ══════════════════════════════════════════════
app.get('/api/contacts', authenticateToken, (req, res) => {
  try {
    const rows = db.prepare('SELECT email, selected FROM contacts WHERE user_id = ? ORDER BY id ASC').all(req.user.id);
    res.json(rows.map(r => ({ email: r.email, selected: !!r.selected })));
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar contatos.' });
  }
});

app.post('/api/contacts', authenticateToken, (req, res) => {
  const { contacts } = req.body;
  if (!Array.isArray(contacts)) return res.status(400).json({ error: 'Lista de contatos inválida.' });

  try {
    const transaction = db.transaction(() => {
      db.prepare('DELETE FROM contacts WHERE user_id = ?').run(req.user.id);
      const insert = db.prepare('INSERT OR IGNORE INTO contacts (user_id, email, selected) VALUES (?, ?, ?)');
      for (const c of contacts) {
        insert.run(req.user.id, c.email, c.selected ? 1 : 0);
      }
    });
    transaction();
    res.json({ success: true, message: `${contacts.length} contatos salvos.` });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao salvar contatos.' });
  }
});

// ══════════════════════════════════════════════
//  IMAGE UPLOAD ENDPOINT
// ══════════════════════════════════════════════
app.post('/api/upload', authenticateToken, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }
  // Return the relative URL to access the image
  const url = '/uploads/' + req.file.filename;
  res.json({ success: true, url });
});

// ══════════════════════════════════════════════
//  SMTP ACTION ENDPOINTS
// ══════════════════════════════════════════════
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.post('/api/test-connection', authenticateToken, async (req, res) => {
  const { email, appPassword } = req.body;
  if (!email || !appPassword) return res.status(400).json({ error: 'E-mail e senha de app são obrigatórios.' });

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: email, pass: appPassword },
    });
    await transporter.verify();
    res.json({ success: true, message: 'Conexão SMTP verificada!' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Falha na conexão SMTP.', details: error.message });
  }
});

app.post('/api/send', authenticateToken, async (req, res) => {
  const { smtpEmail, smtpPassword, recipients, subject, htmlContent } = req.body;

  if (!smtpEmail || !smtpPassword) return res.status(400).json({ error: 'Configuração SMTP não definida.' });
  if (!recipients || recipients.length === 0) return res.status(400).json({ error: 'Nenhum destinatário.' });
  if (!htmlContent) return res.status(400).json({ error: 'Nenhum conteúdo HTML.' });
  if (!subject) return res.status(400).json({ error: 'Assunto obrigatório.' });

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: smtpEmail, pass: smtpPassword },
    });

    const results = [];
    for (const recipient of recipients) {
      try {
        const info = await transporter.sendMail({
          from: smtpEmail,
          to: recipient,
          subject: subject,
          html: htmlContent,
        });
        results.push({ recipient, success: true, messageId: info.messageId });
      } catch (err) {
        results.push({ recipient, success: false, error: err.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    res.json({ success: true, message: `Enviado: ${successCount} | Falhou: ${failCount}`, results });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao enviar e-mails.', details: error.message });
  }
});

// Serve the app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`\n  ⚡ MailForge rodando em http://localhost:${PORT}`);
  console.log(`  📦 Banco de dados: ${dbPath}\n`);
});
