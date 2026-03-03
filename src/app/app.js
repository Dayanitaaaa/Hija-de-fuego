import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import express from 'express';
import rolesRoutes from '../routes/roles.Routes.js';// Rutas
import usersRoutes from '../routes/users.Routes.js';
import typeProductRoutes from '../routes/typeProduct.Routes.js';
import productsRoutes from '../routes/product.Routes.js';
import storeProductsRoutes from '../routes/storeProducts.Routes.js';
import contactoRoutes from '../routes/contacto.Routes.js';
import mensajesContactoRoutes from '../routes/mensajesContacto.Routes.js';
import pedidosRoutes from '../routes/pedidos.Routes.js';
import addressesRoutes from '../routes/addresses.Routes.js';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from '../config/passport.js';
import { verifyToken } from '../middleware/authMiddleware.js';  
import jwt from 'jsonwebtoken';
import { connect } from '../config/db/connect.js';



// Configuración de rutas y archivos estáticos para dashboards

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.join(__dirname, '../public');
const assetsPath = path.join(publicPath, 'assets');
const uploadsPath = path.join(publicPath, 'uploads');

// Archivos estáticos (solo assets, no exponer views directamente)

app.use('/assets', express.static(assetsPath));
app.use('/uploads', express.static(uploadsPath));

app.use(cors());
app.use(cookieParser());

app.use(session({
    secret: process.env.JWT_SECRET || 'secret_hija_fuego',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/mySystem', rolesRoutes);
app.use('/mySystem', usersRoutes);
app.use('/mySystem', typeProductRoutes); 
app.use('/mySystem', productsRoutes);
app.use('/mySystem', storeProductsRoutes);
app.use('/mySystem', mensajesContactoRoutes);
app.use('/mySystem/pedidos', pedidosRoutes);
app.use('/mySystem/addresses', addressesRoutes);

app.use(contactoRoutes);

// --- Rutas de Autenticación Social (Google) ---
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/generalViews/login' }),
    async (req, res) => {
        try {
            // El usuario ya fue autenticado y guardado/encontrado en DB por Passport
            const user = req.user;

            // Obtener el rol del usuario para el token
            const [roleResult] = await connect.query(
                'SELECT R.Roles_id, R.Roles_name FROM roles R WHERE R.Roles_id = ?',
                [user.Roles_fk]
            );
            const role = roleResult.length > 0 ? roleResult[0] : { Roles_id: user.Roles_fk, Roles_name: 'Cliente' };

            // Generar el mismo tipo de JWT que usa el login tradicional
            const token = jwt.sign(
                { id: user.User_id, email: user.User_email, role: role.Roles_name },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            // Preparar objeto de respuesta para el frontend
            const userData = JSON.stringify({
                User_id: user.User_id,
                User_name: user.User_name,
                User_email: user.User_email
            });
            const roleData = JSON.stringify({
                id: role.Roles_id,
                name: role.Roles_name
            });

            // Enviar script para guardar en localStorage y redirigir
            res.send(`
                <script>
                    localStorage.setItem('token', '${token}');
                    localStorage.setItem('user', '${userData}');
                    localStorage.setItem('role', '${roleData}');
                    
                    const redirectUrl = localStorage.getItem('post_login_redirect');
                    if (redirectUrl) {
                        localStorage.removeItem('post_login_redirect');
                        window.location.href = redirectUrl;
                    } else {
                        window.location.href = '/generalViews/home';
                    }
                </script>
            `);
        } catch (error) {
            console.error('Error en callback social:', error);
            res.redirect('/generalViews/login?error=auth_failed');
        }
    }
);


// Redirección de la raíz a la página de inicio
app.get('/', (req, res) => {
    res.redirect('/generalViews/home');
});

// Rutas amigables para dashboards
app.get('/dashboard/homeDashboard', (req, res) => {
    res.sendFile(path.join(publicPath, 'views/dashboard/homeDashboard/home.html'));
});
app.get('/dashboard/users', (req, res) => {
    res.sendFile(path.join(publicPath, 'views/dashboard/users/users.html'));
});
app.get('/dashboard/roles', (req, res) => {
    res.sendFile(path.join(publicPath, 'views/dashboard/roles/roles.html'));
});
app.get('/dashboard/gestion-productos', (req, res) => {
    res.sendFile(path.join(publicPath, 'views/dashboard/gestionProductos/gestionProductos.html'));
});

app.get('/dashboard/mensajes-contacto', (req, res) => {
    res.sendFile(path.join(publicPath, 'views/dashboard/mensajesContacto/mensajesContacto.html'));
});

app.get('/dashboard/pedidos', (req, res) => {
    res.sendFile(path.join(publicPath, 'views/dashboard/pedidos/pedidos.html'));
});

app.get('/dashboard/editor-web', (req, res) => {
    res.redirect('/dashboard/gestion-productos');
});

// Redirección legacy de productos a gestión de productos
app.get('/dashboard/products', (req, res) => {
    res.redirect('/dashboard/gestion-productos');
});

// Rutas amigables para generalViews
app.get('/generalViews/home', (req, res) => {
    res.sendFile(path.join(publicPath, 'views/generalViews/home/home.html'));
});

// Redirección de rutas antiguas a rutas amigables (opcional)

app.get('/generalViews/headerHome', (req, res) => {
    res.sendFile(path.join(publicPath, 'views/generalViews/headerHome/headerHome.html'));
});
app.get('/generalViews/headerGlobal', (req, res) => {
    res.sendFile(path.join(publicPath, 'views/generalViews/headerGlobal/headerGlobal.html'));
});
app.get('/generalViews/login', (req, res) => {
    res.sendFile(path.join(publicPath, 'views/generalViews/login/login.html'));
});
app.get('/generalViews/register', (req, res) => {
    res.sendFile(path.join(publicPath, 'views/generalViews/register/register.html'));
});
app.get('/generalViews/blog', (req, res) => {
    res.sendFile(path.join(publicPath, 'views/generalViews/blog/blog.html'));
});
app.get('/generalViews/blog/card1', (req, res) => {
    res.sendFile(path.join(publicPath, 'views/generalViews/blog/blogCard1.html'));
});
app.get('/generalViews/blog/card2', (req, res) => {
    res.sendFile(path.join(publicPath, 'views/generalViews/blog/blogCard2.html'));
});
app.get('/generalViews/blog/card3', (req, res) => {
    res.sendFile(path.join(publicPath, 'views/generalViews/blog/blogCard3.html'));
});
app.get('/generalViews/blog/card4', (req, res) => {
    res.sendFile(path.join(publicPath, 'views/generalViews/blog/blogCard4.html'));
});
app.get('/generalViews/blog/card5', (req, res) => {
    res.sendFile(path.join(publicPath, 'views/generalViews/blog/blogCard5.html'));
});
app.get('/generalViews/blog/card6', (req, res) => {
    res.sendFile(path.join(publicPath, 'views/generalViews/blog/blogCard6.html'));
});
app.get('/generalViews/contact', (req, res) => {
    res.sendFile(path.join(publicPath, 'views/generalViews/contact/contact.html'));
});
app.get('/generalViews/perfil', (req, res) => {
    res.sendFile(path.join(publicPath, 'views/generalViews/perfil/perfil.html'));
});
app.get('/generalViews/gastronomic', (req, res) => {
    res.sendFile(path.join(publicPath, 'views/generalViews/gastronomic/gastronomic.html'));
});
app.get('/generalViews/culture', (req, res) => {
    res.sendFile(path.join(publicPath, 'views/generalViews/culture/culture.html'));
});
app.get('/generalViews/book', (req, res) => {
    res.sendFile(path.join(publicPath, 'views/generalViews/book/book.html'));
});
app.get('/generalViews/book/raices-y-fogones', (req, res) => {
    res.sendFile(path.join(publicPath, 'views/generalViews/book/raices-y-fogones.html'));
});
app.get('/generalViews/cart', (req, res) => {
    res.sendFile(path.join(publicPath, 'views/generalViews/cart/cart.html'));
});
app.get('/generalViews/recipes', (req, res) => {
    res.sendFile(path.join(publicPath, 'views/generalViews/blogProduct/blogProduct.html'));
});
app.get('/generalViews/comida-con-alma', (req, res) => {
    res.sendFile(path.join(publicPath, 'views/generalViews/comidaConAlma/comidaConAlma.html'));
});

app.get('/generalViews/forgot-password', (req, res) => {
    res.sendFile(path.join(publicPath, 'views/generalViews/login/forgot-password.html'));
});

app.get('/generalViews/reset-password/:token', (req, res) => {
    res.sendFile(path.join(publicPath, 'views/generalViews/login/reset-password.html'));
});

app.get('/generalViews/comida-con-alma/producto/:id', (req, res) => {
    res.sendFile(path.join(publicPath, 'views/generalViews/comidaConAlma/comidaConAlmaDetail.html'));
});
app.get('/generalViews/blogProduct', (req, res) => {
    res.sendFile(path.join(publicPath, 'views/generalViews/blogProduct/blogProduct.html'));
});

app.get('/generalViews/recipes/region/santander', (req, res) => {
    res.sendFile(path.join(publicPath, 'views/generalViews/blogProduct/region-santander.html'));
});
app.get('/generalViews/recipes/region/pacifica', (req, res) => {
    res.sendFile(path.join(publicPath, 'views/generalViews/blogProduct/region-pacifica.html'));
});
app.get('/generalViews/recipes/region/antioquia-viejo-caldas', (req, res) => {
    res.sendFile(path.join(publicPath, 'views/generalViews/blogProduct/region-antioquia-viejo-caldas.html'));
});
app.get('/generalViews/recipes/region/huila-valle', (req, res) => {
    res.sendFile(path.join(publicPath, 'views/generalViews/blogProduct/region-huila-valle.html'));
});
app.get('/generalViews/recipes/region/cundinamarca-boyaca', (req, res) => {
    res.sendFile(path.join(publicPath, 'views/generalViews/blogProduct/region-cundinamarca-boyaca.html'));
});
app.get('/generalViews/recipes/region/recetas-familiares', (req, res) => {
    res.sendFile(path.join(publicPath, 'views/generalViews/blogProduct/region-recetas-familiares.html'));
});

// Redirección de rutas antiguas a rutas amigables (opcional)


// Nota: Ya no exponemos /views estáticamente, por lo que estas rutas no deberían ser accesibles directamente.
app.get('/views/dashboard/:section/:file', (req, res) => {
    const section = req.params.section;
    const map = {
        users: '/dashboard/users',
        roles: '/dashboard/roles',
        products: '/dashboard/gestion-productos'
    };
    if (map[section]) return res.redirect(map[section]);
    res.status(404).send('Not found');
});


app.get('/views/generalViews/:section/:file', (req, res) => {
    const section = req.params.section;
    const map = {
        home: '/generalViews/home',
        headerHome: '/generalViews/headerHome',
        headerGlobal: '/generalViews/headerGlobal',
        login: '/generalViews/login',
        register: '/generalViews/register',
        blog: '/generalViews/blog',
        contact: '/generalViews/contact',
        perfil: '/generalViews/perfil',
        gastronomic: '/generalViews/gastronomic',
        culture: '/generalViews/culture',
        book: '/generalViews/book',
        blogProduct: '/generalViews/blogProduct'
    };   
    if (map[section]) return res.redirect(map[section]);
    res.status(404).send('Not found');
}); 


app.use((req, res, next) => {
res.status(404).json({ message: 'Endpoint not found' });
});

export default app;


