import { openDb } from "../configDB.js";

export async function createTableAdmin() {
  openDb().then(db => {
    db.exec('CREATE TABLE IF NOT EXISTS admins (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, password TEXT)');
  })
}

export async function registerAdmin(admin) {
    openDb().then(db => {
        db.run('INSERT INTO admins (name, email, password) VALUES (?, ?, ?)', [admin.name, admin.email, admin.password]);
    })
}

export async function loginAdmin(email, password) {
    return openDb().then(db => {
        return db.get('SELECT * FROM admins WHERE email = ? AND password = ?', [email, password]);
    })
}

export async function getAdmins(id) {
  return openDb().then(db => {
    return db.all('SELECT * FROM admins WHERE id = ?', [id]);
  })
}

export async function updateAdmin(admin, id){
    openDb().then(db => {
        db.run('UPDATE admins SET name = ?, email = ?, password = ? WHERE id = ?', [admin.name, admin.email, admin.password, id]);
    })
}

export async function deleteAdmin(id){
    openDb().then(db => {
        db.run('DELETE FROM admins WHERE id = ?', [id]);
    })
}
