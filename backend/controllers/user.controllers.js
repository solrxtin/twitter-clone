import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const userProfile = async (req, res) => {
    try {
        const {username} = req.params;
        const user = await User.findOne({username}).select("-password");

        if (!user) {
            return res.status(404).json({success: true, message: "User not found"});
        }
        return res.status(200).json(user)
    } catch (error) {
        console.log("Error in userProfile controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
    }
}

export const followOrUnfollowUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { user } = req;
        const userToModify = await User.findById(id).select("-password");

        if (id === user?._id?.toString()) {
            return res.status(400).json({success: false, message: "Can't follow/unfollow yourself"})
        }

        if (!user || !userToModify) {
            return res.status(404).json({success: false, message: "User not found"})
        }

        const isFollowing = user.following.includes(id);

        if (isFollowing) {
            // Unfollow the user
			await User.findByIdAndUpdate(id, { $pull: { followers: user._id } });
			await User.findByIdAndUpdate(user._id, { $pull: { following: id } });

			res.status(201).json({ message: "User unfollowed successfully" });
		} else {
			// Follow the user
			await User.findByIdAndUpdate(id, { $push: { followers: user._id } });
			await User.findByIdAndUpdate(user._id, { $push: { following: id } });

            const newNotification = new Notification({
                from: user._id,
                to: id,
                type: "follow"
            })
            await newNotification.save();

            res.status(201).json({ message: "User followed successfully" });
        }

    } catch (error) {
        console.log("Error in followUnfollowUser: ", error.message);
		res.status(500).json({ error: error.message });
    }
}

export const suggested = async (req, res) => {
    try {
        const userId = req.user._id;

		const usersFollowedByMe = await User.findById(userId).select("following");

		const users = await User.aggregate([
			{
				$match: {
					_id: { $ne: userId },
				},
			},
			{ $sample: { size: 10 } },
		]);

		const filteredUsers = users.filter((user) => !usersFollowedByMe.following.includes(user._id));
		const suggestedUsers = filteredUsers.slice(0, 5);

		suggestedUsers.forEach((user) => (user.password = null));

		res.status(200).json(suggestedUsers);
    } catch (error) {
        console.log("Error in getSuggestedUsers: ", error.message);
		res.status(500).json({ error: error.message });
    }
}

export const updateUserProfile = async (req, res) => {
    const { currentPassword, newPassword, bio, link } = req.body;
	let { profileImg, coverImg } = req.body;

	let {user} = req //comes from the middleware

	try {
		if (!user) return res.status(404).json({ message: "User not found" });

		if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
			return res.status(400).json({ error: "Please provide both current password and new password" });
		}

		if (currentPassword && newPassword) {
			const isMatch = await bcrypt.compare(currentPassword, user.password);
			if (!isMatch) return res.status(400).json({ error: "Current password is incorrect" });
			if (newPassword.length < 6) {
				return res.status(400).json({ error: "Password must be at least 6 characters long" });
			}

			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(newPassword, salt);
		}

		if (profileImg) {
			if (user.profileImg) {
				// https://res.cloudinary.com/dyfqon1v6/image/upload/v1712997552/zmxorcxexpdbh8r0bkjb.png
				await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
			}

			const uploadedResponse = await cloudinary.uploader.upload(profileImg);
			profileImg = uploadedResponse.secure_url;
		}

		if (coverImg) {
			if (user.coverImg) {
				await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
			}

			const uploadedResponse = await cloudinary.uploader.upload(coverImg);
			coverImg = uploadedResponse.secure_url;
		}
		user.bio = bio || user.bio;
		user.link = link || user.link;
		user.profileImg = profileImg || user.profileImg;
		user.coverImg = coverImg || user.coverImg;

		user = await user.save();

		// password should be null in response
		user.password = null;

		return res.status(200).json(user);
	} catch (error) {
		console.log("Error in updateUser: ", error.message);
		res.status(500).json({ error: error.message });
	}
}