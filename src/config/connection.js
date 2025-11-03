import mongoose from "mongoose";

async function connectDB(uri) {
    return await mongoose
        .connect(uri)
        .then(() => console.log("Database connected successfully"));
}

export default connectDB;