const router = require("express").Router();

const post_controller = require("../controller/posts.controler");

// const middleware = require("../middlewre/verify.token");

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
router.get("/", post_controller.readPost); // Récuperer touts les posts

router.put("/:id", post_controller.updatePost); //Modifier le post de l'utilisateur

router.get("/:id", post_controller.userPost); // Post d'un utilisateur
router.delete("/:id", post_controller.deletePost); //Supprimer le post de l'utilisateur
router.patch("/comment-post/:id", post_controller.commentPost); //Commenter un post
module.exports = router;
