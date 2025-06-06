import dotenv from "dotenv";
dotenv.config();
import passport from "passport";
import bcrypt from "bcryptjs";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";
import User from "../models/User.js";

export const localStrategy = () => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
      },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email });
          if (!user) {
            return done(null, false, { message: "Invalid email or password" });
          }

          const match = await bcrypt.compare(password, user.password);
          if (match) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Invalid email or password" });
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );
};

const options = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    (req) => {
      let token = null;
      if (req && req.cookies) {
        token = req.cookies["TrackIt"];
      }
      return token;
    },
  ]),
  secretOrKey: process.env.JWT_SECRET,
};

export const jwtStrategy = () => {
  passport.use(
    new JWTStrategy(options, async (userDecoded, done) => {
      try {
        // Debug what's actually in the token
        console.log("JWT payload:", userDecoded);

        // Fix: Use 'id' instead of 'sub' since that's what you're signing with
        const user = await User.findById(userDecoded.id);
        if (user) {
          return done(null, user);
        } else {
          console.log("No user found with ID:", userDecoded.id);
          return done(null, false);
        }
      } catch (error) {
        console.error("JWT strategy error:", error);
        return done(error, false);
      }
    })
  );
};
