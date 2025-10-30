import axios from "axios";
import jwt from "jsonwebtoken";
import User from "../model/User.js";
import dotenv from "dotenv";

dotenv.config();

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  JWT_EXPIRES_IN,
  JWT_SECRET,
  FRONTEND_URL,
} = process.env;

// JWT token creation
const createToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Step 1: Redirect user to Google login page
export const googleLogin = (req, res) => {
  const url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_REDIRECT_URI}&scope=openid%20email%20profile`;
  res.redirect(url);
};

// Step 2: Handle Google's callback
export const googleCallback = async (req, res) => {
  const code = req.query.code;

  try {
    // Exchange code for access token
    const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    });

    const { access_token } = tokenRes.data;

    // Get user info from Google
    const userInfoRes = await axios.get(
      "https://www.googleapis.com/oauth2/v1/userinfo?alt=json",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    const { id, email, name, picture } = userInfoRes.data;

    // Find or create user in DB
    let user = await User.findOne({ googleId: id });
    if (!user) {
      user = await User.create({ googleId: id, email, name, picture });
    }

    // Create JWT and set as HttpOnly cookie
    const token = createToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // Set to true if using HTTPS in production
      sameSite: "Lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // ✅ Redirect to frontend
    return res.redirect(FRONTEND_URL);
  } catch (error) {
    console.error("OAuth error:", error.response?.data || error);
    return res.redirect(`${FRONTEND_URL}/login`);
  }
};

// Step 3: Get currently logged in user from cookie
export const getCurrentUser = async (req, res) => {
  try {
    console.log(req.cookies);
    const token = req.cookies.token;
    if (!token) {
      // ❌ Don't redirect directly
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-__v");

    if (!user) return res.status(401).json({ error: "User not found" });

    res.json({ user });
  } catch (err) {
    console.error("User fetch error:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
