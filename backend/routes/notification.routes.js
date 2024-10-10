import { Router } from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { getNotifications, deleteNotifications } from "../controllers/notification.controllers.js";

const router = Router();

router.get("/", protectRoute, getNotifications);
router.get("/:id", protectRoute, deleteNotifications);

export default router