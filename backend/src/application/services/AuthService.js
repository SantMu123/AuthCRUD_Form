// backend/src/application/services/AuthService.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

class AuthService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async register({ username, email, password }) {
        // Verificar si el usuario ya existe
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new Error('El correo electrónico ya está registrado.');
        }

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear nuevo usuario
        const newUser = await this.userRepository.create({
            username,
            email,
            password: hashedPassword,
        });

        return newUser;
    }

    async login({ email, password }) {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Credenciales inválidas.');
        }

        // Verificar contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Credenciales inválidas.');
        }

        // Generar JWT
        const token = jwt.sign(
            { id: user._id, email: user.email },
            "Santiago",
            { expiresIn: 1 }
        );

        return { user, token };
    }

    async generate2FASecret(userId) {
        const secret = speakeasy.generateSecret({ name: `HexagonalApp (${userId})` });

        // Guardar el secreto en el usuario
        await this.userRepository.findByIdAndUpdate(userId, { twoFASecret: secret.base32 });

        // Generar QR para Google Authenticator
        const qrCode = await qrcode.toDataURL(secret.otpauth_url);

        return { secret: secret.base32, qrCode };
    }

    async verify2FA(userId, token) {
        const user = await this.userRepository.findById(userId);
        if (!user || !user.twoFASecret) {
            throw new Error('2FA no está habilitado para este usuario.');
        }

        const verified = speakeasy.totp.verify({
            secret: user.twoFASecret,
            encoding: 'base32',
            token,
            window: 1,
        });

        if (!verified) {
            throw new Error('Token 2FA inválido.');
        }

        // Si es válido, puedes marcar la sesión o token como autenticada completamente
        return true;
    }

    async enable2FA(userId) {
        await this.userRepository.findByIdAndUpdate(userId, { is2FAEnabled: true });
    }

    async disable2FA(userId) {
        await this.userRepository.findByIdAndUpdate(userId, {
            is2FAEnabled: false,
            twoFASecret: null,
        });
    }
}

module.exports = AuthService;
