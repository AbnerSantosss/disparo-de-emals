const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;

// ══════════════════════════════════════════════
//  DATABASE SETUP (SQLite)
// ══════════════════════════════════════════════
const dbPath = process.env.DB_PATH || path.join(__dirname, 'mailforge.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS smtp_config (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    subject TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    selected INTEGER DEFAULT 1
  );
`);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ══════════════════════════════════════════════
//  SMTP CONFIG ENDPOINTS
// ══════════════════════════════════════════════

// GET — Load saved SMTP config
app.get('/api/smtp-config', (req, res) => {
  try {
    const row = db.prepare('SELECT email, password, subject FROM smtp_config WHERE id = 1').get();
    if (row) {
      res.json({ exists: true, email: row.email, password: row.password, subject: row.subject || '' });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    console.error('Error loading SMTP config:', error.message);
    res.status(500).json({ error: 'Erro ao carregar configuração SMTP.' });
  }
});

// POST — Save SMTP config
app.post('/api/smtp-config', (req, res) => {
  const { email, password, subject } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha de app são obrigatórios.' });
  }

  try {
    const upsert = db.prepare(`
      INSERT INTO smtp_config (id, email, password, subject)
      VALUES (1, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET email = ?, password = ?, subject = ?
    `);
    upsert.run(email, password, subject || '', email, password, subject || '');
    res.json({ success: true, message: 'Configuração SMTP salva no banco de dados!' });
  } catch (error) {
    console.error('Error saving SMTP config:', error.message);
    res.status(500).json({ error: 'Erro ao salvar configuração SMTP.' });
  }
});

// DELETE — Remove SMTP config
app.delete('/api/smtp-config', (req, res) => {
  try {
    db.prepare('DELETE FROM smtp_config WHERE id = 1').run();
    res.json({ success: true, message: 'Configuração SMTP removida.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover configuração.' });
  }
});

// ══════════════════════════════════════════════
//  CONTACTS ENDPOINTS
// ══════════════════════════════════════════════

// GET — Load all contacts
app.get('/api/contacts', (req, res) => {
  try {
    const rows = db.prepare('SELECT email, selected FROM contacts ORDER BY id ASC').all();
    res.json(rows.map(r => ({ email: r.email, selected: !!r.selected })));
  } catch (error) {
    console.error('Error loading contacts:', error.message);
    res.status(500).json({ error: 'Erro ao carregar contatos.' });
  }
});

// POST — Save/sync contacts (replace all)
app.post('/api/contacts', (req, res) => {
  const { contacts } = req.body;

  if (!Array.isArray(contacts)) {
    return res.status(400).json({ error: 'Lista de contatos inválida.' });
  }

  try {
    const transaction = db.transaction(() => {
      db.prepare('DELETE FROM contacts').run();
      const insert = db.prepare('INSERT OR IGNORE INTO contacts (email, selected) VALUES (?, ?)');
      for (const c of contacts) {
        insert.run(c.email, c.selected ? 1 : 0);
      }
    });
    transaction();
    res.json({ success: true, message: `${contacts.length} contatos salvos.` });
  } catch (error) {
    console.error('Error saving contacts:', error.message);
    res.status(500).json({ error: 'Erro ao salvar contatos.' });
  }
});

// ══════════════════════════════════════════════
//  SMTP ACTION ENDPOINTS
// ══════════════════════════════════════════════

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test SMTP connection
app.post('/api/test-connection', async (req, res) => {
  const { email, appPassword } = req.body;

  if (!email || !appPassword) {
    return res.status(400).json({ error: 'E-mail e senha de app são obrigatórios.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: email,
        pass: appPassword,
      },
    });

    await transporter.verify();
    res.json({ success: true, message: 'Conexão SMTP verificada com sucesso!' });
  } catch (error) {
    console.error('SMTP connection error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Falha na conexão SMTP. Verifique e-mail e senha de app.',
      details: error.message,
    });
  }
});

// Send email
app.post('/api/send', async (req, res) => {
  const { smtpEmail, smtpPassword, recipients, subject, htmlContent } = req.body;

  if (!smtpEmail || !smtpPassword) {
    return res.status(400).json({ error: 'Configuração SMTP não definida.' });
  }
  if (!recipients || recipients.length === 0) {
    return res.status(400).json({ error: 'Nenhum destinatário selecionado.' });
  }
  if (!htmlContent) {
    return res.status(400).json({ error: 'Nenhum conteúdo HTML para enviar.' });
  }
  if (!subject) {
    return res.status(400).json({ error: 'Assunto do e-mail é obrigatório.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpEmail,
        pass: smtpPassword,
      },
    });

    const results = [];

    for (const recipient of recipients) {
      try {
        console.log(`Tentando enviar para: ${recipient}...`);
        const info = await transporter.sendMail({
          from: smtpEmail,
          to: recipient,
          subject: subject,
          html: htmlContent,
        });
        console.log(`Sucesso para ${recipient}. MessageId: ${info.messageId}`);
        results.push({ recipient, success: true, messageId: info.messageId });
      } catch (err) {
        console.error(`ERRO AO ENVIAR PARA ${recipient}:`, err);
        results.push({ recipient, success: false, error: err.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    console.log(`Resumo do Envio -> Sucesso: ${successCount} | Falha: ${failCount}`);

    res.json({
      success: true,
      message: `Enviado: ${successCount} | Falhou: ${failCount}`,
      results,
    });
  } catch (error) {
    console.error('Send error:', error.message);
    res.status(500).json({ error: 'Erro ao enviar e-mails.', details: error.message });
  }
});

// Serve the app
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Graceful shutdown — close DB
process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`\n  ⚡ MailForge rodando em http://localhost:${PORT}`);
  console.log(`  📦 Banco de dados: ${dbPath}\n`);
});
