import express, { Express, Request, Response } from "express";
const LnurlAuth = require("passport-lnurl-auth");
const passport = require("passport");
const session = require("express-session");
import { config } from "./config/config";

const app: Express = express();

if (!config.url) {
  config.url = "http://" + config.host + ":" + config.port;
}

app.use(
  session({
    secret: "12345",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

const map = {
  user: new Map(),
};

passport.serializeUser(function (user: any, done: any) {
  done(null, user.id);
});

passport.deserializeUser(function (id: string, done: any) {
  done(null, map.user.get(id) || null);
});

passport.use(
  new LnurlAuth.Strategy(function (linkingPublicKey: any, done: any) {
    let user = map.user.get(linkingPublicKey);
    if (!user) {
      user = { id: linkingPublicKey };
      map.user.set(linkingPublicKey, user);
    }
    done(null, user);
  })
);

app.use(passport.authenticate("lnurl-auth"));

app.get("/", function (req: Request, res: Response) {
  const user: any = req.user;
  if (!req.user) {
    return res.json({ error: "not logged in" });
  }
  console.log(req.user);
  res.send(`Welcome to lightning authentication anonymous user: ${user.id}`);
});

app.get(
  "/login",
  function (req: Request, res: Response, next: any) {
    if (req.user) {
      // Already authenticated.
      return res.json({ error: "already logged in" });
    }
    next();
  },
  new LnurlAuth.Middleware({
    callbackUrl: "https://83b4-197-210-76-53.eu.ngrok.io/login",
    cancelUrl: "https://83b4-197-210-76-53.eu.ngrok.io/",
  })
);

app.get("/logout", function (req: Request, res: Response, next: any) {
  if (req.user) {
    // Already authenticated.
    req.session.destroy();
    return res.send({ mess: "logged out" });
  }
  next();
});

const server = app.listen(config.port, function () {
  console.log("Server listening at " + config.url);
});

process.on("uncaughtException", (error) => {
  console.error(error);
});

process.on("beforeExit", (code) => {
  try {
    server.close();
  } catch (error) {
    console.error(error);
  }
  process.exit(code);
});
