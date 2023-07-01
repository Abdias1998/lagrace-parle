const Partition = require("../modeles/partition");

const async_handler = require(`express-async-handler`);
/* global process */

const mongoose = require("mongoose");
const ObjectdId = mongoose.Types.ObjectId;

/**Créer un chant de partition */
module.exports.createPartition = async_handler(async (req, res) => {
  const { title, auteur, gamme, categorie } = req.body;
  /**Vérifiez si le poster id est celle de l'administrateur si noon renvoyer une erreur 404  */

  /**Envoyer les données dans notre base de donnée */
  const partition = req.files?.map(
    (file) => `${process.env.URL}/partition/${file.originalname}`
  );
  const newPartition = new Partition({
    title,
    auteur,
    gamme,
    categorie,

    // partition: req.file !== null ? `../partition/${req.file.originalname}` : "",
    partition,
  });

  try {
    await newPartition.save();
    categorie === "All"
      ? res.status(201).json({
          message: `L'image d'enssemble est envoyé à chaque partition`,
        })
      : res.status(201).json({
          message: `Seule la partition des ${categorie}s est crée et envoyé au répertoire`,
        });
  } catch (error) {
    return res.status(401).json({
      message: `Erreur interne du serveur, ${error}`,
    });
  }
});

/**Récuperer touts les chants */
module.exports.readPartition = async_handler(async (req, res) => {
  Partition.find((err, docs) => {
    if (!err) res.send(docs);
    else
      return res.status(500).json({
        message:
          "Erreur interne du serveur, vous pouvez pas récuperez les données",
      });
  }).sort({ createdAt: -1 });
});

module.exports.deletePartition = async_handler(async (req, res) => {
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
});

// module.exports.likePost = async (req, res) => {
//   if (!ObjectdId.isValid(req.params.id))
//     return res.status(400).json("Id Inconnue" + req.params.id);

//   try {
//     // Ajouter le like au publication
//     Partition.findByIdAndUpdate(
//       req.params.id,
//       {
//         $addToSet: { participatesViews: req.body.id },
//       },
//       { new: true, upsert: true },
//       (error, docs) => {
//         if (!error) res.status(201).json(docs);
//         else return res.status(400).json(error);
//       }
//     );

//     //Ajouter l'id au likes

//     UserModel.findByIdAndUpdate(
//       req.body.id,
//       {
//         $addToSet: { likes: req.params.id },
//       },
//       { new: true, upsert: true },
//       (error, docs) => {
//         if (error) return res.send(error);
//       }
//     );
//   } catch (error) {
//     res.status(500).json({ message: error });
//   }
// };
