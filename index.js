const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const app = express();

app.use(express.static('public'));
app.use(session({
    secret: 'supersecretkey',
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, { id: user.id, provider: user.provider, displayName: user.displayName });
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
}, (token, tokenSecret, profile, done) => {
    return done(null, profile);
}));

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: '/auth/facebook/callback'
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

app.get('/', (req, res) => {
    const isLoggedIn = req.isAuthenticated();
    const name = req.user?.displayName || '';
    const provider = req.user?.provider || '';

    const html = `
    <html>
    <head>
        <title>Login Page</title>
        <style>
            body { font-family: sans-serif; text-align: center; margin-top: 50px; }
            button { margin: 10px; padding: 10px 20px; font-size: 16px; }
        </style>
    </head>
    <body>
        <h1>${isLoggedIn ? `You are now logged in with ${provider}` : 'You are not logged in'}</h1>
        ${!isLoggedIn ? `
            <a href="/auth/google"><button>Login with Google</button></a>
            <a href="/auth/facebook"><button>Login with Facebook</button></a>
        ` : `
            <p>Welcome, ${name}!</p>
            <a href="/logout"><button>Logout</button></a>
        `}
    </body>
    </html>
    `;
    res.send(html);
});

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/'
}));

app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/',
    failureRedirect: '/'
}));

app.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
