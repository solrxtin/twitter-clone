import { Router } from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { createPost, deletePost, commentOnPost, likeOrUnlikePost, getPosts, getPostsByUser, userLikedPosts, getFollowingPosts } from "../controllers/post.controllers.js";

const router = Router();

router.post("/", protectRoute, createPost)
router.post("/likes/:id", protectRoute, userLikedPosts)
router.post("/like/:id", protectRoute, likeOrUnlikePost)
router.post("/comment/:id", protectRoute, commentOnPost)
router.delete("/:id", protectRoute, deletePost)
// router.patch("/:id", protectRoute, updatePost)
router.get("/", protectRoute, getPosts)
router.get("/users/:id", protectRoute, getPostsByUser)
router.get("/following", protectRoute, getFollowingPosts);
export default router