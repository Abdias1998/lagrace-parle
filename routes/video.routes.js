const router = require("express").Router();

const video_controler = require("../controller/video.controler");
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
    cb(null, "./video");
  },
  filename: (req, file, cb) => {
    cb(null, `Video-${formattedDate}-LGP-${generateCode()}`);
  },
});
const uploads = multer({ storage: storages });
router.put("/views/:id", video_controler.ViewsMiddelware);
router.get("/read", video_controler.readVideo); /**Lire une partition */
router.post(
  "/create",

  uploads.single("video"),
  video_controler.createVideo
); /**Créer une partition */
router.delete(
  "/delete_video/:id",
  video_controler.deleteVideo
); /**Supprimez un audio */
module.exports = router;
