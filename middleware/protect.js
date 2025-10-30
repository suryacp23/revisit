import jwt from "jsonwebtoken";
import User from "../model/User.js";
import dotenv from "dotenv";
dotenv.config();

const { JWT_SECRET } = process.env;

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res
        .status(401)
        .json({ message: "No token provided. Please login." });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      console.error("JWT verify error:", err.message);
      return res.status(401).json({ message: "Invalid or expired token." });
    }

    const user = await User.findById(decoded.id).select("-__v");
    if (!user) {
      return res
        .status(401)
        .json({ message: "User not found. Please login again." });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("protect middleware error:", err);
    // Always return here too
    return res.status(500).json({ message: "Internal server error" });
  }
};
