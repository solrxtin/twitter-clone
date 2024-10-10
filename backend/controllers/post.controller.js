import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

import { v2 as cloudinary } from "cloudinary";



export const createPost = async (req, res) => {
    try {
        const {user} = req;
        const {text} = req.body
        let { img } = req.body

        if (!user) {
            return res.status(404).json({success: false, message: "user not found"});
        }

        if (!text && !img) return res.status(400).json({succes: false, message: "Provide text or image"})

        if (img) {
            const cloudinaryResp = await cloudinary.uploader.upload(img);
            img = cloudinaryResp.secure_url;
        }

        const newPost = new Post({
            user: user._id,
            text,
            img
        });

        await newPost.save();
        res.status(201).json(newPost);
        
    } catch (error) {
        console.log(`Error in createPost controller: ${error.message}`);
        res.status(500).json({success: false, message: "Internal Server Error"});
    }
}

export const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { user } = req;
        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({success: false, message: "Post not found"})
        }

        if (user.id != post.user) {
            return res.status(401).json({success: false, message: "unauthorized"})
        }

        if (post.img) {
            await cloudinary.uploader.destroy(post.img.split("/").pop().split(".")[0]);
        }

        await Post.findByIdAndDelete(id);
        res.status(200).json({success: false, message: "Post deleted successfully!"})
    } catch (error) {
        console.log(`Error in deletePost controller: ${error.message}`);
        res.status(500).json({success: false, message: "Internal Server Error"});
    }
}

export const commentOnPost = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;
        let { user } = req;
        user = user.id;

        if (!text) {
            return res.status(400).json({success: false, message: "Please send a comment"})
        }

        let post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({success: false, message: "Post not found"})
        }

        post.comments.push({text, user});
        await post.save()

        res.status(200).json(post);

    } catch (error) {
        console.log(`Error in commentOnPost controller: ${error.message}`);
        res.status(500).json({success: false, message: "Internal Server Error"});
    }
}

export const likeOrUnlikePost = async (req, res) => {
    try {
        const { user } = req;
        const { id } = req.params;

        if (!user && !id) {
            return res.status(400).json({success: false, message: "Bad request"})
        }

        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({success: false, message: "Post not found"})
        }

        const isLiked = post.likes.includes(user._id)

        if (isLiked) {
            // const likes = post.likes.filter(post => post.likes.user.toString() !== user._id.toString())
            // post.likes = likes
            // await post.save()
            await Post.updateOne({_id: id}, {$pull: {likes: user._id}});
            await User.updateOne({ _id: user._id }, { $pull: { likedPosts: id } });
            res.status(200).json({success: true, message: "Post Unliked"});
        } else {
            post.likes.push(user._id);
            await post.save();
            await User.updateOne({ _id: user._id }, { $push: { likedPosts: id } });

            const notification = new Notification({
                from: user._id,
                to: post.user,
                type: "like"
            });

            await notification.save();

            res.status(200).json({success: true, message: "Post liked successfully"});
        }

    } catch (error) {
        console.log(`Error in likeOrUnlikePost controller: ${error.message}`);
        res.status(500).json({success: false, message: "Internal Server Error"});
    }
}

export const getPosts = async (req, res) => {
	try {
		const posts = await Post.find()
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		if (posts.length === 0) {
			return res.status(200).json([]);
		}

		res.status(200).json(posts);
	} catch (error) {
		console.log("Error in getAllPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getPostsByUser = async (req, res) => {
    const {id: userId} = req.params;
    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).json({success: false, message: "User not found"})
    }
	try {
		const posts = await Post.find({user: userId})
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		if (posts.length === 0) {
			return res.status(200).json([]);
		}

		res.status(200).json(posts);
	} catch (error) {
		console.log("Error in getAllPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const userLikedPosts = async(req, res) => {
    try {
        const {id: userId} = req.params;
        const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "User not found" });

		const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		res.status(200).json(likedPosts);
    } catch (error) {
        console.log("Error in userLikedPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
    }
}


export const getFollowingPosts = async (req, res) => {
	try {
		const userId = req.user._id;
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "User not found" });

		const following = user.following;

		const feedPosts = await Post.find({ user: { $in: following } })
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		res.status(200).json(feedPosts);
	} catch (error) {
		console.log("Error in getFollowingPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};
