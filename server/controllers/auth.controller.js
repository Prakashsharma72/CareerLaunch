import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SAFE_ATTRS = { exclude: ["password"] };

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

/**
 * POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email and password are required" });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const created = await User.create({
      name,
      email,
      password: hashed,
      role: role || "student",
    });

    // Return full profile (no password)
    const user  = await User.findByPk(created.id, { attributes: SAFE_ATTRS });
    const token = signToken(user.id);

    return res.status(201).json({ user, token });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const userWithPw = await User.findOne({ where: { email } });
    if (!userWithPw) {
      return res.status(404).json({ message: "No account found with that email" });
    }

    const match = await bcrypt.compare(password, userWithPw.password);
    if (!match) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Return full profile (no password)
    const user  = await User.findByPk(userWithPw.id, { attributes: SAFE_ATTRS });
    const token = signToken(user.id);

    return res.status(200).json({ user, token });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
