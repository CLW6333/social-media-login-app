/*
Social Media Login Web App
--------------------------
This version creates a web interface that shows:
- "You are not logged in" if user is not authenticated
- "You are now logged in with [Google/Facebook/Okta]" when logged in
- Buttons to login via Google, Facebook, or Okta

Setup Instructions:
-------------------
1. Clone the repository:
   git clone <repository-url>

2. Navigate to the project folder:
   cd Social_Media_Login_Service

3. Install dependencies:
   npm install

4. Create a .env file in the root directory with:
   GOOGLE_CLIENT_ID=<your-google-client-id>
   GOOGLE_CLIENT_SECRET=<your-google-client-secret>
   FACEBOOK_CLIENT_ID=<your-facebook-client-id>
   FACEBOOK_CLIENT_SECRET=<your-facebook-client-secret>
   OKTA_CLIENT_ID=<your-okta-client-id>
   OKTA_CLIENT_SECRET=<your-okta-client-secret>
   OKTA_ISSUER=<your-okta-issuer-url>
   SESSION_SECRET=<your-session-secret>

5. Run the application:
   npm start

6. Visit http://localhost:5000
*/
require('dotenv').config();

const { sequelize, User } = require('./models/users');
console.log("🗂️  Sequelize is using database:", require('path').resolve('./database.sqlite'));
const helmet = require('helmet');

// 1. Dependencies
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const OpenIDConnectStrategy = require('passport-openidconnect').Strategy;
const path = require('path');

const app = express();
console.log('SESSION_SECRET from .env:', process.env.SESSION_SECRET);

// 2. Middleware Setup
app.use(helmet());
app.use(express.static('public'));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// 3. Passport Serialization
passport.serializeUser((user, done) => {
  done(null, { id: user.id, provider: user.provider, displayName: user.displayName });
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// 4. Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, async (token, tokenSecret, profile, done) => {
  try {
    const [user] = await User.findOrCreate({
      where: { providerId: profile.id, provider: 'google' },
      defaults: { displayName: profile.displayName, email: profile.emails?.[0]?.value || null }
    });
    done(null, user);
  } catch (err) {
    console.error(`[Google Auth Error]:`, err);
    done(err);
  }
}));

// 5. Facebook OAuth Strategy
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: '/auth/facebook/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const [user] = await User.findOrCreate({
      where: { providerId: profile.id, provider: 'facebook' },
      defaults: { displayName: profile.displayName, email: profile.emails?.[0]?.value || null }
    });
    done(null, user);
  } catch (err) {
    console.error(`[Facebook Auth Error]:`, err);
    done(err);
  }
}));

// 6. Okta OAuth Strategy
passport.use('okta', new OpenIDConnectStrategy({
  issuer: process.env.OKTA_ISSUER,
  clientID: process.env.OKTA_CLIENT_ID,
  clientSecret: process.env.OKTA_CLIENT_SECRET,
  authorizationURL: `${process.env.OKTA_ISSUER}/v1/authorize`,
  tokenURL: `${process.env.OKTA_ISSUER}/v1/token`,
  userInfoURL: `${process.env.OKTA_ISSUER}/v1/userinfo`,
  callbackURL: '/auth/okta/callback',
  scope: 'openid profile email'
}, async (issuer, profile, done) => {
  try {
    const [user] = await User.findOrCreate({
      where: { providerId: profile.id, provider: 'okta' },
      defaults: { displayName: profile.displayName, email: profile.emails?.[0]?.value || null }
    });
    done(null, user);
  } catch (err) {
    console.error(`[Okta Auth Error]:`, err);
    done(err);
  }
}));

// 7. Routes
app.get('/', (req, res) => {
  const isLoggedIn = req.isAuthenticated();
  const name = req.user?.displayName || '';
  const provider = req.user?.provider || '';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Login Page</title>
  <style>
    body { font-family: sans-serif; text-align: center; margin-top: 50px; }
    button, input { margin: 10px; padding: 10px 20px; font-size: 16px; }
  </style>
</head>
<body>
  <h1>${isLoggedIn ? `You are now logged in with ${provider}` : 'You are not logged in'}</h1>

  ${!isLoggedIn ? `
    <a href="/auth/google"><button>Login with Google</button></a>
    <a href="/auth/facebook"><button>Login with Facebook</button></a>
    <a href="/auth/okta"><button>Login with Okta</button></a>
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
  failureRedirect: '/auth-failure'
}));

app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
app.get('/auth/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/',
  failureRedirect: '/auth-failure'
}));

app.get('/auth/okta', passport.authenticate('okta'));
app.get('/auth/okta/callback', passport.authenticate('okta', {
  successRedirect: '/',
  failureRedirect: '/auth-failure'
}));

app.get('/auth-failure', (req, res) => {
  res.send(`
    <h2>Authentication Failed</h2>
    <p>We were unable to log you in. Please try again or contact support.</p>
    <a href="/">Back to Home</a>
  `);
});

app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

// 8. Server Setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app._router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(`🛣️  Route registered: ${r.route.path}`);
  }
});
