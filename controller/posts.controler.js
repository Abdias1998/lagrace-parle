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
  /**Vérifie si la vidéo n'est pas trop lourde */

  // /**Vérifie si le texte est trop long et s'il contient des mots inacepatable */
  // if (texte.length > 600)
  //   return res.status(400).json({ message: `Votre texte est trop long` });

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
    return res.status(400).send("Id Inconnue" + req.params.body);
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
module.exports.likePost = async (req, res) => {
  if (!ObjectdId.isValid(req.params.id))
    return res.status(400).json("Id Inconnue" + req.params.id);

  try {
    // Ajouter le like au publication
    PostModel.findByIdAndUpdate(
      req.params.id,
      {
        $addToSet: { likers: req.body.id },
      },
      { new: true, upsert: true },
      (error, docs) => {
        if (!error) res.status(201).json(docs);
        else return res.status(400).json(error);
      }
    );

    //Ajouter l'id au likes

    UserModel.findByIdAndUpdate(
      req.body.id,
      {
        $addToSet: { likes: req.params.id },
      },
      { new: true, upsert: true },
      (error) => {
        if (error) return res.send(error);
      }
    );
  } catch (error) {
    res.status(500).json({ message: error });
  }
};
module.exports.unlikePost = async (req, res) => {
  if (!ObjectdId.isValid(req.params.id))
    return res.status(400).json("Id Inconnue" + req.params.id);

  try {
    // Ajouter le like au publication
    PostModel.findByIdAndUpdate(
      req.params.id,
      {
        $pull: { likers: req.body.id },
      },
      { new: true, upsert: true },
      (error, docs) => {
        if (!error) res.status(201).json(docs);
        else return res.status(400).json(error);
      }
    );

    //Ajouter l'id au likes

    UserModel.findByIdAndUpdate(
      req.body.id,
      {
        $pull: { likes: req.params.id },
      },
      { new: true, upsert: true },
      (error) => {
        if (error) return res.send(error);
      }
    );
  } catch (error) {
    res.status(500).json({ message: error });
  }
};
