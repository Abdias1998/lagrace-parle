const mongoose = require("mongoose");

const ExercicesSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
    date: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("exercice", ExercicesSchema);
