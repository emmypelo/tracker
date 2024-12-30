import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const findUser = async (req) => {
  try {
    const token = req.cookies["TrackIt"];
    const decodedUser = jwt.verify(token, process.env.JWT_SECRET);
    const userFound = await User.findById(decodedUser.id);

    if (!userFound) {
      throw new Error("Not a valid user");
    }

    return userFound;
  } catch (error) {
    throw new Error("Authentication failed");
  }
};
