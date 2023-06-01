const mongoose = require("mongoose");

const ImageSchema = mongoose.Schema(
  {
    titre: {
      type: String,
      required: true,
      trim: true,
    },
    partition: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    participatesViews: {
      type: [
        {
          userId: String,
          timestamp: Number,
        },
      ],
    },
    pictures: {
      type: [
        {
          type: String,
          required: true,
        },
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Image", ImageSchema);
