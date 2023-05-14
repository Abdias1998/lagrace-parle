const router = require("express").Router();

const image_controler = require("../controller/image.controler");
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
    cb(null, "./picture");
  },
  filename: (req, file, cb) => {
    cb(null, `IMG-${formattedDate}-LGP-${generateCode()}`);
  },
});
const uploads = multer({
  storage: storages,
  limits: { fileSize: 5 * 1024 * 1024 },
});
router.post(
  "/create",
  uploads.array("pictures", 100),
  image_controler.createImage
); /**Créer une partition */
router.get("/read", image_controler.readImage); /**Lire une image*/
router.delete("/:id", image_controler.deleteImage); /*Supprimer une image */

module.exports = router;
