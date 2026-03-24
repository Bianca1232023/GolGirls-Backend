import { openDb } from "../configDB.js";

export async function createTableAdmin() {
  openDb().then(db => {
    db.exec('CREATE TABLE IF NOT EXISTS admins (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, password TEXT)')
  })
}

export async function registerAdmin(admins) {
    openDb().then(db => {
        db.run('INSERT INTO admins (matricula, email, password) VALUES (?, ?, ?)', [admins.matricula, admins.email, admins.password])
    })
}

export async function getAdmins(id) {
  return openDb().then(db => {
    return db.all('SELECT * FROM admins WHERE id = ?', [id]);
  })
}
