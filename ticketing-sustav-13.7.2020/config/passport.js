const LocalStrat = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

const { User } = require("../schema");

module.exports = function (passport) {
  passport.use(
    new LocalStrat(
      { usernameField: "username" },
      async (username, password, done) => {
        console.log("passport data:", username, password, done);
        try {
          const user = await User.findOne({ username: username });
          if (!user) {
            throw done(null, false, { message: "Korisnik ne postoji!" });
          }

          const match = await bcrypt.compare(password, user.password);

          if (match) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Lozinka neispravna!" });
          }
        } catch (err) {
          console.error(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });
};
