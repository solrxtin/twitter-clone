import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { userProfile, followOrUnfollowUser, suggested, updateUserProfile } from "../controllers/user.controllers.js";

const router = express.Router();

router.get("/profile/:username", protectRoute, userProfile);
router.get("/suggested", protectRoute, suggested);
router.post("/follow/:id", protectRoute, followOrUnfollowUser)
router.post("/updateProfile/:id", protectRoute, updateUserProfile)

export default router;