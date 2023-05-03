const router = require("express").Router();

const exerciceControler = require("../controller/exercice.controler");

// const multer = require("multer");

// const storages = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "./exercices");
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${file.originalname}`);
//   },
// });

// const uploads = multer({ storage: storages });

router.get("/", exerciceControler.readPost);
router.post("/", exerciceControler.createPost);
router.get("/:id", exerciceControler.userPost);
router.put("/:id", exerciceControler.updatePost);
router.delete("/:id", exerciceControler.deletePost);
router.get("/user/:id", exerciceControler.getByUserId);
router.patch("/signal-post/:id", exerciceControler.SignalPost);
router.patch("/like-post/:id", exerciceControler.likePost);
router.patch("/unsignal-post/:id", exerciceControler.unSignalPost);
router.patch("/unlike-post/:id", exerciceControler.unlikePost);

// comments
router.patch("/comment-post/:id", exerciceControler.commentPost);
router.patch("/edit-comment-post/:id", exerciceControler.editCommentPost);
router.patch("/delete-comment-post/:id", exerciceControler.deleteCommentPost);
module.exports = router;
