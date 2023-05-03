const mongoose = require("mongoose");

const ExercicesSchema = new mongoose.Schema(
  {
    // posterId: {
    //   type: String,
    //   required: true,
    // },

    // picture: {
    //   type: String,
    // },

    // emailPoster: {
    //   type: String,
    //   required: true,
    //   trim: true,
    // },

    message: {
      type: String,
      required: true,
    },
    date: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("exercice", ExercicesSchema);
