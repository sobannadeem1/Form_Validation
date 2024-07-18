const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

mongoose
  .connect("mongodb://localhost:27017/dynamic", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB is running");
  })
  .catch((e) => {
    console.log(e);
  });

const schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
  },
});

schema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    try {
      user.password = await bcrypt.hash(user.password, 12);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

const Signup = mongoose.model("Signup", schema);

module.exports = Signup;
