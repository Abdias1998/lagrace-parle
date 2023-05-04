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

    res.status(201).json({ message: "Video created successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};
module.exports.readVideo = async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
module.exports.ViewsMiddelware = async (req, res, next) => {
  const { userId } = req.body;
  try {
    const video = await Video.findById(req.params.id);
    if (video.viewedBy.includes(userId)) {
      // L'utilisateur a déjà visionné la vidéo, ne rien faire
      return res.status(200).send("OK");
    }
    // L'utilisateur n'a pas encore visionné la vidéo, incrémenter le nombre de vues et ajouter l'utilisateur à la liste des utilisateurs ayant visionné la vidéo
    video.views++;
    video.viewedBy.push(userId);
    await video.save();
    res.status(200).send("Views increment");
  } catch (error) {
    next(error);
  }
};

module.exports.IncrementView = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Incrémenter le nombre de vues
    video.views++;
    await video.save();

    return res.status(200).json({
      message: "Views increment",
    });
  } catch (err) {
    next(err);
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
