import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const enviarEmailRespuesta = async (to, subject, text) => {
    try {
        const info = await transporter.sendMail({
            from: `"Hija del Fuego" <${process.env.SMTP_USER}>`,
            to,
            subject,
            text,
            html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #96353B; border-radius: 10px;">
                    <h2 style="color: #96353B;">Hija del Fuego - Respuesta a tu mensaje</h2>
                    <p>${text.replace(/\n/g, '<br>')}</p>
                    <hr>
                    <p style="font-size: 0.8em; color: #666;">Este es un mensaje automático, por favor no respondas directamente a este correo.</p>
                   </div>`
        });
        return info;
    } catch (error) {
        console.error('Error enviando email:', error);
        throw error;
    }
};
