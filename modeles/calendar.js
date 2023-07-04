const mongoose = require("mongoose");
const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  start: {
    type: Date,
    required: true,
  },
  end: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  // views: {
  //   type: Boolean,
  //   required: true,
  //   default: false,
  // },
  likers: {
    type: [String],
    required: true,
  },
  participatesViews: {
    type: [
      {
        userId: String,
        timestamp: Number,
      },
    ],
  },
});

module.exports = mongoose.model("calendar", EventSchema);
