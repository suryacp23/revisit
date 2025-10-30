import express from "express";
import {
  googleLogin,
  googleCallback,
  getCurrentUser,
} from "../controller/authController.js";
import { protect } from "../middleware/protect.js";

const router = express.Router();

router.get("/google", googleLogin);
router.get("/google/callback", googleCallback);
router.get("/me", protect, getCurrentUser);
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
});

export default router;
