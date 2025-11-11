import dotenv from 'dotenv';
import express from 'express';
import fetch from 'node-fetch';
import session from 'express-session';
import bcrypt from 'bcrypt';
import cors from 'cors';
import bodyParser from 'body-parser';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('.'));

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 }
}));

// 👤 Админ авторизация
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  const hash = process.env[`ADMIN_HASH_${username}`];
  
  if (!hash) return res.status(403).json({ ok: false });

  const valid = await bcrypt.compare(password, hash);
  if (!valid) return res.status(401).json({ ok: false });

  req.session.admin = username;
  res.json({ ok: true, user: username });
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/admin/status', (req, res) => {
  if (req.session.admin) return res.json({ ok: true, user: req.session.admin });
  res.json({ ok: false });
});

// 🌐 API тест
app.get('/api/test', async (req, res) => {
  try {
    const resp = await fetch("https://api.openai.com/v1/models", {
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      }
    });

    if (!resp.ok) throw new Error("API ответил с ошибкой " + resp.status);

    const data = await resp.json();
    res.json({
      status: "✅ API доступен",
      models: data.data?.length || 0
    });
  } catch (err) {
    res.json({ status: "❌ Ошибка API", error: err.message });
  }
});

// Discord интеграция (если нужно)
app.post('/api/discord/send', async (req, res) => {
  try {
    const { game, user } = req.body;
    
    // Здесь логика отправки в Discord через ваш бот
    res.json({ ok: true, message: "Запрос отправлен в Discord" });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Serve HTML for all other routes
app.get('*', (req, res) => {
  res.sendFile(process.cwd() + '/index.html');
});

app.listen(PORT, () => console.log(`✅ Сервер запущен на порту ${PORT}`));

export default app;