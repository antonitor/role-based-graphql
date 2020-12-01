const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 4,
  },
  name: String,
  passwordHash: String,
  role: {
    type: String,
    enum: ["USER", "SALES", "ADMIN", "ROOT"],
    default: "USER",
  },
});

module.exports = mongoose.model("User", schema);
