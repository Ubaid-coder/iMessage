import mongoose from 'mongoose';
import dns from 'node:dns';

dns.setServers([
    '1.1.1.1',
    '8.8.8.8'
])

export async function connectDB() {
    try {
        const mongoURI = process.env.MONGO_URI;

        if(!mongoURI){
            throw new Error("MONGO_URI is required");
        }

        const con = await mongoose.connect(mongoURI);
        
        console.log("MongoDB connected", con.connection.host);
    } catch (error) {
        console.error("MongoDb connection error", error.message);
        process.exit(1);
    }
}