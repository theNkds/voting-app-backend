import express from "express";
import dotenv from 'dotenv';
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/connection.js";
import { login, register, userDetails } from "./controllers/user.controller.js";
import { authenticate } from "./middleware/auth.middleware.js";
import { isAdmin } from "./middleware/adminAuth.middleware.js";
import Vote from "./models/vote.model.js";
import { error } from "console";
import User from "./models/user.model.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // should set on env
        methods: ["GET", "POST"],
        credentials: true,
    }
});

// middlewares
app.use(express.json());
app.use(cors({
    // origin: "http://localhost:5173",
    origin: "https://votting-app-nkds.vercel.app",
    credentials: true
}));


// post vote

// apis
app.post("/api/register", register);
app.post("/api/login", login);
app.get("/api/me", authenticate, userDetails);

// post votes
app.post("/api/votes", authenticate, isAdmin, async (req, res) => {
    try {
        const { option } = req.body;

        const vote = await Vote.create({
            option,
            createdBy: req.user?._id
        });

        io.emit("voteCreated", vote);
        res.status(201).json(vote);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// get votes
app.get("/api/votes", async (req, res) => {
    try {
        const votes = await Vote.find().populate("createdBy", "email");

        res.status(201).json(votes);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// check votes
app.post("/api/vote/:id", authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        if (req.user.votedFor)
            res.status(400).json({ error: "You have already voted" });

        const vote = await Vote.findByIdAndUpdate(
            id, 
            { $inc: { votes: 1 } }, 
            { new: true} 
        );

        const user = await User.findOneAndUpdate(
            req.user?._id,
            { votedFor: id },
            { new: true }
        );
        
        io.emit("voteUpdated", vote);

        res.status(201).json({
            vote,
            user
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// delete vote
app.delete("/api/vote/:id", authenticate, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        await Vote.findOneAndDelete({ _id: id });
        
        io.emit("voteDeleted", id);
    
        res.status(201).json({ message: "Vote deleted successfully", success: true });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

const uri = process.env.MONGODB_URI; 

io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("disconnect", () => {
        console.log("client disconnected");
    })
})

// start server.
const startServer = async () => {
    try {
        // connect to the database
        await connectDB(uri);

        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
        })
    } catch (error) {
        console.log(error);
    }
}

startServer();
