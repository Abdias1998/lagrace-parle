const mongoose = require("mongoose");

const ImageSchema = mongoose.Schema(
  {
    titre: {
      required: true,
      type: String,
      trim: true,
    },
    picture: {
      required: true,
      type: String,
      trim: true,
    },
    category: {
      required: true,
      type: String,
      trim: true,
    },
    partition: {
      required: true,
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("image", ImageSchema);
