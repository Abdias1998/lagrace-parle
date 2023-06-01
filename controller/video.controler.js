const Video = require("../modeles/video");

const mongoose = require("mongoose");
const ObjectdId = mongoose.Types.ObjectId;
/* global process */
module.exports.createVideo = async (req, res) => {
  try {
    const { title, description } = req.body;

    // Créer une nouvelle instance de la vidéo
    const newVideo = new Video({
      title,
      description,
      videoUrl:
        req.file !== null
          ? `${process.env.URL}/video/${req.file.originalname}`
          : "",
      views: 0,
    });

    // Enregistrer la vidéo dans la base de données
    await newVideo.save();

    return res
      .status(201)
      .json({ message: `La vidéo ${title} est envoyé au répertoire` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};
module.exports.readVideo = async (req, res) => {
  Video.find((err, docs) => {
    if (!err) res.send(docs);
    else
      return res.status(500).json({
        message:
          "Erreur interne du serveur, vous pouvez pas récuperez les données des vidéos",
      });
  }).sort({ createdAt: -1 });
};
module.exports.ViewsMiddelware = async (req, res) => {
  const { user } = req.body;
  try {
    const video = await Video.findById({ _id: req.params.id });
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    if (video.viewedBy?.includes(user)) {
      // L'utilisateur a déjà visionné la vidéo, ne rien faire
      return res.status(400).json({ message: "Video views" });
    }
    // L'utilisateur n'a pas encore visionné la vidéo, incrémenter le nombre de vues et ajouter l'utilisateur à la liste des utilisateurs ayant visionné la vidéo
    video.views++;
    video.viewedBy.push(user);
    await video.save();
    return res.send("Video view");
  } catch (error) {
    // next(error);
    return res.status(400).json({ message: `${error}` });
  }
};

module.exports.deleteVideo = async (req, res) => {
  const id = req.params.id;

  if (!ObjectdId.isValid(id)) {
    return res.status(400).send("Id Inconnue" + req.params.id);
  }

  Video.findByIdAndRemove(id, (err, docs) => {
    if (!err) res.send(docs);
    else
      return res.status(500).json({
        message:
          "Vous pouvez pas supprimez cette vidéo, veuilez réessayez plus tard",
      });
  });
};
