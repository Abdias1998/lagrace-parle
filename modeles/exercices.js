const mongoose = require("mongoose");

const ExercicesSchema = new mongoose.Schema(
  {
    posterId: {
      type: String,
      required: true,
    },

    picture: {
      type: String,
    },
    video: {
      type: String,
    },
    emailPoster: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      trim: true,
    },

    likers: {
      type: [String],
      required: true,
    },

    comments: {
      type: [
        {
          commenterId: String,

          text: String,
          timestamp: Number,
        },
      ],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("exercice", ExercicesSchema);
