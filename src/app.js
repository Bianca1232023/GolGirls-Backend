import { openDb } from './configDB.js';
import express from 'express';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());

const PORT = 3000;
const USER = [];
openDb();

app.get('/', (req, res) => {
  res.send('Hello Worl d!');
});

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.get('/users', async (req, res) => {
  const users = await getUsers();
  res.json({"status": 200, "users": users});
});

app.post('/register', async (req, res) => {
  const { matricula, nucleo, função } = req.body;
  const db = await openDb();
  res.status(201).send('User registered successfully');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});