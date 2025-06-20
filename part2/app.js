const express = require('express');
const path = require('path');
require('dotenv').config();
const session = require('express-session');

const app = express();

// Middleware
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        sameSite: "lax"
    }
}));

app.use((req, res, next) => {
    req.user = req.session.user;
    next();
});

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

app.get('/owner-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/owner-dashboard.html'));
});

app.get('/walker-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/walker-dashboard.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.post('/api/users/login', (req, res) => {
    res.redirect(307, '/api/users/login');
});

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }

        res.clearCookie('connect.sid', {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        });

        res.redirect('/index.html');
    });
});

app.use(express.static(path.join(__dirname, '/public')));

// Export the app instead of listening here
module.exports = app;