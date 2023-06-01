const mongoose = require("mongoose");

const espionSchema = new mongoose.Schema({
  partition: {
    type: [
      {
        postId: String,
        userId: String,
        timestamp: Number,
      },
    ],
  },
  audio: {
    type: [
      {
        postId: String,
        userId: String,
        timestamp: Number,
      },
    ],
  },
  video: {
    type: [
      {
        postId: String,
        userId: String,
        timestamp: Number,
      },
    ],
  },
});

const Video = mongoose.model("espions", espionSchema);

module.exports = Video;
