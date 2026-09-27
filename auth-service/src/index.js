const { auth } = require("express-openid-connect");
const express = require("express");
const cors = require("cors");
const session = require("express-session");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:4200";

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  }),
);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

const config = {
  authRequired: false,
  auth0Logout: true,
  baseURL: `http://localhost:${PORT}`,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  secret: process.env.SESSION_SECRET,
  authorizationParams: {
    response_type: "code",
    scope: "openid profile email",
  },
  routes: {
    login: false,
    logout: false,
    callback: "/auth/callback",
  },
};

app.use(auth(config));

app.get("/auth/login", (req, res) => {
  res.oidc.login({ returnTo: CLIENT_ORIGIN + "/dashboard" });
});

app.get("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.oidc.logout({ returnTo: CLIENT_ORIGIN + "/login" });
  });
});

app.get("/auth/me", (req, res) => {
  if (req.oidc.isAuthenticated()) {
    const user = req.oidc.user;
    res.json({
      isAuthenticated: true,
      user: {
        sub: user.sub,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
      accessToken: req.oidc.accessToken?.access_token || null,
      idToken: req.oidc.idToken || null,
    });
  } else {
    res.json({ isAuthenticated: false, user: null });
  }
});

app.get("/auth/tokens", (req, res) => {
  if (req.oidc.isAuthenticated() && req.oidc.accessToken) {
    res.json({
      accessToken: req.oidc.accessToken.access_token,
      idToken: req.oidc.idToken,
    });
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

app.listen(PORT, () => {
  console.log(`Auth service running on http://localhost:${PORT}`);
});
