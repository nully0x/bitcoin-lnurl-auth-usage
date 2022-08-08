"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const LnurlAuth = require("passport-lnurl-auth");
const passport = require("passport");
const session = require("express-session");
const config_1 = require("./config/config");
const app = express();
if (!config_1.config.url) {
    config_1.config.url = "http://" + config_1.config.host + ":" + config_1.config.port;
}
app.use(session({
    secret: "12345",
    resave: false,
    saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());
const map = {
    user: new Map(),
};
passport.serializeUser(function (user, done) {
    done(null, user.id);
});
passport.deserializeUser(function (id, done) {
    done(null, map.user.get(id) || null);
});
passport.use(new LnurlAuth.Strategy(function (linkingPublicKey, done) {
    let user = map.user.get(linkingPublicKey);
    if (!user) {
        user = { id: linkingPublicKey };
        map.user.set(linkingPublicKey, user);
    }
    done(null, user);
}));
app.use(passport.authenticate("lnurl-auth"));
app.get("/", function (req, res) {
    const user = req.user;
    if (!req.user) {
        return res.json({ error: "not logged in" });
    }
    console.log(req.user);
    res.send(`Welcome to lightning authentication anonymous user: ${user.id}`);
});
app.get("/login", function (req, res, next) {
    if (req.user) {
        // Already authenticated.
        return res.json({ mess: "already logged in" });
    }
    next();
}, new LnurlAuth.Middleware({
    callbackUrl: `${config_1.config.endpoint}/login`,
    cancelUrl: `${config_1.config.endpoint}/`,
}));
app.get("/logout", function (req, res, next) {
    if (req.user) {
        // Already authenticated.
        req.session.destroy(function (err) {
            if (err) {
                return next(err);
            }
            res.redirect(`${config_1.config.endpoint}/`);
        });
        return res.send({ message: "logged out" });
    }
    next();
});
const server = app.listen(config_1.config.port, function () {
    console.log("Server listening at " + config_1.config.url);
});
process.on("uncaughtException", (error) => {
    console.error(error);
});
process.on("beforeExit", (code) => {
    try {
        server.close();
    }
    catch (error) {
        console.error(error);
    }
    process.exit(code);
});
