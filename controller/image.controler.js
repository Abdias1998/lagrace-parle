const Image = require("../modeles/dataImage");

const async_handler = require(`express-async-handler`);
/* global process */

const mongoose = require("mongoose");

const ObjectdId = mongoose.Types.ObjectId;
/**Créer un chant de partition */

module.exports.createImage = async_handler(async (req, res) => {
  const { titre, category, partition } = req.body;
  /**Vérifiez si le poster id est celle de l'administrateur si noon renvoyer une erreur 404  */

  /**Envoyer les données dans notre base de donnée */

  const newImage = new Image({
    titre,
    category,

    partition,
    picture:
      req.file !== null
        ? `${process.env.URL}/picture/${req.file.originalname}`
        : "",
  });

  try {
    await newImage.save();
    return partition === "All"
      ? res.status(201).json({ message: `L'image d'enssemble est envoyé` })
      : res
          .status(201)
          .json({ message: `L'image des ${category}s est envoyé` });
  } catch (error) {
    return res.status(401).json({
      message: `Erreur interne du serveur ${error}`,
    });
  }
});

/**Récuperer touts les chants */
module.exports.readImage = async_handler(async (req, res) => {
  Image.find((err, docs) => {
    if (!err) res.send(docs);
    else
      return res.status(500).json({
        message:
          "Erreur interne du serveur, vous pouvez pas récuperez les données",
      });
  }).sort({ createdAt: -1 });
});

module.exports.deleteImage = async_handler(async (req, res) => {
  const id = req.params.id;

  if (!ObjectdId.isValid(id)) {
    return res.status(400).send("Id Inconnue" + req.params.id);
  }

  Image.findByIdAndRemove(id, (err, docs) => {
    if (!err) res.send(docs);
    else
      return res.status(500).json({
        message:
          "Vous pouvez pas supprimez cette image, veuilez réessayez plus tard",
      });
  });
});
