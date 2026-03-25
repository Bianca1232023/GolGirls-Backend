import { openDb } from './configDB.js';
import express from 'express';
import jwt from 'jsonwebtoken';
import { createTableAdmin, getAdmins, updateAdmin, deleteAdmin, registerAdmin} from './controller/users.js';
createTableAdmin();

const app = express();
app.use(express.json());

const PORT = 3000;
const USER = [];
openDb();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.get('/admins', async (req, res) => {
  const admins = await getAdmins();
  res.json({"status": 200, "admins": admins});
});

app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const admin = { name, email, password };
  await registerAdmin(admin);
  res.json({"status": 200, "message": "Admin registered successfully"});
});

app.put('/admins/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, password } = req.body;
  const admin = { name, email, password };
  await updateAdmin(admin, id);
  res.json({"status": 200, "message": "Admin updated successfully"});
});

app.delete('/admins/:id', async (req, res) => {
  const { id } = req.params;
  await deleteAdmin(id);
  res.json({"status": 200, "message": "Admin deleted successfully"});
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});