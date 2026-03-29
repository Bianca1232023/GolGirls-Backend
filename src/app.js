import 'dotenv/config'
import { openDb } from './configDB.js';
import express from 'express';
import { createTableAdmin, createTableProfessor } from './controller/users.js';
import routes from './routes/routes.js';

createTableAdmin();
createTableProfessor();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const USER = [];
openDb();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.use(routes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});