const Partition = require("../modeles/partition");
/* global process */

const mongoose = require("mongoose");
const ObjectdId = mongoose.Types.ObjectId;
/**Créer un chant de partition */
module.exports.createPartition = async (req, res) => {
  const { title, auteur, gamme } = req.body;
  /**Vérifiez si le poster id est celle de l'administrateur si noon renvoyer une erreur 404  */

  /**Envoyer les données dans notre base de donnée */

  const newPartition = new Partition({
    title,
    auteur,
    gamme,

    // partition: req.file !== null ? `../partition/${req.file.originalname}` : "",
    partition:
      req.file !== null
        ? `${process.env.URL}/partition/${req.file.originalname}`
        : "",
  });

  try {
    const partition = await newPartition.save();
    return res.status(201).json({ message: "partition crée", partition });
  } catch (error) {
    return res.status(401).json({
      message: `Erreur interne du serveur ${error}`,
    });
  }
};

/**Récuperer touts les chants */
module.exports.readPartition = async (req, res) => {
  Partition.find((err, docs) => {
    if (!err) res.send(docs);
    else
      return res.status(500).json({
        message:
          "Erreur interne du serveur, vous pouvez pas récuperez les données",
      });
  }).sort({ createdAt: -1 });
};

module.exports.deletePartition = async (req, res) => {
  const id = req.params.id;

  if (!ObjectdId.isValid(id)) {
    return res.status(400).send("Id Inconnue" + req.params.id);
  }

  Partition.findByIdAndRemove(id, (err, docs) => {
    if (!err) res.send(docs);
    else
      return res.status(500).json({
        message:
          "Vous pouvez pas supprimez cette partition, veuilez réessayez plus tard",
      });
  });
};
