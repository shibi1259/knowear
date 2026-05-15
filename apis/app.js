const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
require("dotenv").config();
const cors = require("cors");
const constants = require("./config/constants");
const port = constants.common.PORT;
const routes = require("./config/routes");
const cronjob = require("node-cron");
const useragent = require('express-useragent');
const creds = require('./config/db_config/firebaseConfig')
const firebase = require('firebase-admin')

//Controllers
const mediaController = require('./app/controllers/web/backend/media.controller')
//Controllers

//Engines
const notificationEngine = require('./util/notificationEngine')
const offerEngine = require('./util/offerEngine')
const reports = require('./engines/report/report.engine')
const carts = require('./engines/cart/cart.engine')
//Engines

const mongoose = require('mongoose');

const dbUser = process.env.MONGODB_DATABASE_ADMIN_USER;
const dbPassword = process.env.MONGODB_DATABASE_ADMIN_PASSWORD;
const dbHost = process.env.MONGODB_HOST || 'localhost';  // Set a default host if not provided in environment variables
const dbPort = process.env.MONGODB_PORT || '27017';  // Set a default port if not provided in environment variables
const dbName = process.env.MONGODB_DATABASE || 'admin';  // Set a default database name if not provided in environment variables

let connectionString = `mongodb+srv://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;

if (process.env.ENV == 'DEV') {
  connectionString = `mongodb://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}?authSource=admin`;
}

mongoose.connect(connectionString, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  family: 4
}).then(() => {
  const conn = mongoose.connection;

  console.log("DB Connection Established",  conn.host , conn.name);
}).catch((err) => {
  console.error("DB Connection Failed :: " + err);
});

app.use(cors(["*"]));

firebase.initializeApp({
  credential: firebase.credential.cert(creds['firebaseConfig'])
});

app.all("/", (req, res) => {
  res.status(200).send("Hello from Knowear APIs powered by WebCastle Media")
});

app.use(useragent.express());
app.use(bodyParser.urlencoded({ extended: "true", limit: "50mb" }));
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

// Route-aware cache policy headers for Cloudflare/origin.
app.use((req, res, next) => {
  const pathName = req.path.toLowerCase();
  const method = req.method.toUpperCase();

  const noStorePrefixes = [
    "/api/v1/w/admin/auth",
    "/api/v1/w/login",
    "/api/v1/w/email-login",
    "/api/v1/w/register",
    "/api/v1/w/logout",
    "/api/v1/w/forgot-password",
    "/api/v1/w/reset-password",
    "/api/v1/w/validate-",
    "/api/v1/w/guest-login",
    "/api/v1/w/google-login",
    "/api/v1/w/facebook-login",
    "/api/v1/w/continue-as-guest",
    "/api/v1/w/update-profile",
    "/api/v1/w/cart",
    "/api/v1/w/order",
    "/api/v1/w/verify-payment",
    "/api/v1/w/payment",
    "/api/v1/w/customer",
    "/api/v1/w/dashboard",
    "/api/v1/w/upload",
  ];

  const publicCachePrefixes = [
    "/api/v1/w/product-listing",
    "/api/v1/w/product-filters",
    "/api/v1/w/product-details",
    "/api/v1/w/related-products",
    "/api/v1/w/popular-search",
    "/api/v1/w/categories",
    "/api/v1/w/featured-categories",
    "/api/v1/w/subcategories",
    "/api/v1/w/mega-categories",
    "/api/v1/w/category-landing",
    "/api/v1/w/get-all-categories",
    "/api/v1/w/category-by-slug",
    "/api/v1/w/blog",
    "/api/v1/w/content",
    "/api/v1/w/brand",
    "/api/v1/w/collection",
    "/api/v1/w/offer",
    "/api/v1/w/home-widget",
    "/api/v1/w/seo",
    "/api/v1/w/about",
    "/api/v1/w/settings",
    "/api/v1/w/mega-menu",
  ];

  const isNoStoreRoute = noStorePrefixes.some((prefix) => pathName.startsWith(prefix));
  const isPublicGetRoute =
    method === "GET" &&
    publicCachePrefixes.some((prefix) => pathName.startsWith(prefix));

  res.setHeader("Vary", "Accept-Encoding");

  if (method !== "GET" || isNoStoreRoute) {
    res.setHeader("Cache-Control", "private, no-store, no-cache, must-revalidate");
    return next();
  }

  if (isPublicGetRoute) {
    res.setHeader("Cache-Control", "public, max-age=120, s-maxage=600, stale-while-revalidate=300");
    return next();
  }

  // Safe default for other GET responses.
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=60, stale-while-revalidate=60");
  return next();
});

app.all("/api/", (req, res) => {
  res.status = 404;
  res.json({ success: false, message: "Unknown end point" });
});

// Cron job to send notifications to users at 12:00 AM
cronjob.schedule('0 0 * * *', () => {
  notificationEngine.fetchNotification()
})

// Cron job to fetch offers from the database at 12:00 AM
// cronjob.schedule('0 0 * * *', () => {
//   offerEngine.getOffers()
// })
cronjob.schedule('* * * * *', () => {
  offerEngine.getOffers()
})
// Cron job to fetch offers from the database at 12:00 AM
cronjob.schedule('59 59 23 * * *', async () => {
  await reports.engine()
}, { scheduled: true, timezone: 'Asia/Kolkata' })

// Cron job to fetch abadonned carts from the database at 12:00 AM
cronjob.schedule('59 59 23 * * *', async () => {
  await carts.engine()
}, { scheduled: true, timezone: 'Asia/Kolkata' })

app.use("/api/v1/w/", routes.webRouteV1());

app.listen(port, async() => {
  mongoose.set('strictPopulate', false);
  console.log("app listening at port :: " + port);
})

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));