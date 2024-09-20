// backend/src/middlewares/authenticateJWT.js
const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, "Santiago", (err, user) => {
            if (err) {
                return res.status(403).json({ error: 'Token inválido.' });
            }

            req.user = user; // { id, email, iat, exp }
            next();
        });
    } else {
        res.status(401).json({ error: 'Autenticación requerida.' });
    }
};

module.exports = authenticateJWT;
