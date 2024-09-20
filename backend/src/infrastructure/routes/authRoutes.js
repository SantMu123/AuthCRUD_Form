// backend/src/infrastructure/routes/authRoutes.js
const express = require('express');
const { body } = require('express-validator');
const AuthController = require('../controllers/AuthController');
const UserRepository = require('../../domain/repositories/UserRepository');
const UserModel = require('../../domain/models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const router = express.Router();

// Implementación concreta del repositorio
class MongooseUserRepository extends UserRepository {
    constructor() {
        super();
    }

    async create(userData) {
        const user = new UserModel(userData);
        return await user.save();
    }

    async findByUsername(username) {
        return await UserModel.findOne({ username });
    }

    async findByEmail(email) {
        return await UserModel.findOne({ email });
    }

    async findById(id) {
        return await UserModel.findById(id);
    }

    async findByIdAndUpdate(id, update) {
        return await UserModel.findByIdAndUpdate(id, update, { new: true });
    }
}

// Instancias de repositorio y servicio
const userRepository = new MongooseUserRepository();
const AuthService = require('../../application/services/AuthService');
const authService = new AuthService(userRepository);
const AuthControllerInstance = new AuthController(authService);

// Middleware para autenticar JWT
const authenticateJWT = require('../../middlewares/authenticateJWT');

// Rutas
router.post(
    '/register',
    [
        body('username')
            .notEmpty().withMessage('El nombre de usuario es requerido.')
            .isLength({ max: 255 }).withMessage('El nombre de usuario debe tener 255 caracteres o menos.'),
        body('email')
            .isEmail().withMessage('Correo electrónico inválido.')
            .normalizeEmail(),
        body('password')
            .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),
    ],
    (req, res, next) => {
        const errors = require('express-validator').validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array().map(err => err.msg) });
        }
        next();
    },
    AuthControllerInstance.register
);

router.post(
    '/login',
    [
        body('email')
            .isEmail().withMessage('Correo electrónico inválido.')
            .normalizeEmail(),
        body('password')
            .notEmpty().withMessage('La contraseña es requerida.'),
    ],
    (req, res, next) => {
        const errors = require('express-validator').validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array().map(err => err.msg) });
        }
        next();
    },
    AuthControllerInstance.login
);

router.post(
    '/verify-2fa',
    [
        body('userId')
            .notEmpty().withMessage('userId es requerido.'),
        body('token')
            .notEmpty().withMessage('Token 2FA es requerido.'),
    ],
    (req, res, next) => {
        const errors = require('express-validator').validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array().map(err => err.msg) });
        }
        next();
    },
    AuthControllerInstance.verify2FA
);

// Rutas protegidas para manejar 2FA
router.post('/2fa/generate', authenticateJWT, AuthControllerInstance.generate2FA);
router.post('/2fa/enable', authenticateJWT, AuthControllerInstance.enable2FA);
router.post('/2fa/disable', authenticateJWT, AuthControllerInstance.disable2FA);

module.exports = router;
