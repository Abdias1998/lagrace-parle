/* global process */

const PostModel = require("../modeles/posts");
const UserModel = require("../modeles/user");
const async_handler = require(`express-async-handler`);
const mongoose = require("mongoose");
const ObjectdId = mongoose.Types.ObjectId;

// CREER UN POST

module.exports.createPost = async_handler(async (req, res) => {
  const { posterId, colorActive, instrumentPost, partitionPost, message } =
    req.body;

  const pictures = req.files?.map(
    (file) => `${process.env.URL}/posts/${file.originalname}`
  );
  /**Verifie si c'est l'id de mongoose */
  if (!ObjectdId.isValid(req.params.id)) {
    return res
      .status(400)
      .json({ message: `L'identifiant n'existe pas ${req.params.id} ` });
  }
  /**Vérifie si la vidéo n'est pas trop lourde */

  /**Vérifie si le texte est trop long et s'il contient des mots inacepatable */
  if (message.length > 600)
    return res.status(400).json({ message: `Votre texte est trop long` });

  /**Vérifie si les photos sont trop volumineux */
  const newPost = new PostModel({
    posterId,
    instrumentPost,
    partitionPost,
    message,
    colorActive,
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
