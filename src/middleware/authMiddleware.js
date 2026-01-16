import jwt from 'jsonwebtoken';
import dotenv from "dotenv";

dotenv.config();

export const verifyToken = (req, res, next) => {
    const authHeader = req.header("Authorization");
    let token = null;

    // 1) Token por Authorization: Bearer <token>
    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.replace("Bearer ", "");
    }

    // 2) Si no hay header, intentar desde cookie "token"
    if (!token && req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        // Si es una vista HTML (dashboard), mostrar error 401
        if (req.accepts && req.accepts(['html', 'json']) === 'html') {
            return res.status(401).send('Acceso denegado. No se proporcionó token.');
        }
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        // Verificar el token con la clave secreta
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Guardar los datos del token en req.user
        next(); // Continuar con la ruta protegida
    } catch (err) {
        console.error("JWT verification failed:", err.message);
        if (req.accepts && req.accepts(['html', 'json']) === 'html') {
            return res.status(401).send('Token inválido o expirado.');
        }
        return res.status(400).json({ error: "Invalid or expired token." });
    }
};