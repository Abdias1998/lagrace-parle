const Image = require("../modeles/dataImage");

const async_handler = require(`express-async-handler`);
/* global process */

const mongoose = require("mongoose");

const ObjectdId = mongoose.Types.ObjectId;
/**Créer un chant de partition */

// module.exports.createImage = async_handler(async (req, res) => {
//   const { titre, category, partition } = req.body;
//   /** Vérifier si le poster id est celui de l'administrateur. Si ce n'est pas le cas, renvoyer une erreur 404 */

//   /** Envoyer les données dans notre base de données */

//   const newImage = new Image({
//     titre,
//     category,
//     partition,
//     pictures: req.files.map(
//       (file) => `${process.env.URL}/picture/${file.originalname}`
//     ),
//   });

//   try {
//     await newImage.save();
//     let message =
//       partition === "All"
//         ? "L'image d'ensemble est envoyée"
//         : `L'image des ${category}s est envoyée`;
//     return res.status(201).json({ message });
//   } catch (error) {
//     return res.status(500).json({
//       message: `Erreur interne du serveur ${error}`,
//     });
//   }
// });

const asyncHandler = require("express-async-handler");

module.exports.createImage = asyncHandler(async (req, res) => {
  const { titre, category, partition } = req.body;

  /** Vérifier si le poster id est celui de l'administrateur. Si ce n'est pas le cas, renvoyer une erreur 404 */
  // Ajoutez votre logique de vérification ici

  const pictures = req.files?.map(
    (file) => `${process.env.URL}/picture/${file.originalname}`
  );

  const newImage = new Image({
    titre,
    category,
    partition,
    pictures,
  });

  try {
    await newImage.save();

    let message =
      partition === "All"
        ? "L'image d'ensemble est envoyée"
        : `L'image des ${category}s est envoyée`;

    return res.status(201).json({ message });
  } catch (error) {
    return res.status(500).json({
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
