const router = require("express").Router();
const partition_controler = require("../controller/audio.controler");
// const middleware = require("../middlewre/verify.token");
const multer = require("multer");

const storages = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./audio");
  },
  filename: (req, file, cb) => {
    cb(null, `${file.originalname}`);
  },
});
const uploads = multer({ storage: storages });
router.get("/read", partition_controler.readAudio); /**Lire les audios */
router.delete(
  "/delete_audio/:id",
  partition_controler.deleteAudio
); /**Supprimez un audio */
router.post(
  "/create",

  uploads.single("audio"),
  partition_controler.createAudio
); /**Créer une partition */

module.exports = router;
