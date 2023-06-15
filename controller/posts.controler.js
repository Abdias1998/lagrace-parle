/* global process */

const PostModel = require("../modeles/posts");
const UserModel = require("../modeles/user");
const async_handler = require(`express-async-handler`);
const mongoose = require("mongoose");
const ObjectdId = mongoose.Types.ObjectId;

// CREER UN POST

module.exports.createPost = async_handler(async (req, res) => {
  const { posterId, colorActive, instrumentPost, partitionPost, texte } =
    req.body;

  const pictures = req.files?.map(
    (file) => `${process.env.URL}/post/${file.originalname}`
  );
  /**Verifie si c'est l'id de mongoose */
  if (!ObjectdId.isValid(posterId)) {
    return res
      .status(400)
      .json({ message: `L'identifiant n'existe pas ${req.params.id} ` });
  }

  /**Vérifie si les photos sont trop volumineux */
  const message = [{ texte, colorActive }];
  const newPost = new PostModel({
    posterId,
    instrumentPost,
    partitionPost,
    message,
    likers: [],
    comments: [],
    pictures,
  });
  try {
    const post = await newPost.save();
    return res.status(201).json(post);
  } catch (error) {
    return res.status(401).send(error);
  }
});
module.exports.updatePost = (req, res) => {
  const { texte, colorActive } = req.body;
  try {
    if (!ObjectdId.isValid(req.params.id)) {
      return res.status(400).send("Id Inconnue" + req.params.id);
    }

    const updatedMessage = [{ texte, colorActive }];

    PostModel.findByIdAndUpdate(
      req.params.id,
      {
        $set: updatedMessage,
      },
      {
        new: true,
      },
      (error, docs) => {
        if (!error) res.send(docs);
        else res.status(500).json({ message: error });
      }
    ).select("-password");
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

module.exports.readPost = async_handler(async (req, res) => {
  try {
    const posts = await PostModel.find().sort({ createdAt: 1 });
    res.send(posts);
  } catch (err) {
    console.log("Error to get data: " + err);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

module.exports.userPost = async_handler(async (req, res) => {
  if (!ObjectdId.isValid(req.params.id)) {
    return res.status(400).send("Id Inconnue" + req.params.id);
  }

  PostModel.findById(req.params.id, (err, docs) => {
    if (!err) res.send(docs);
    else console.log("Id unknow" + err);
  });
});
module.exports.deletePost = async (req, res) => {
  const id = req.params.id;

  if (!ObjectdId.isValid(id)) {
    return res.status(400).send("Id Inconnue" + req.params.id);
  }

  PostModel.findByIdAndRemove(id, (err, docs) => {
    if (!err) res.send(docs);
    else console.log("Delete error" + err);
  });
};
