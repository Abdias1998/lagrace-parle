const Audio = require("../modeles/audio");

const mongoose = require("mongoose");
const ObjectdId = mongoose.Types.ObjectId;
/* global process */
/**Créer un chant de Audio */

module.exports.createAudio = async (req, res) => {
  const { title } = req.body;
  /**Vérifiez si le poster id est celle de l'administrateur si noon renvoyer une erreur 404  */

  /**Envoyer les données dans notre base de donnée */
  const newAudio = new Audio({
    title,

    audio:
      req.file !== null
        ? `${process.env.URL}/audio/${req.file.originalname}`
        : "",
  });

  try {
    await newAudio.save();
    return res.status(201).json({ message: "Audio crée" });
  } catch (error) {
    return res.status(401).json({
      message: `Erreur interne du serveur ${error}`,
    });
  }
};

/**Récuperer touts les chants */
module.exports.readAudio = async (req, res) => {
  Audio.find((err, docs) => {
    if (!err) res.send(docs);
    else
      return res.status(500).json({
        message:
          "Erreur interne du serveur, vous pouvez pas récuperez les données d'audio",
      });
  }).sort({ createdAt: -1 });
};

module.exports.deleteAudio = async (req, res) => {
  const id = req.params.id;

  if (!ObjectdId.isValid(id)) {
    return res.status(400).send("Id Inconnue" + req.params.id);
  }

  Audio.findByIdAndRemove(id, (err, docs) => {
    if (!err) res.send(docs);
    else
      return res.status(500).json({
        message:
          "Vous pouvez pas supprimez cet audio, veuilez réessayez plus tard",
      });
  });
};
