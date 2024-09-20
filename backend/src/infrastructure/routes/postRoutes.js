// backend/src/infrastructure/routes/postRoutes.js
const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const PostController = require('../controllers/PostController');

const router = express.Router();

// Configuración de multer para subir archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/jpg'].includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Formato de archivo no soportado'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 2048 * 1024 }, // 2MB
    fileFilter: fileFilter,
});

// Dependencias de servicios y repositorios
const InMemoryPostRepository = require('../repositories/InMemoryPostRepository');
const PostService = require('../../application/services/PostService');

const postRepository = new InMemoryPostRepository();
const postService = new PostService(postRepository);
const postController = new PostController(postService);

// Rutas
router.post(
    '/',
    upload.single('image'),
    [
        body('title')
            .notEmpty().withMessage('El título es requerido.')
            .isLength({ max: 255 }).withMessage('El título debe tener 255 caracteres o menos.'),
        body('content')
            .notEmpty().withMessage('El contenido es requerido.'),
    ],
    (req, res, next) => {
        const errors = require('express-validator').validationResult(req);
        if (!errors.isEmpty()) {
            // Eliminar el archivo subido si hay errores de validación
            if (req.file) {
                const fs = require('fs');
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error(err);
                });
            }
            return res.status(400).json({ errors: errors.array().map(err => err.msg) });
        }
        next();
    },
    postController.createPost
);

router.get('/', postController.getAllPosts);

module.exports = router;
