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

export const sendResetPasswordEmail = async (to, customerName, resetUrl) => {
    try {
        console.log(`[MAILER] Intentando enviar correo de restablecimiento a: ${to}`);
        const subject = 'Restablecer tu contraseña - Hija del Fuego';
        const message = `Hola ${customerName},\n\nHas solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva contraseña. Este enlace expirará en 1 hora.\n\n${resetUrl}\n\nSi no solicitaste este cambio, puedes ignorar este correo.\n\nHija del Fuego`;

        const info = await transporter.sendMail({
            from: `"Hija del Fuego" <${process.env.SMTP_USER}>`,
            to,
            subject,
            text: message,
            html: `<div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #96353B; border-radius: 10px; overflow: hidden;">
                    <div style="background-color: #96353B; color: white; padding: 20px; text-align: center;">
                        <h2 style="margin: 0;">Restablecer Contraseña</h2>
                    </div>
                    <div style="padding: 20px;">
                        <p>Hola <strong>${customerName}</strong>,</p>
                        <p>Has solicitado restablecer tu contraseña en <strong>Hija del Fuego</strong>. Haz clic en el botón de abajo para continuar:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetUrl}" 
                               style="background-color: #96353B; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                               Restablecer mi contraseña
                            </a>
                        </div>
                        <p style="font-size: 0.9em; color: #666;">Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:</p>
                        <p style="font-size: 0.8em; color: #96353B; word-break: break-all;">${resetUrl}</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="font-size: 0.8em; color: #999;">Este enlace expirará en 1 hora. Si no solicitaste este cambio, no es necesario realizar ninguna acción.</p>
                    </div>
                    <div style="background-color: #f8f9fa; color: #666; padding: 15px; text-align: center; font-size: 0.8em;">
                        © ${new Date().getFullYear()} Hija del Fuego. Todos los derechos reservados.
                    </div>
                </div>`
        });
        console.log(`[MAILER] Correo enviado exitosamente: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('[MAILER] ERROR enviando email de restablecimiento:', error);
        throw error;
    }
};

export const sendOrderStatusEmail = async (to, customerName, status) => {
    try {
        console.log(`Intentando enviar correo de estado [${status}] a: ${to}`);
        let subject, message;

        switch (status) {
            case 'PREPARANDO':
                subject = 'Tu pedido está siendo preparado';
                message = `Hola ${customerName},\n\nHemos recibido tu pedido y ya lo estamos preparando con mucho cuidado. Te mantendremos informado sobre cada paso.\n\nGracias por tu confianza en Hija del Fuego.`;
                break;
            case 'ENVIADO':
                subject = 'Tu pedido ha sido enviado';
                message = `Hola ${customerName},\n\n¡Buenas noticias! Tu pedido ya está en camino. Recíbelo pronto en la dirección que nos proporcionaste.\n\nAgradecemos tu compra en Hija del Fuego.`;
                break;
            case 'ENTREGADO':
                subject = 'Tu pedido fue entregado';
                message = `Hola ${customerName},\n\nTu pedido ha sido entregado. ¡Esperamos que disfrutes mucho de tus productos!\n\nGracias por comprar en Hija del Fuego. ¡Vuelve pronto!`;
                break;
            case 'CANCELADO':
                subject = 'Tu pedido ha sido cancelado';
                message = `Hola ${customerName},\n\nLamentamos informarte que tu pedido ha sido cancelado. Si tienes dudas, por favor contáctanos directamente.\n\nHija del Fuego`;
                break;
            default:
                console.log(`Estado [${status}] no configurado para envío de email.`);
                return;
        }

        const info = await transporter.sendMail({
            from: `"Hija del Fuego" <${process.env.SMTP_USER}>`,
            to,
            subject,
            text: message,
            html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #96353B; border-radius: 10px;">
                    <h2 style="color: #96353B;">${subject}</h2>
                    <p>${message.replace(/\n/g, '<br>')}</p>
                    <hr>
                    <p style="font-size: 0.8em; color: #666;">Este es un mensaje automático de Hija del Fuego.</p>
                   </div>`
        });
        console.log('Correo enviado con éxito:', info.messageId);
        return info;
    } catch (error) {
        console.error('ERROR CRÍTICO AL ENVIAR EMAIL:', {
            code: error.code,
            command: error.command,
            response: error.response,
            message: error.message
        });
        throw error;
    }
};

export const sendVerificationEmail = async (to, customerName, otp) => {
    try {
        console.log(`[MAILER] Enviando código de verificación a: ${to}`);
        const subject = 'Verifica tu cuenta - Hija del Fuego';
        
        const info = await transporter.sendMail({
            from: `"Hija del Fuego" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html: `<div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #96353B; border-radius: 10px; overflow: hidden;">
                    <div style="background-color: #96353B; color: white; padding: 20px; text-align: center;">
                        <h2 style="margin: 0;">Verifica tu Cuenta</h2>
                    </div>
                    <div style="padding: 20px; text-align: center;">
                        <p>Hola <strong>${customerName}</strong>,</p>
                        <p>Gracias por registrarte en <strong>Hija del Fuego</strong>. Para completar tu registro, utiliza el siguiente código de verificación:</p>
                        <div style="margin: 30px 0;">
                            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #96353B; border: 2px dashed #96353B; padding: 10px 20px; border-radius: 5px;">
                                ${otp}
                            </span>
                        </div>
                        <p style="font-size: 0.9em; color: #666;">Este código expirará en 15 minutos.</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="font-size: 0.8em; color: #999;">Si no creaste una cuenta, puedes ignorar este correo.</p>
                    </div>
                    <div style="background-color: #f8f9fa; color: #666; padding: 15px; text-align: center; font-size: 0.8em;">
                        © ${new Date().getFullYear()} Hija del Fuego. Todos los derechos reservados.
                    </div>
                </div>`
        });
        return info;
    } catch (error) {
        console.error('[MAILER] ERROR enviando email de verificación:', error);
        throw error;
    }
};

export const sendNewOrderAdminNotification = async (orderData) => {
    try {
        const { pedidoId, customer, total, items } = orderData;
        const subject = `🔥 ¡Nuevo Pedido Recibido! #${pedidoId}`;
        
        const itemsHtml = items.map(item => `
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.qty}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${(item.qty * item.price).toLocaleString()}</td>
            </tr>
        `).join('');

        const info = await transporter.sendMail({
            from: `"Hija del Fuego System" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER,
            subject,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #96353B; border-radius: 10px; overflow: hidden;">
                    <div style="background-color: #96353B; color: white; padding: 20px; text-align: center;">
                        <h2 style="margin: 0;">¡Nuevo Pedido en la Tienda!</h2>
                        <p style="margin: 5px 0 0 0;">Pedido #${pedidoId}</p>
                    </div>
                    <div style="padding: 20px;">
                        <h3 style="color: #96353B; border-bottom: 1px solid #eee; padding-bottom: 10px;">Datos del Cliente</h3>
                        <p><strong>Nombre:</strong> ${customer.fullName}</p>
                        <p><strong>Email:</strong> ${customer.email}</p>
                        <p><strong>Teléfono:</strong> ${customer.phone}</p>
                        
                        <h3 style="color: #96353B; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 20px;">Productos</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background-color: #f8f9fa;">
                                    <th style="padding: 8px; text-align: left;">Producto</th>
                                    <th style="padding: 8px; text-align: center;">Cant.</th>
                                    <th style="padding: 8px; text-align: right;">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                        </table>
                        
                        <div style="margin-top: 20px; text-align: right;">
                            <h2 style="color: #96353B;">Total: $${total.toLocaleString()}</h2>
                        </div>
                    </div>
                </div>
            `
        });
        return info;
    } catch (error) {
        console.error('Error enviando notificación de pedido al admin:', error);
    }
};
