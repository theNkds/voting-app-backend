import mongoose from "mongoose";

const voteSchema = new mongoose.Schema(
    {
        option: {
            type: String,
            required: true,
            unique: true,
        },
        votes: {
            type: Number,
            default: 0
        },
        createdBy: {
            type: mongoose.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true,
    }
);

const Vote = mongoose.models.Vote || mongoose.model("Vote", voteSchema);

export default Vote;