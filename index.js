/* global __dirname */
/* global process */

require("dotenv").config({ path: "./config/.env" });
require("./config/db");
const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const userRoute = require("./routes/user.routes");

const AudioRoute = require("./routes/audio.routes");
const VideoRoute = require("./routes/video.routes");
const calendarRoute = require("./routes/calendar.routes");
const ExerciceRoute = require("./routes/exercices.routes");
const rate_limiter = require("./utils/rate.limiter");
const path = require("path");

// const firewall = require("node-firewall");
const { default: helmet } = require("helmet");
// Définir le fuseau horaire souhaité
// const timezone = "Africa/Porto-Novo"; // Fuseau horaire du Bénin

// Environnement variable
const port = process.env.PORT;
const origineClient = process.env.CLIENT_URL;

// app.use(cookieParser()); //Lire les cookies
app.use(cookieParser());
app.use(helmet());
app.use(rate_limiter(100, 60000)); //Limiter les réquêtes abusées
app.use(cors({ credentials: true, origin: origineClient })); //L'origine des requêtes
app.use(bodyParser.json()); //Transformer nos corps en json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "./client/build")));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build", "index.html"));
});

app.get("/register", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build", "index.html"));
});
app.get("/login", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build", "index.html"));
});
app.get("/home", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build", "index.html"));
});

app.get("/politique", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build", "index.html"));
});
app.get("/condition", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build", "index.html"));
});
app.get("/partition", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build", "index.html"));
});
app.get("/partition/:id", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build", "index.html"));
});

//localhost:7200/partition/partition/christ-est-reussucite.jpeg
// app.get("/image/:id", function (req, res) {
//   res.sendFile(path.join(__dirname, "./client/build", "index.html"));
// });

app.get("/carte", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build", "index.html"));
});
app.get("/profil", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build", "index.html"));
});
app.get("/forget", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build", "index.html"));
});
app.get("/reset/:token", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build", "index.html"));
});
app.get("/notification", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build", "index.html"));
});
app.get("/audio", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build", "index.html"));
});
app.get("/video", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build", "index.html"));
});
app.get("/gallery", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build", "index.html"));
});
app.get("/education", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build", "index.html"));
});
app.get("/validation", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build", "index.html"));
});
app.get("/transaction", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build", "index.html"));
});
app.get("/admin", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build", "index.html"));
});
app.get("/admin/home-users", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build", "index.html"));
});
app.get("/admin/home-participants", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build", "index.html"));
});
app.get("/admin/home-validate", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build", "index.html"));
});
app.get("/admin/home-liste", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build", "index.html"));
});
app.get("/admin/home-note", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build", "index.html"));
});
app.get("/admin/home-morceau", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build", "index.html"));
});
app.get("/souscription", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build", "index.html"));
});
app.get("/exercices", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build", "index.html"));
});
// Définir le chemin du dossier "public"

app.use(express.static(path.join(__dirname, "./image")));
app.use(express.static(path.join(__dirname, "./partition")));
app.use(express.static(path.join(__dirname, "./audio")));
app.use(express.static(path.join(__dirname, "./video")));
app.use(express.static(path.join(__dirname, "./exercices")));

//localhost:3000/image/user.png
// Route pour servir une image
app.get("/image/:filename", (req, res) => {
  const filename = req.params.filename;
  // Récupérer le chemin complet de l'image
  const imagePath = path.join(__dirname, "./image", filename);
  // Renvoyer l'image au client
  res.sendFile(imagePath);
});

app.get("/partition/:filename", (req, res) => {
  const filename = req.params.filename;
  // Récupérer le chemin complet de l'image
  const imagePath = path.join(__dirname, "./partition", filename);
  // Renvoyer l'image au client
  res.sendFile(imagePath);
});
app.get("/audio/:filename", (req, res) => {
  const filename = req.params.filename;
  // Récupérer le chemin complet de l'image
  const imagePath = path.join(__dirname, "./audio", filename);
  // Renvoyer l'image au client
  res.sendFile(imagePath);
});
app.get("/video/:filename", (req, res) => {
  const filename = req.params.filename;
  // Récupérer le chemin complet de l'image
  const imagePath = path.join(__dirname, "./video", filename);
  // Renvoyer l'image au client
  res.sendFile(imagePath);
});
app.get("/exercices/:filename", (req, res) => {
  const filename = req.params.filename;
  // Récupérer le chemin complet de l'image
  const imagePath = path.join(__dirname, "./exercices", filename);
  // Renvoyer l'image au client
  res.sendFile(imagePath);
});

app.use("/api/user", userRoute);
app.use("/api/audio", AudioRoute);
app.use("/api/video", VideoRoute);
app.use("/api/calendar", calendarRoute);
app.use("/api/exercices", ExerciceRoute);

app.listen(port || 7500, () =>
  console.log(`Le serveur est démarrer sur le port ${port}`)
);
