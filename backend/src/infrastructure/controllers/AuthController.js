// backend/src/infrastructure/controllers/AuthController.js
const AuthService = require('../../application/services/AuthService');

class AuthController {
    constructor(authService) {
        this.authService = authService;
    }

    register = async (req, res) => {
        try {
            const { username, email, password } = req.body;
            const user = await this.authService.register({ username, email, password });
            res.status(201).json({ message: 'Usuario registrado exitosamente.', user: { id: user._id, username: user.username, email: user.email } });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };

    login = async (req, res) => {
        try {
            const { email, password } = req.body;
            const { user, token } = await this.authService.login({ email, password });

            if (user.is2FAEnabled) {
                // Indicar que se requiere 2FA
                return res.status(200).json({ message: 'Se requiere autenticación de dos factores.', require2FA: true, userId: user._id });
            }

            // Enviar el token JWT
            res.status(200).json({ message: 'Login exitoso.', token, user: { id: user._id, username: user.username, email: user.email } });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };

    verify2FA = async (req, res) => {
        try {
            const { userId, token } = req.body;
            const isValid = await this.authService.verify2FA(userId, token);

            if (isValid) {
                // Generar un nuevo JWT con autenticación completa
                const user = await this.authService.userRepository.findById(userId);
                const newToken = jwt.sign(
                    { id: user._id, email: user.email },
                    "Santiago",
                    { expiresIn: 1 }
                );

                res.status(200).json({ message: 'Autenticación 2FA exitosa.', token: newToken, user: { id: user._id, username: user.username, email: user.email } });
            } else {
                res.status(400).json({ error: 'Token 2FA inválido.' });
            }
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };

    generate2FA = async (req, res) => {
        try {
            const userId = req.user.id; // Asumiendo que el usuario está autenticado
            const { secret, qrCode } = await this.authService.generate2FASecret(userId);
            res.status(200).json({ message: 'Se generó el secreto 2FA.', secret, qrCode });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };

    enable2FA = async (req, res) => {
        try {
            const userId = req.user.id; // Asumiendo que el usuario está autenticado
            await this.authService.enable2FA(userId);
            res.status(200).json({ message: 'Autenticación de dos factores habilitada.' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };

    disable2FA = async (req, res) => {
        try {
            const userId = req.user.id; // Asumiendo que el usuario está autenticado
            await this.authService.disable2FA(userId);
            res.status(200).json({ message: 'Autenticación de dos factores deshabilitada.' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
}

module.exports = AuthController;
