const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },

  videoUrl: {
    type: String,
    required: true,
  },
  views: {
    type: Number,
    default: 0,
  },
  participatesViews: {
    type: [
      {
        userId: String,
        timestamp: Number,
      },
    ],
  },
  viewedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Video = mongoose.model("Video", videoSchema);

module.exports = Video;
