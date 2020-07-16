const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var User = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  subscriptions: [{ type: String }],
  publicacao: [
    {
      name: { type: String },
      texto: { type: String },
      postedAt: { type: Date, default: Date.now() },
    },
  ],
});

module.exports = mongoose.model("user", User);
