const Event = require("../modeles/calendar");
const User = require("../modeles/user");
const mongoose = require("mongoose");
const ObjectdId = mongoose.Types.ObjectId;

module.exports.CreateCalendar = async (req, res) => {
  try {
    const { title, start, end, location, description } = req.body;

    const event = new Event({
      title: title,
      start: start,
      end: end,
      location: location,
      description: description,
      likers: [],
    });

    // Enregistrer le nouvel événement dans la base de données
    await event.save();

    return res
      .status(200)
      .json({ message: "L'événement a été créé avec succès." });
  } catch (error) {
    res.status(500).json({
      message: `Une erreur est survenue lors de la création de l'événement. ${error}`,
    });
  }
};
module.exports.updateCalendar = async (req, res) => {
  try {
    const { title, start, end, location, description } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res
        .status(404)
        .json({ message: "L'événement n'a pas été trouvé." });
    }

    // Mettre à jour les propriétés de l'événement
    event.title = title;
    event.start = start;
    event.end = end;
    event.location = location;
    event.description = description;

    // Enregistrer l'événement modifié dans la base de données
    await event.save();

    return res
      .status(200)
      .json({ message: "L'événement a été mis à jour avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      error: `Une erreur est survenue lors de la mise à jour de l'événement. ${error}`,
    });
  }
};

module.exports.getCalendar = async (req, res) => {
  try {
    const events = await Event.find();

    return res.send(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: `Une erreur est survenue lors de la récupération des événements. ${error}`,
    });
  }
};

module.exports.AddEvent = async (req, res) => {
  if (!ObjectdId.isValid(req.params.id))
    return res.status(400).json("Id Inconnue " + req.params.id);

  try {
    // Ajouter le like au publication
    Event.findByIdAndUpdate(
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

    User.findByIdAndUpdate(
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
    return res.status(500).json({ message: error });
  }
};

module.exports.NoAddEvent = async (req, res) => {
  if (!ObjectdId.isValid(req.params.id))
    return res.status(400).json("Id Inconnue" + req.params.id);

  try {
    // Retirer le like au publication
    Event.findByIdAndUpdate(
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

    User.findByIdAndUpdate(
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
