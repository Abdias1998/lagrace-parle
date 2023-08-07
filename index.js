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
const useragent = require("express-useragent");
const AudioRoute = require("./routes/audio.routes");
const VideoRoute = require("./routes/video.routes");
const calendarRoute = require("./routes/calendar.routes");
const ExerciceRoute = require("./routes/exercices.routes");
const ImageRoute = require("./routes/images.routes");
const postRoute = require("./routes/posts.routes");
const rate_limiter = require("./utils/rate.limiter");
const path = require("path");

// const firewall = require("node-firewall");
const { default: helmet } = require("helmet");
// Définir le fuseau horaire souhaité
// const timezone = "Africa/Porto-Novo"; // Fuseau horaire du Bénin

// Environnement variable

const port = process.env.PORT;
const origineClient = process.env.CLIENT_URL;
app.use(useragent.express());
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
app.get("/publication/:id", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build", "index.html"));
});
app.get("/:id", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build", "index.html"));
});
app.get("/post", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build", "index.html"));
});
app.get("/searchpage", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build", "index.html"));
});
app.get("/img", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build", "index.html"));
});
app.get("/login", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build", "index.html"));
});
app.get("/find", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build", "index.html"));
});
app.get("/session", function (req, res) {
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
app.get("/partitions/:id", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build", "index.html"));
});
app.get("/images/:token/:id", function (req, res) {
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
app.get("/delete/:token/:id", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build", "index.html"));
});
// Définir le chemin du dossier "public"

app.use(express.static(path.join(__dirname, "./image")));
app.use(express.static(path.join(__dirname, "./partition")));
app.use(express.static(path.join(__dirname, "./posts")));
app.use(express.static(path.join(__dirname, "./audio")));
app.use(express.static(path.join(__dirname, "./video")));
app.use(express.static(path.join(__dirname, "./exercices")));
app.use(express.static(path.join(__dirname, "./picture")));

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
  // Récupérer le chemin complet de l'audio
  const imagePath = path.join(__dirname, "./audio", filename);
  // Renvoyer l'audio au client
  res.sendFile(imagePath);
});
app.get("/video/:filename", (req, res) => {
  const filename = req.params.filename;
  // Récupérer le chemin complet de la vidéo
  const imagePath = path.join(__dirname, "./video", filename);
  // Renvoyer la vidéo au client
  res.sendFile(imagePath);
});
// app.get("/exercices/:filename", (req, res) => {
//   const filename = req.params.filename;
//   // Récupérer le chemin complet de l'image
//   const imagePath = path.join(__dirname, "./exercices", filename);
//   // Renvoyer l'image au client
//   res.sendFile(imagePath);
// });
app.get("/picture/:filename", (req, res) => {
  const filename = req.params.filename;
  // Récupérer le chemin complet de l'image
  const imagePath = path.join(__dirname, "./picture", filename);
  // Renvoyer l'image au client
  res.sendFile(imagePath);
});
app.get("/post/:filename", (req, res) => {
  const filename = req.params.filename;
  // Récupérer le chemin complet de l'image
  const imagePath = path.join(__dirname, "./posts", filename);
  // Renvoyer l'image au client
  res.sendFile(imagePath);
});

app.use("/api/user", userRoute);
app.use("/api/audio", AudioRoute);
app.use("/api/video", VideoRoute);
app.use("/api/posts", postRoute);
app.use("/api/calendar", calendarRoute);
app.use("/api/exercices", ExerciceRoute);
app.use("/api/picture", ImageRoute);
const now = new Date();
console.log(now.getHours());
// const User = require("./modeles/user"); // Assurez-vous que le chemin vers votre modèle User est correct

// const logTo = async () => {
//   try {
//     await User.updateMany(
//       {},
//       {
//         $set: {
//           nombreRetard: 0,
//           nombreAbsent: 0,
//           nombrePermission: 0,
//           nombrePonctuelle: 0,
//         },
//       }
//     );
//   } catch (error) {
//     console.log(error);
//   }
//   console.log("Mise a jour");
// };
app.listen(port || 7500, () =>
  console.log(`Le serveur est démarrer sur le port ${port}`)
);
// logTo();
