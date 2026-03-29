import { openDb } from "../configDB.js";

export async function createTableAdmin() {
  openDb().then(db => {
    db.exec('CREATE TABLE IF NOT EXISTS admins (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, password TEXT)');
  })
}

export async function createTableProfessor() {
    openDb().then(db => {
      db.exec('CREATE TABLE IF NOT EXISTS professors (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, password TEXT)');
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

export async function registerProfessor(professor) {
    openDb().then(db => {
        db.run('INSERT INTO professors (name, email, password) VALUES (?, ?, ?)', [professor.name, professor.email, professor.password]);
    })
}

export async function loginProfessor(email, password) {
    return openDb().then(db => {
        return db.get('SELECT * FROM professors WHERE email = ? AND password = ?', [email, password]);
    })
}

export async function getAdmins(id) {
  return openDb().then(db => {
    if (id) {
      return db.all('SELECT * FROM admins WHERE id = ?', [id]);
    }
    return db.all('SELECT * FROM admins');
  })
}

export async function getProfessors(id) {
    return openDb().then(db => {
      if (id) {
        return db.all('SELECT * FROM professors WHERE id = ?', [id]);
      }
      return db.all('SELECT * FROM professors');
    })
}

export async function updateAdmin(admin, id){
    openDb().then(db => {
        db.run('UPDATE admins SET name = ?, email = ?, password = ? WHERE id = ?', [admin.name, admin.email, admin.password, id]);
    })
}

export async function updateAdminPartial(updates, id) {
    return openDb().then(db => {
        const fields = [];
        const values = [];

        if (updates.name !== undefined) {
            fields.push('name = ?');
            values.push(updates.name);
        }
        if (updates.email !== undefined) {
            fields.push('email = ?');
            values.push(updates.email);
        }
        if (updates.password !== undefined) {
            fields.push('password = ?');
            values.push(updates.password);
        }

        if (fields.length === 0) {
            return { error: "Nenhum campo para atualizar" };
        }

        values.push(id);
        const query = `UPDATE admins SET ${fields.join(', ')} WHERE id = ?`;
        return db.run(query, values);
    })
}

export async function deleteAdmin(id){
    openDb().then(db => {
        db.run('DELETE FROM admins WHERE id = ?', [id]);
    })
}
