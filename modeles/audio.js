const mongoose = require("mongoose");

const AudioSchema = mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, uppercase: true },

    audio: { type: String, required: true },
    participatesViews: {
      type: [
        {
          userId: String,
          timestamp: Number,
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("audio", AudioSchema);
