import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import express from 'express';
import rolesRoutes from '../routes/roles.Routes.js';
import usersRoutes from '../routes/users.Routes.js';
import typeFiles from '../routes/typeFiles.Routes.js';
import filesRoutes from '../routes/files.Routes.js'
import typeProductRoutes from '../routes/typeProduct.routes.js';
import productsRoutes from '../routes/product.Routes.js';
import cookieParser from 'cookie-parser';
import { verifyToken } from '../middleware/authMiddleware.js';  



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

app.use(express.json());

app.use('/mySystem', rolesRoutes);
app.use('/mySystem', usersRoutes);
app.use('/mySystem', typeFiles);
app.use('/mySystem', filesRoutes);
app.use('/mySystem', typeProductRoutes); 
app.use('/mySystem', productsRoutes);


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
app.get('/dashboard/typeFiles', (req, res) => {
    res.sendFile(path.join(publicPath, 'views/dashboard/typeFiles/typeFiles.html'));
});
app.get('/dashboard/files', (req, res) => {
    res.sendFile(path.join(publicPath, 'views/dashboard/files/files.html'));
});
app.get('/dashboard/typeProducts', (req, res) => {
    res.sendFile(path.join(publicPath, 'views/dashboard/typeProducts/typeProducts.html'));
});
app.get('/dashboard/products', (req, res) => {
    res.sendFile(path.join(publicPath, 'views/dashboard/products/products.html'));
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
app.get('/generalViews/blogProduct', (req, res) => {
    res.sendFile(path.join(publicPath, 'views/generalViews/blogProduct/blogProduct.html'));
});
app.get('/generalViews/blog/ajiaco', (req, res) => {
    res.sendFile(path.join(publicPath, 'views/generalViews/blogProduct/ajiaco.html'));
});
app.get('/generalViews/blog/bandejaPaisa', (req, res) => {
    res.sendFile(path.join(publicPath, 'views/generalViews/blogProduct/bandeja-paisa.html'));
});
app.get('/generalViews/blog/arepa', (req, res) => {
    res.sendFile(path.join(publicPath, 'views/generalViews/blogProduct/arepa-de-huevo.html'));
});
app.get('/generalViews/blog/sancocho', (req, res) => {
    res.sendFile(path.join(publicPath, 'views/generalViews/blogProduct/sancocho.html'));
});
app.get('/generalViews/blog/arequipe', (req, res) => {
    res.sendFile(path.join(publicPath, 'views/generalViews/blogProduct/arequipe.html'));
});
app.get('/generalViews/blog/lomo', (req, res) => {
    res.sendFile(path.join(publicPath, 'views/generalViews/blogProduct/lomo-al-trapo.html'));
});

// Redirección de rutas antiguas a rutas amigables (opcional)


// Nota: Ya no exponemos /views estáticamente, por lo que estas rutas no deberían ser accesibles directamente.
app.get('/views/dashboard/:section/:file', (req, res) => {
    const section = req.params.section;
    const map = {
        users: '/dashboard/users',
        roles: '/dashboard/roles',
        typeFiles: '/dashboard/typeFiles',
        files: '/dashboard/files',
        typeProducts: '/dashboard/typeProducts',
        products: '/dashboard/products'
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


