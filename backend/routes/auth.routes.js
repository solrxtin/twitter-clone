import express from "express";
import { signout, signup, login, auth } from "../controllers/auth.controllers.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/signup", signup);

router.get("/signout", signout);
router.get("/authenticated", protectRoute, auth);

router.post("/login", login);

export default router;

