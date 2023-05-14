const router = require("express").Router();
const partition_controler = require("../controller/audio.controler");
// const middleware = require("../middlewre/verify.token");
const multer = require("multer");

const generateCode = () => {
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += Math.floor(Math.random() * 10);
  }
  return code;
};
const date = new Date();
const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1)
  .toString()
  .padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}`;

const storages = multer.diskStorage({
  destination: (req, file, cb) => {
    // cb(null, "./client/build/audio");
    cb(null, "./audio");
  },
  filename: (req, file, cb) => {
    cb(null, `Audio-${formattedDate}-LGP-${generateCode()}`);
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
