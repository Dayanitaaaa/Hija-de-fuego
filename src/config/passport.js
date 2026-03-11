import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { connect } from './db/connect.js';
import dotenv from 'dotenv';

dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'dummy',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy',
    callbackURL: "/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      const name = profile.displayName;

      // 1. Buscar si el usuario ya existe por email
      const [rows] = await connect.query('SELECT * FROM users WHERE User_email = ?', [email]);
      
      if (rows.length > 0) {
        return done(null, rows[0]);
      }

      // 2. Si no existe, crearlo (Rol 2 = Cliente por defecto)
      // Nota: Para login social, la contraseña puede ser un hash aleatorio o nulo si la DB lo permite
      const randomPass = Math.random().toString(36).slice(-10); 
      const [result] = await connect.query(
        'INSERT INTO users (User_name, User_email, User_password, Roles_fk) VALUES (?, ?, ?, ?)',
        [name, email, 'SOCIAL_AUTH_PROVIDER', 2]
      );

      const newUser = {
        User_id: result.insertId,
        User_name: name,
        User_email: email,
        Roles_fk: 2
      };

      return done(null, newUser);
    } catch (error) {
      return done(error, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

export default passport;
