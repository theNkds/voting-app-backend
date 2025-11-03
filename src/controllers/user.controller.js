import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
    const { username, email, password } = req.body;
    if(!username || !email || !password)
        return res.status(400).json({ error: "All fields are required" });

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser)
            return res.status(400).json({ error: "Email already in use" });

        const user = await User.create({
            username,
            email,
            password
        });

        const token = jwt.sign({ id: user?._id }, process.env.JWT_SECRET, {
            expiresIn: "1d"
        });
        return res.status(201).json({
            token,
            user
        });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;

    if(!email || !password)
        res.status(400).json({ error: "All fields are required" });

    try {
        const user = await User.findOne({ email });

        if (!user)
            return res.status(400).json({ error: "User not found" });

        const isMatch = await user.comparePassword(password);

        if(!isMatch)
            return res.status(400).json({ error: "wrong password" });
        
        const token = jwt.sign({ id: user?._id }, process.env.JWT_SECRET, {
            expiresIn: "1d"
        });

        res.status(201).json({
            token,
            user
        });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

export const userDetails = async (req, res) => {
    try {
        const user = req.user;
        res.status(201).json(user);
    } catch (error) {
        
    }
}