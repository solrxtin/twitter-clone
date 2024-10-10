import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";

export const login = async (req, res) => {
    try {
		const {username, password} = req.body;

		const user = await User.findOne({username}); // returns a single document
		const isValidPassword = bcrypt.compare(password, user?.password || "");

		if (!isValidPassword || !user) {
			return res.status(400).json({success: false, message: "Invalid Credentials"})
		}

		generateTokenAndSetCookie(user?._id, res);
		res.status(200).json({
			_id: user._id,
			fullName: user.fullName,
			username: user.username,
			email: user.email,
			followers: user.followers,
			following: user.following,
			profileImg: user.profileImg,
			coverImg: user.coverImg,
		});
	} catch (error) {
		console.error(`Error: ${error.message}`);
		res.status(500).json({success: false, message: "Server error"});
	}
	
};

export const signout = async (req, res) => {
    try {
		res.cookie("jwt", "", {maxAge: 0});
		res.status(200).json({success: true, message: "logged out successfully"})
	} catch (error) {
		console.error(`Error: ${error.message}`)
		res.status(500).json({success: false, message: "Server error"})
	}
};

export const signup = async (req, res) => {
    try {
		const { fullName, username, email, password } = req.body;

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({ error: "Invalid email format" });
		}

		const existingUser = await User.findOne({ username });
		if (existingUser) {
			return res.status(400).json({ error: "Username is already taken" });
		}

		const existingEmail = await User.findOne({ email });
		if (existingEmail) {
			return res.status(400).json({ error: "Email is already taken" });
		}

		if (password.length < 6) {
			return res.status(400).json({ error: "Password must be at least 6 characters long" });
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const user = new User({
			fullName,
			username,
			email,
			password: hashedPassword,
		});

		if (user) {
			generateTokenAndSetCookie(user._id, res);
			await user.save();

			res.status(201).json({
				_id: user._id,
				fullName: user.fullName,
				username: user.username,
				email: user.email,
				followers: user.followers,
				following: user.following,
				profileImg: user.profileImg,
				coverImg: user.coverImg,
			});
		} else {
			res.status(400).json({ error: "Invalid user data" });
		}
	} catch (error) {
		console.log("Error in signup controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const auth = async (req, res) => {
	try {
		const {user} = req
		return res.status(200).json({user});
	} catch (error) {
		console.log("Error in getMe controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
}