const router = require("express").Router();

const image_controler = require("../controller/image.controler");
// const middleware = require("../middlewre/verify.token");
const multer = require("multer");

const storages = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./picture");
  },
  filename: (req, file, cb) => {
    cb(null, `${file.originalname}`);
  },
});
const uploads = multer({ storage: storages });
router.get("/read", image_controler.readImage); /**Lire une image*/
router.delete("/:id", image_controler.deleteImage); /*Supprimer une image */
router.post(
  "/create",
  uploads.single("picture"),
  image_controler.createImage
); /**Créer une partition */

module.exports = router;
