// backend/src/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/database'); // Importar la función de conexión
const authRoutes = require('./infrastructure/routes/authRoutes');
const postRoutes = require('./infrastructure/routes/postRoutes');

dotenv.config(); // Cargar variables de entorno

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000', // URL de tu frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'))); // Para servir archivos estáticos

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// Manejo de Errores Globales
app.use((err, req, res, next) => {
    if (err.name === 'MulterError') {
        // Errores de Multer
        return res.status(400).json({ error: err.message });
    } else if (err) {
        // Otros errores
        return res.status(500).json({ error: err.message });
    }
    next();
});

// Conectar a MongoDB y luego iniciar el servidor
connectDB().then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Servidor backend corriendo en el puerto ${PORT}`);
    });
}).catch(err => {
    console.error('Error al conectar a la base de datos:', err);
});

