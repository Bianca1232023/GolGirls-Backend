import express from 'express';
const jwt = require('jsonwebtoken');

const app = express();

const PORT = 3000;
const USER = [];

app.post('/login', (req, res) => {
  const {matricula, senha} = req.body;
  const user = { matricula, senha };

  USER.push(user);

  const token = jwt.sign(user, 'your_secret_key', { expiresIn: '1h' });

  res.json({ token });
});