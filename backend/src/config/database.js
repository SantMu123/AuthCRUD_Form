// backend/src/config/database.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config(); // Cargar variables de entorno

const connectDB = async () => {
    try {
        const uri = "mongodb://mongo:XGNVyBJzcRjWgIorbuhLODpbYevXGhjQ@autorack.proxy.rlwy.net:38007";
        if (!uri) {
            throw new Error('MONGO_URI no está definido en las variables de entorno.');
        }
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB conectado correctamente');
    } catch (error) {
        console.error('Error de conexión a MongoDB:', error.message);
        process.exit(1); // Terminar el proceso con fallo
    }
};

module.exports = connectDB;
