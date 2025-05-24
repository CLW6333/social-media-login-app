# Social Media Login Web App

This is a Node.js-based web application that allows users to authenticate via **Google**, **Facebook**, or **Okta** using **OAuth2/OpenID Connect**. It provides a clean interface showing login status, and includes secure session management using Passport.js.

---

## 📦 Project Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- NPM (comes with Node)
- Git (optional, if cloning a repo)
- A `.env` file with OAuth credentials (see below)
---

### 🔧 Installation Steps

1. **Clone or Download the Repository**

```bash
git clone <repository-url>
cd SocialMediaLoginApp


## Features

- Google, Facebook, and Okta OAuth2 login
- Session-based login state
- Simple HTML interface
- Logout support
- Error Handling

## Setup

1. Clone the repository:
   ```
   git clone <your-repo-url>
   cd SocialMediaLoginApp
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file using the below and fill in your client secrets.

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret

OKTA_CLIENT_ID=your-okta-client-id
OKTA_CLIENT_SECRET=your-okta-client-secret
OKTA_ISSUER=https://your-okta-domain/oauth2/default

SESSION_SECRET=your-session-secret

4. Run the app:
   ```
   node index.js
   ```

5. Open your browser at `http://localhost:5000`.

## Notes
OAuth Provider Configuration

Google
1. Go to https://console.cloud.google.com/
2. Create a project and enable OAuth 2.0
3. Set Authorized Redirect URI to: `http://localhost:5000/auth/google/callback`
4. Copy Client ID and Client Secret into your .env file

Facebook
1. Go to https://developers.facebook.com/
2. Login and create a app
3. Choose Consumer Type
4. Go to Facebook Login> Settings, set the Valid OAuth Redirect URI to: `http://localhost:5000/auth/facebook/callback`
5. Copy App ID and App secret to your .env file

Okta
1. Go to https://developer.okta.com/
2. Create new app with type Web
3. Set sign-in redirect URI to: http://localhost:5000/auth/okta/callback
4. Copy client ID, Client Secret, and the Issuer into your .env file.

Troubleshooting

Issue: SESSION_SECRET from .env: Undefined
Solution
-Ensure .env is in the same file directory as smlogin.js
-Ensure .env is named exactly and not something like .env.txt
-make sure the first line of smlogin.js includes: require('dotenv').config();

Issue: Social Login not redirecting
Solution
-Confirm the callback URL in your .env matches what you configured in the provider console.
-Check for typos in .env keys (e.g., GOOGLE_CLIENT_ID, not GOOGLE_ID)
-Check browser console for OAuth errors

Issue 404 or failed fetch to /auth/google or /auth/facebook
Solution
-Make sure the server is running (node smlogin.js)
-Confirm those routes are registered in the terminal logs
-Use browser's Network tab to inspect failed requests

Authentication Flow
[ User ]
   │
   ▼
[ Clicks Login Button ]
   │
   ▼
[ Redirect to OAuth Provider ]
   │
   ▼
[ User Authenticates with Google / Facebook / Okta ]
   │
   ▼
[ Provider Redirects Back with Authorization Code ]
   │
   ▼
[ Server Exchanges Code for Access Token ]
   │
   ▼
[ Server Retrieves User Profile ]
   │
   ▼
[ User Info Stored (or Retrieved) in SQLite Database ]
   │
   ▼
[ Session Created ]
   │
   ▼
[ User is Logged In and Redirected to Home ]
