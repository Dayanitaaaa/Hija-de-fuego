import { User } from '../models/users.Models.js';
import { sendResetPasswordEmail, sendVerificationEmail } from '../config/mailer.js';
import crypto from 'crypto';
import { generateOtp, addMinutes, normalizePhone, isLikelyColombianPhone } from '../services/otp.service.js';

export const showUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: "Error fetching users", details: error.message });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { User_email } = req.body;
        console.log(`[FORGOT-PASSWORD] Solicitud recibida para: ${User_email}`);
        
        if (!User_email) return res.status(400).json({ error: 'Email is required' });

        const user = await User.findByEmail(User_email);
        if (!user) {
            console.log(`[FORGOT-PASSWORD] Usuario no encontrado para el correo: ${User_email}`);
            return res.status(200).json({ message: 'Si el correo está registrado, se enviará un enlace de recuperación.' });
        }

        console.log(`[FORGOT-PASSWORD] Usuario encontrado: ${user.User_name} (ID: ${user.User_id})`);

        const token = crypto.randomBytes(20).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hora

        await User.updateResetToken(user.User_id, token, expires);
        console.log(`[FORGOT-PASSWORD] Token generado y guardado en DB para el usuario ID: ${user.User_id}`);

        const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
        const resetUrl = `${baseUrl}/generalViews/reset-password/${token}`;
        
        console.log(`[FORGOT-PASSWORD] Intentando enviar email a ${user.User_email}...`);
        try {
            await sendResetPasswordEmail(user.User_email, user.User_name, resetUrl);
            console.log(`[FORGOT-PASSWORD] Email enviado exitosamente a ${user.User_email}`);
        } catch (mailError) {
            console.error(`[FORGOT-PASSWORD] ERROR CRÍTICO al enviar email:`, mailError);
            return res.status(500).json({ error: 'Error al enviar el correo de recuperación', details: mailError.message });
        }

        res.status(200).json({ message: 'Si el correo está registrado, se enviará un enlace de recuperación.' });
    } catch (error) {
        console.error(`[FORGOT-PASSWORD] ERROR inesperado:`, error);
        res.status(500).json({ error: 'Error processing forgot password', details: error.message });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        if (!newPassword) return res.status(400).json({ error: 'New password is required' });

        const user = await User.findByResetToken(token);
        if (!user) {
            return res.status(400).json({ error: 'Token inválido o expirado' });
        }

        await User.updatePassword(user.User_id, newPassword);

        res.status(200).json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error resetting password', details: error.message });
    }
};

export const showUsersId = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: "User not found" });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: "Error fetching user", details: error.message });
    }
};

export const addUsers = async (req, res) => {
    try {
        const { User_name, User_email, User_password, User_phone, Roles_fk } = req.body;
        if (!User_name || !User_email || !User_password || !Roles_fk || !User_phone) {
            return res.status(400).json({ error: 'Missing required fields'});
        }

        const normalizedPhone = normalizePhone(User_phone);
        if (!isLikelyColombianPhone(normalizedPhone)) {
            return res.status(400).json({ error: 'Número de celular inválido' });
        }

        // Generar OTP de 6 dígitos
        const otp = generateOtp(6);
        const expires = addMinutes(new Date(), 15); // 15 minutos

        try {
            const user = await User.create({ 
                User_name, 
                User_email, 
                User_password, 
                User_phone: normalizedPhone,
                Roles_fk,
                verification_token: otp,
                verification_expires: expires
            });

            // Enviar email de verificación
            await sendVerificationEmail(User_email, User_name, otp);

            res.status(201).json({
                message: 'Usuario registrado. Por favor verifica tu correo.',
                email: User_email,
                status: 201
            });
        } catch (err) {
            if (err.message === 'Email already exists') {
                return res.status(409).json({ error: 'Email already exists' });
            }
            throw err;
        }
    } catch (error) {
        console.error('[REGISTER] Error:', error);
        res.status(500).json({ error: 'Error adding users', details: error.message });
    }
};

export const verifyPhoneOTP = async (req, res) => {
    try {
        const { User_email, otp } = req.body;
        if (!User_email || !otp) {
            return res.status(400).json({ error: 'Email and OTP are required' });
        }

        const verified = await User.verifyPhoneOTP(User_email, otp);
        if (verified) {
            res.status(200).json({ message: 'Celular verificado exitosamente' });
        } else {
            res.status(400).json({ error: 'Código inválido o expirado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error verifying phone OTP', details: error.message });
    }
};

export const resendPhoneOTP = async (req, res) => {
    try {
        const { User_email } = req.body;
        const user = await User.findByEmail(User_email);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const phoneOtp = generateOtp(6);
        const phoneExpires = addMinutes(new Date(), 15);
        await User.updatePhoneOTP(User_email, phoneOtp, phoneExpires);

        console.log(`[PHONE-OTP] Reenvío para ${user.User_phone || '(sin teléfono)'} (usuario ${User_email}): ${phoneOtp} (expira: ${phoneExpires.toISOString()})`);
        res.status(200).json({ message: 'Nuevo código generado para verificación de celular (envío manual por WhatsApp)' });
    } catch (error) {
        res.status(500).json({ error: 'Error resending phone OTP', details: error.message });
    }
};

export const verifyOTP = async (req, res) => {
    try {
        const { User_email, otp } = req.body;
        if (!User_email || !otp) {
            return res.status(400).json({ error: 'Email and OTP are required' });
        }

        const verified = await User.verifyOTP(User_email, otp);
        if (verified) {
            res.status(200).json({ message: 'Cuenta verificada exitosamente' });
        } else {
            res.status(400).json({ error: 'Código inválido o expirado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error verifying OTP', details: error.message });
    }
};

export const resendOTP = async (req, res) => {
    try {
        const { User_email } = req.body;
        const user = await User.findByEmail(User_email);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 15 * 60000);

        await User.updateOTP(User_email, otp, expires);
        await sendVerificationEmail(User_email, user.User_name, otp);

        res.status(200).json({ message: 'Nuevo código enviado' });
    } catch (error) {
        res.status(500).json({ error: 'Error resending OTP', details: error.message });
    }
};

export const updateUsers = async (req, res) => {
    try {
        const { User_name, User_email, User_password, User_phone, Roles_fk } = req.body;
        if (!User_name || !User_email || !Roles_fk) {
            return res.status(400).json({ error: 'Missing required fields'});
        }
        try {
            const updated = await User.update(req.params.id, { User_name, User_email, User_password, User_phone, Roles_fk });
            if (updated === 0) return res.status(404).json({ error: 'Users not found' });
            res.status(200).json({
                data: [{ id: req.params.id, User_name, User_email, User_phone, Roles_fk }],
                status: 200,
                update: updated
            });
        } catch (err) {
            if (err.message === 'Email already exists') {
                return res.status(409).json({ error: 'Email already exists' });
            }
            throw err;
        }
    } catch (error) {
        res.status(500).json({ error: 'Error updating users', details: error.message });
    }
};

export const deleteUsers = async (req, res) => {
    try {
        const deleted = await User.delete(req.params.id);
        if (deleted === 0) return res.status(404).json({ error: 'Users not found' });
        res.status(200).json({
            data: [],
            status: 200,
            deleted
        });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting users', details: error.message });
    }
};

export const loginUsers = async (req, res) => {
    try {
        const { User_email, User_password } = req.body;
        if (!User_email || !User_password) {
            console.log('Faltan campos requeridos');
            return res.status(400).json({ error: 'Missing required fields'});
        }
        try {
            const { token, role, user } = await User.login({ User_email, User_password });
            res.json({ token, role, user });
        } catch (err) {
            console.log('Error en login:', err.message);
            if (err.message === 'Invalid email') {
                return res.status(401).json({ error: 'Invalid email' });
            }
            if (err.message === 'Invalid password') {
                return res.status(401).json({ error: 'Invalid password' });
            }
            if (err.message === 'Email not verified') {
                return res.status(403).json({ error: 'Email not verified', email: User_email });
            }
            if (err.message === 'Phone not verified') {
                return res.status(403).json({ error: 'Phone not verified', email: User_email });
            }
            throw err;
        }
    } catch (error) {
        console.log('Error inesperado en loginUsers:', error);
        res.status(500).json({ error: 'Error logging in user', details: error.message });
    }
};

export const getProfile = async (req, res) => {
    try {
        // El ID viene del middleware verifyToken
        const userId = req.user.id;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({
            User_id: user.User_id,
            User_name: user.User_name,
            User_email: user.User_email,
            User_phone: user.User_phone,
            Roles_fk: user.Roles_fk
        });
    } catch (error) {
        res.status(500).json({ error: "Error fetching profile", details: error.message });
    }
};