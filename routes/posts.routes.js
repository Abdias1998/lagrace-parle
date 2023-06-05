const router = require("express").Router();

const post_controller = require("../controller/posts.controler");

const middleware = require("../middlewre/verify.token");

const multer = require("multer");

const storages = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./posts");
  },
  filename: (req, file, cb) => {
    cb(null, `${file.originalname}`);
  },
});
const uploads = multer({
  storage: storages,
  limits: { fileSize: 7 * 1024 * 1024 },
});
router.post(
  "/create",
  //   middleware.verifyToken,
  uploads.array("posts", 20),
  post_controller.createPost
);
router.get("/", middleware.verifyToken, post_controller.readPost); // Récuperer touts les posts

router.get("/:id", post_controller.userPost); // Post d'un utilisateur

module.exports = router;
