import User from "../models/user.model.js";
import bcrypt from 'bcrypt';
import genToken from "../utils/genToken.js";

const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
};

// Register a new user, hash their password, and issue an authentication cookie
export const resgiterUser = async (req, res) => {
    const { name, username, email, password } = req.body;

    try {
        if (!username || !name || !password || !email) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const usernameExists = await User.findOne({ username });
        if (usernameExists) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password length should be at least 6 characters' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name,
            username,
            email,
            password: hashedPassword
        });

        const token = genToken(newUser._id);

        res.cookie("token", token, cookieOptions);
        res.status(201).json({
            _id: newUser._id,
            name: newUser.name,
            username: newUser.username,
            email: newUser.email
        });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Authenticate user credentials by email or username and issue a session cookie
export const loginUser = async (req, res) => {
    try {
        const identifier = req.body.email || req.body.username;
        const { password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const user = await User.findOne({
            $or: [{ email: identifier }, { username: identifier }]
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" });
        }

        const token = genToken(user._id);

        res.cookie("token", token, cookieOptions);
        res.status(200).json({
            message: "Login successful",
            user: {
                _id: user._id,
                name: user.name,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Return profile details of the currently authenticated user
export const getUser = (req, res) => {
    res.status(200).json({
        _id: req.user._id,
        name: req.user.name,
        username: req.user.username,
        email: req.user.email
    });
};

// Clear the authentication session cookie
export const logoutUser = async (req, res) => {
    try {
        res.clearCookie("token", cookieOptions);
        return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Verify the current password and update with the newly provided hashed password
export const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Old and new passwords are required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Password length should be at least 6 characters" });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isOldPasswordValid) {
            return res.status(401).json({ message: "Old password is incorrect" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};