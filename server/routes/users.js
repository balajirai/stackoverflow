import express from "express";

import { login, signup, forgotPassword, getResetPassword, postResetPassword } from "../controllers/auth.js";
import { getAllUsers, updateProfile } from "../controllers/users.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.get("/forgot-password/:id/:token", getResetPassword);
router.post("/forgot-password/:id/:token", postResetPassword);

router.get("/getAllUsers", getAllUsers);
router.patch("/update/:id", auth, updateProfile);

export default router;
