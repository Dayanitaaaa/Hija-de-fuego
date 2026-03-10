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
        // Si la solicitud espera JSON (como desde el carrito o API), devolver JSON
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(401).json({ error: "Acceso denegado. No se proporcionó token de autenticación." });
        }
        // Si es una navegación directa en el navegador
        return res.status(401).send('Acceso denegado. No se proporcionó token.');
    }

    try {
        // Verificar el token con la clave secreta
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Guardar los datos del token en req.user
        next(); // Continuar con la ruta protegida
    } catch (err) {
        console.error("JWT verification failed:", err.message);
        // Si la solicitud espera JSON
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(401).json({ error: "Token inválido o expirado. Por favor, inicia sesión nuevamente." });
        }
        return res.status(401).send('Token inválido o expirado.');
    }
};