import passport from "passport";
import { Strategy as JWTStrategy } from "passport-jwt";
import User from "../models/User";

const options = {
  jwtFromRequest: (req) => req.cookies.token,
  secretOrKey: process.env.JWT_SECRET,
};

export const jwtStrategy = () => {
  passport.use(
    new JWTStrategy(options, async (userDecoded, done) => {
      try {
        
        console.log("JWT payload:", userDecoded);

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
