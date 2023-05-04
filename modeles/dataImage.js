const mongoose = require("mongoose");

const ImageSchema = mongoose.Schema(
  {
    titre: {
      required: true,
      type: String,
    },
    picture: {
      required: true,
      type: String,
    },
    category: {
      type: String,
      default: "All",
    },
    partition: {
      type: String,
      default: "All",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("image", ImageSchema);
