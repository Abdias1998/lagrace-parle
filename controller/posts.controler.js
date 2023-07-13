/* global process */

const PostModel = require("../modeles/posts");
// const UserModel = require("../modeles/user");
const async_handler = require(`express-async-handler`);
const mongoose = require("mongoose");
const ObjectdId = mongoose.Types.ObjectId;

// CREER UN POS

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

module.exports.readPost = async (req, res) => {
  PostModel.find((err, docs) => {
    if (!err) res.send(docs);
    else console.log("Error to get data:" + err);
  }).sort({ createdAt: -1 });
};

module.exports.userPost = async (req, res) => {
  if (!ObjectdId.isValid(req.params.id)) {
    return res.status(400).send("Id Inconnue" + req.params.body);
  }

  PostModel.findById(req.params.id, (err, docs) => {
    if (!err) res.send(docs);
    else console.log("Id unknow" + err);
  });
};
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

module.exports.commentPost = async (req, res) => {
  if (!ObjectdId.isValid(req.params.id))
    return res.status(400).json("Id Inconnue" + req.params.id);
  try {
    return PostModel.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: {
            commenterId: req.body.commenterId,

            text: req.body.text,
            timestamp: new Date().getTime(),
          },
        },
      },
      {
        new: true,
      }
      // (error, docs) => {
      //   if (!error) return res.send(docs);
      //   else return res.status(400).send(error);
      // }
    ).then((err, docs) => {
      if (!err) return res.send(docs);
    });
    // .clone();
  } catch (error) {
    return res.status(400).send(error);
  }
};
