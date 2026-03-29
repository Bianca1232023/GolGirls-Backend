import express from 'express';
import authenticateToken from '../middleware/middleware.js';
import jwt from 'jsonwebtoken';
import { getAdmins, updateAdmin, deleteAdmin, registerAdmin, loginAdmin, registerProfessor ,updateAdminPartial } from '../controller/users.js';

const router = express.Router();

// ROTAS DE ADMIN

router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
	const admin = { name, email, password };
	await registerAdmin(admin);
	res.json({"status": 200, "message": "Admin registered successfully"});
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const admin = await loginAdmin(email, password);
    if (admin) {
        const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({"status": 200, "token": token});
    } else {
        res.json({"status": 401, "message": "Invalid email or password"});
    }
});

router.post('/admin/createprofessor', authenticateToken, async (req, res) => {
    const { name, email, password } = req.body;
    const professor = { name, email, password };
    await registerProfessor(professor);
    res.json({"status": 200, "message": "Professor created successfully"});
});

router.get('/admins', authenticateToken, async (req, res) => {
    const { id } = req.query;
    const admins = await getAdmins(id);
    res.json({"status": 200, "admins": admins});
});

router.put('/admins/:id', authenticateToken, async (req, res) => {
	const { id } = req.params;
	const { name, email, password } = req.body;
	const admin = { name, email, password };
	await updateAdmin(admin, id);
	res.json({"status": 200, "message": "Admin updated successfully"});
});

router.patch('/admins/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const result = await updateAdminPartial(req.body, id);
    
    if (result.error) {
        return res.json({"status": 400, "message": result.error});
    }
    res.json({"status": 200, "message": "Admin updated successfully"});
});

router.delete('/admins/:id', authenticateToken, async (req, res) => {
	const { id } = req.params;
	await deleteAdmin(id);
	res.json({"status": 200, "message": "Admin deleted successfully"});
});

// ROTAS DE PROFESSOR

export default router;
