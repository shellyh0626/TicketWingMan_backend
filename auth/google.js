const router = require("express").Router();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { User } = require("../db/models");
const dotenv = require("dotenv").config();

passport.use(
  new GoogleStrategy(
    {
      clientID: dotenv.GOOGLE_CLIENT_ID,
      clientSecret: dotenv.GOOGLE_CLIENT_SECRET,
      callbackURL: dotenv.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails[0].value;
        const imgUrl = profile.photos[0].value;
        const firstName = profile.name.givenName;
        const lastName = profile.name.familyName;
        const fullName = profile.displayName;

        const [user] = await User.findOrCreate({
          where: { googleId },
          defaults: { email, imgUrl, firstName, lastName, fullName },
        });

        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);

router.get(
  "/",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:3000/login",
  }),
  (req, res) => {
    res.redirect("http://localhost:3000");
  }
);

module.exports = router;