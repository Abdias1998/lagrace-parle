const mongoose = require("mongoose");

const ImageSchema = mongoose.Schema({
  titre: {
    required: true,
    type: String,
  },
  picture: {
    required: true,
    type: String,
  },
  category: {
    required: true,
    type: String,
  },
});

module.exports = mongoose.model("image", ImageSchema);
