const mongoose = require("mongoose");

const partitionSchema = mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, uppercase: true },
    auteur: { type: String, required: true },
    gamme: { type: String, required: true },
    partition: { type: String, required: true },

    categorie: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("partition", partitionSchema);
