import mongoose from "mongoose";


const connectDB = async() => {
    try {
        mongoose.connection.on('connected', () => console.log("✅ Database Connected"))
        mongoose.connection.on('error', (err) => console.error("❌ MongoDB connection error:", err.message))
        mongoose.connection.on('disconnected', () => console.log("⚠️  MongoDB disconnected - will retry..."))
        mongoose.connection.on('reconnected', () => console.log("🔄 MongoDB reconnected successfully"))

        mongoose.set('bufferTimeoutMS', 45000);
        mongoose.set('bufferCommands', true);

        console.log("🔗 Connecting to MongoDB...")
       await mongoose.connect(process.env.MONGODB_URI, { 
            serverSelectionTimeoutMS: 30000,
            connectTimeoutMS: 30000,
            socketTimeoutMS: 60000,
            heartbeatFrequencyMS: 10000,
            maxPoolSize: 10,
        })
    } catch (error) {
        console.error("❌ DB Connection Failed:", error.message);
        console.error("\n🛠️  Troubleshooting steps:");
        console.error("   1. Check your internet connection");
        console.error("   2. Verify MongoDB Atlas IP whitelist includes your current IP");
        console.error("   3. Confirm MONGODB_URI in .env is correct");
        console.error("   4. Try restarting MongoDB service if running locally");
        process.exit(1);
    }

};
export default connectDB;