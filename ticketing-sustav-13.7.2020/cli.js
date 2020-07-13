const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { user } = require("./schema");

const User = mongoose.model("User", user);
const prompt = require("prompt");

prompt.start();

console.log("Dobrodošli u CLI za kreiranje korisnika! \n");

mongoose
  .connect(
    "mongodb://localhost:27017/ticketing-sustav",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    console.log("DB Spojen!");
    prompt.get(["username", "password", "role"], function (err, result) {
      if (err) {
        return onErr(err);
      }

      const username = result.username;
      const password = result.password;
      const role = result.role.toLowerCase(); // can be user or admin

      const newUser = new User({
        username,
        password,
        role,
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          console.log("Hashing password...");
          if (err) {
            console.log("error");
            throw err;
          }
          newUser.password = hash;
          console.log("Password hash is:", hash);
          newUser
            .save()
            .then((user) => {
              console.log("Saving user to DB...");
              console.log("User created!", user);
              process.exit();
            })
            .catch((err) => console.error(err));
        });
      });
    });
  })
  .catch(() => console.error.bind(console, "Greška pri spajanju na DB:"));

function onErr(err) {
  console.error(err);
  return 1;
}
