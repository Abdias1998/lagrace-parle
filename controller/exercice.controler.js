const ExerciceModel = require("../modeles/exercices");
const UserModel = require("../modeles/user");

// const { promisify } = require("util");

const ObjectId = require("mongoose").Types.ObjectId;
// CREER UN POST

module.exports.createPost = async (req, res) => {
  const { message } = req.body;
  const date = new Date(); // crée un objet Date avec la date et l'heure actuelles
  const jour = String(date.getDate()).padStart(2, "0"); // extrait le jour et ajoute un zéro devant si le nombre n'a qu'un seul chiffre
  const mois = String(date.getMonth() + 1).padStart(2, "0"); // extrait le mois (en commençant par 0 pour janvier) et ajoute un zéro devant si le nombre n'a qu'un seul chiffre
  const annee = date.getFullYear(); // extrait l'année
  const heures = String(date.getHours()).padStart(2, "0"); // extrait les heures et ajoute un zéro devant si le nombre n'a qu'un seul chiffre
  const minutes = String(date.getMinutes()).padStart(2, "0"); // extrait les minutes et ajoute un zéro devant si le nombre n'a qu'un seul chiffre
  const secondes = String(date.getSeconds()).padStart(2, "0"); // extrait les secondes et ajoute un zéro devant si le nombre n'a qu'un seul chiffre
  const dateFormatee = `${jour}/${mois}/${annee} ${heures}:${minutes}:${secondes}`; // combine les valeurs pour créer la chaîne de date et heure formatée

  const newPost = new ExerciceModel({
    // posterId,
    // emailPoster,

    message,
    date: dateFormatee,

    // picture:
    //   req.file !== null
    //     ? `${process.env.URL}/exercices/${req.file.originalname}`
    //     : "",
  });

  try {
    await newPost.save();
    return res.status(201).json({ message: "Communiquer créer" });
  } catch (error) {
    return res.status(401).send({
      message:
        "Erreur interne du serveur, veuillez réessayez plus tard" + error,
    });
  }
};
// REUCPERER TOUTS LES POSTS
module.exports.readPost = async (req, res) => {
  ExerciceModel.find((err, docs) => {
    if (!err) res.send(docs);
    else
      return res.status(500).json({
        message:
          "Erreur interne du serveur, vous pouvez pas récuperez les données",
      });
  }).sort({ createdAt: -1 });
};
// RECUPERER LES POSTS D'UN UTILISATEUR
module.exports.userPost = async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).send("Id Inconnue " + req.params.body);
  }

  ExerciceModel.findById(req.params.id, (err, docs) => {
    if (!err) res.send(docs);
    else
      return res.status(500).json({
        message: "Id de l'utilisateur est inconnu",
      });
  });
};
// MODIFIER UN LE MESSAGE D'UN POST
module.exports.updatePost = (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).send("Id Inconnue" + req.params.id);
    }
    const Upadatemessage = {
      message: req.body.message,
    };

    ExerciceModel.findByIdAndUpdate(
      req.params.id,
      {
        $set: Upadatemessage,
      },
      {
        new: true,
      },
      (error, docs) => {
        if (!error) res.send(docs);
        else
          res.status(500).json({
            message: "Erreur interne du serveur, veuillez réessayez plus tard",
          });
      }
    ).select("-password");
  } catch (error) {
    res.status(500).json({
      message: "Erreur interne du serveur, veuillez réessayez plus tard",
    });
  }
};
// RECUPERER LES POSTS D'UN UTULISATEUR
module.exports.getByUserId = async (req, res) => {
  const id = req.params.id;

  let userpost;

  try {
    userpost = await UserModel.findById(id).populate("posts");
  } catch (error) {
    return res.status(500).json({
      message:
        "Erreur interne du serveur, veuillez vérifiez votre connexion internet",
    });
  }

  if (!userpost) return res.status(404).json({ message: "Aucun post trouver" });
  else return res.status(200).json({ posts: userpost });
};
// SUPPRIMER UN POST
module.exports.deletePost = async (req, res) => {
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send("Id Inconnue" + req.params.id);
  }

  ExerciceModel.findByIdAndRemove(id, (err, docs) => {
    if (!err) res.send(docs);
    else
      return res.status(500).json({
        message:
          "Vous pouvez pas supprimez ce post, veuilez réessayez plus tard",
      });
  });
};
// LIKER UN POST
module.exports.likePost = async (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).json("Id Inconnue " + req.params.id);

  try {
    // Ajouter le like au publication
    ExerciceModel.findByIdAndUpdate(
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
// NE PLUS AIMER UN POST
module.exports.unlikePost = async (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).json("Id Inconnue" + req.params.id);

  try {
    // Retirer le like au publication
    ExerciceModel.findByIdAndUpdate(
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

    //Retirer l'id au likes

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
// SIGNALER UN POST
module.exports.SignalPost = async (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).json("Id Inconnue" + req.params.id);

  try {
    // Ajouter le signal au publication
    ExerciceModel.findByIdAndUpdate(
      req.params.id,
      {
        $addToSet: { signal: req.body.id },
      },
      { new: true, upsert: true },
      (error, docs) => {
        if (!error) res.status(201).json(docs);
        else return res.status(400).json(error);
      }
    );

    //Ajouter l'id au signal

    UserModel.findByIdAndUpdate(
      req.body.id,
      {
        $addToSet: { signal: req.params.id },
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
// NE PLUS SIGNALER UN POST
module.exports.unSignalPost = async (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).json("Id Inconnue" + req.params.id);

  try {
    //Retirer le signal au publication
    ExerciceModel.findByIdAndUpdate(
      req.params.id,
      {
        $pull: { signal: req.body.id },
      },
      { new: true, upsert: true },
      (error, docs) => {
        if (!error) res.status(201).json(docs);
        else return res.status(400).json(error);
      }
    );

    //Retirer l'id au signal

    UserModel.findByIdAndUpdate(
      req.body.id,
      {
        $pull: { signal: req.params.id },
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

// COMMENTEZ UN POST
module.exports.commentPost = async (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).json("Id Inconnue " + req.params.id);
  try {
    return ExerciceModel.findByIdAndUpdate(
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
    ).then((err, docs) => {
      if (!err) return res.send(docs);
    });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Erreur interne du serveur, réessayez plus tard" });
  }
};
// MODIFIER UN COMMENTAIRE
module.exports.editCommentPost = (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send("Id inconnu : " + req.params.id);

  try {
    return ExerciceModel.findById(req.params.id, (err, docs) => {
      const theComment = docs.comments.find((comment) =>
        comment._id.equals(req.body.commentId)
      );

      if (!theComment)
        return res.status(404).send("Aucun commentaire trouvé avec cet id");

      theComment.text = req.body.text;

      return docs.save((err) => {
        if (!err) return res.status(200).send(docs);
        return res.status(500).send(err);
      });
    });
  } catch (err) {
    return res.status(400).send(err);
  }
};
// SUPPRIMEZ UN COMMENTAIRE
module.exports.deleteCommentPost = (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    return ExerciceModel.findByIdAndUpdate(
      req.params.id,
      {
        $pull: {
          comments: {
            _id: req.body.commentId,
          },
        },
      },
      { new: true }
    )
      .then((data) => res.send(data))
      .catch((err) => res.status(500).send({ message: err }));
  } catch (err) {
    return res.status(400).send(err);
  }
};
