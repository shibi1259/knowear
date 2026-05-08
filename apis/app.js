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
  connectionString = `mongodb://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;
}

mongoose.connect(connectionString, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  family: 4
}).then(() => {
  console.log("DB Connection Established");
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