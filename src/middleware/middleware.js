import jwt from 'jsonwebtoken';
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.json({"status": 401, "message": "Token not provided"});
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.json({"status": 403, "message": "Invalid token"});
        }
        req.user = user;
        next();
    });
}

export default authenticateToken;