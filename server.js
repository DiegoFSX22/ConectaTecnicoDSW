console.log("JS funcionando!");

require('dotenv').config();
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'troque_esta_chave';
const DB_FILE = process.env.DB_FILE || path.join(__dirname, 'conectatecnico.db');

// abrir/criar banco
const db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) {
    console.error('Erro abrindo DB', err);
    process.exit(1);
  }
  console.log('Banco SQLite conectado em', DB_FILE);
});

// middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// autenticação JWT middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Token ausente' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token inválido' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(401).json({ error: 'Token inválido' });
    req.user = user; // { id, nome, email, tipo }
    next();
  });
}

// --- ROTAS --- //

app.post('/api/register', (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'nome, email e senha são obrigatórios' });
  }

  db.get('SELECT id FROM usuario WHERE email = ?', [email], (err, row) => {
    if (err) return res.status(500).json({ error: 'Erro no banco' });
    if (row) return res.status(400).json({ error: 'Email já cadastrado' });

    const hash = bcrypt.hashSync(senha, 10);

    db.run(
      `INSERT INTO usuario (nome, email, senha) VALUES (?,?,?)`,
      [nome, email, hash],
      function (err) {
        if (err) return res.status(500).json({ error: 'Erro ao criar usuário' });

        const token = jwt.sign(
          { id: this.lastID, nome, email },
          JWT_SECRET,
          { expiresIn: '8h' }
        );

        res.json({
          message: 'Técnico registrado',
          token,
          user: { id: this.lastID, nome, email }
        });
      }
    );
  });
});


app.post('/api/login', (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha)
    return res.status(400).json({ error: 'Email e senha obrigatórios' });

  db.get('SELECT * FROM usuario WHERE email = ?', [email], (err, user) => {
    if (err || !user)
      return res.status(400).json({ error: 'Credenciais inválidas' });

    if (!bcrypt.compareSync(senha, user.senha))
      return res.status(400).json({ error: 'Credenciais inválidas' });

    const token = jwt.sign(
      { id: user.id, nome: user.nome, email: user.email },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Login realizado',
      token,
      user: { id: user.id, nome: user.nome, email: user.email }
    });
  });
});



app.get('/api/assistances', (req, res) => {
  const { q, categoria, cidade } = req.query;
  let sql = `SELECT a.id, a.nome, a.categoria, a.endereco, a.cidade, a.contato, a.descricao, a.usuario_id
             FROM assistencia a WHERE 1=1`;
  const params = [];
  if (q) {
    sql += ` AND a.nome LIKE ?`;
    params.push(`%${q}%`);
  }
  if (categoria) {
    sql += ` AND a.categoria = ?`;
    params.push(categoria);
  }
  if (cidade) {
    sql += ` AND a.cidade = ?`;
    params.push(cidade);
  }
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar assistências' });
    res.json(rows);
  });
});

app.get('/api/assistances/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM assistencia WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Erro no banco' });
    if (!row) return res.status(404).json({ error: 'Assistência não encontrada' });
    res.json(row);
  });
});


app.post('/api/assistances', authenticateToken, (req, res) => {
  const user = req.user;

  const { nome, categoria, endereco, cidade, contato, descricao } = req.body;
  if (!nome || !categoria || !endereco || !contato) {
    return res.status(400).json({ error: 'nome, categoria, endereco e contato são obrigatórios' });
  }

  db.get('SELECT COUNT(*) AS cnt FROM assistencia WHERE usuario_id = ?', [user.id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Erro no banco' });
    if (row.cnt >= 3) return res.status(400).json({ error: 'Limite de 3 assistências atingido' });

    const stmt = db.prepare(`INSERT INTO assistencia (nome, categoria, endereco, cidade, contato, descricao, usuario_id)
                             VALUES (?,?,?,?,?,?,?)`);
    stmt.run([nome, categoria, endereco, cidade || '', contato, descricao || '', user.id], function(err) {
      if (err) return res.status(500).json({ error: 'Erro ao salvar assistencia' });
      res.json({ message: 'Assistência cadastrada', id: this.lastID });
    });
  });
});


app.put('/api/assistances/:id', authenticateToken, (req, res) => {
  const user = req.user;
  const id = req.params.id;
  db.get('SELECT * FROM assistencia WHERE id = ?', [id], (err, asst) => {
    if (err) return res.status(500).json({ error: 'Erro no banco' });
    if (!asst) return res.status(404).json({ error: 'Assistência não encontrada' });
    if (asst.usuario_id !== user.id) return res.status(403).json({ error: 'Somente o dono pode editar' });

    const { nome, categoria, endereco, cidade, contato, descricao } = req.body;
    db.run(
      `UPDATE assistencia SET nome=?, categoria=?, endereco=?, cidade=?, contato=?, descricao=? WHERE id=?`,
      [nome || asst.nome, categoria || asst.categoria, endereco || asst.endereco, cidade || asst.cidade, contato || asst.contato, descricao || asst.descricao, id],
      function(err) {
        if (err) return res.status(500).json({ error: 'Erro ao atualizar' });
        res.json({ message: 'Assistência atualizada' });
      }
    );
  });
});


app.delete('/api/assistances/:id', authenticateToken, (req, res) => {
  const user = req.user;
  const id = req.params.id;
  db.get('SELECT * FROM assistencia WHERE id = ?', [id], (err, asst) => {
    if (err) return res.status(500).json({ error: 'Erro no banco' });
    if (!asst) return res.status(404).json({ error: 'Assistência não encontrada' });
    if (asst.usuario_id !== user.id) return res.status(403).json({ error: 'Somente o dono pode deletar' });

    db.run('DELETE FROM assistencia WHERE id = ?', [id], function(err) {
      if (err) return res.status(500).json({ error: 'Erro ao deletar' });
      res.json({ message: 'Assistência excluída' });
    });
  });
});

app.get('/api/me', authenticateToken, (req, res) => {
  db.get('SELECT id, nome, email, tipo, data_cadastro FROM usuario WHERE id = ?', [req.user.id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Erro no banco' });
    if (!row) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(row);
  });
});

// start server
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
