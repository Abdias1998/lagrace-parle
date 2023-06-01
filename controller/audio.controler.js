const Audio = require("../modeles/audio");

const mongoose = require("mongoose");
const ObjectdId = mongoose.Types.ObjectId;

const async_handler = require(`express-async-handler`);

/* global process */
/**Créer un Audio */
module.exports.createAudio = async_handler(async (req, res) => {
  const { title } = req.body;

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

    return res
      .status(201)
      .json({ message: `L'audio ${title} est envoyé au répertoire` });
  } catch (error) {
    return res.status(401).json({
      message: `Erreur interne du serveur ${error}`,
    });
  }
});

/**Récuperer touts les audios */
module.exports.readAudio = async_handler(async (req, res) => {
  Audio.find((err, docs) => {
    if (!err) res.send(docs);
    else
      return res.status(500).json({
        message:
          "Erreur interne du serveur, vous pouvez pas récuperez les données d'audio",
      });
  }).sort({ createdAt: -1 });
});

/**Supprimez un audio */
module.exports.deleteAudio = async_handler(async (req, res) => {
  const id = req.params.id;

  if (!ObjectdId.isValid(id)) {
    return res.status(400).send("Id de l'audio inconnue" + req.params.id);
  }

  Audio.findByIdAndRemove(id, (err, docs) => {
    if (!err) res.send(docs);
    else
      return res.status(500).json({
        message:
          "Vous pouvez pas supprimez cet audio, veuilez réessayez plus tard",
      });
  });
});
