const router = require("express").Router();

const video_controler = require("../controller/video.controler");
// const middleware = require("../middlewre/verify.token");
const multer = require("multer");

const storages = multer.diskStorage({
  destination: (req, file, cb) => {
    // cb(null, "./client/build/audio");
    cb(null, "./video");
  },
  filename: (req, file, cb) => {
    cb(null, `${file.originalname}`);
  },
});
const uploads = multer({ storage: storages });
router.get("/read", video_controler.readVideo); /**Lire une partition */
router.post(
  "/create",

  uploads.single("video"),
  video_controler.createVideo
); /**Créer une partition */
router.post(
  "/video/:id",
  video_controler.ViewsMiddelware,
  video_controler.IncrementView
);
module.exports = router;
