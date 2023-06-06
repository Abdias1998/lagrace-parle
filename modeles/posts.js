const mongoose = require("mongoose");

// Notre modèle de post

const PostSchema = new mongoose.Schema(
  {
    posterId: {
      type: String,
      required: true,
    },

    pictures: {
      type: [
        {
          type: String,
        },
      ],
    },
    instrumentPost: {
      type: String,
      required: true,
      trim: true,
    },
    partitionPost: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: [
        {
          texte: String,
          colorActive: String,
        },
      ],
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

module.exports = mongoose.model("post", PostSchema);
