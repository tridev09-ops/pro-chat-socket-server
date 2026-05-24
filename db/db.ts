import mongoose from 'mongoose'

// Connect to MongoDB
export default async function connectDb() {
    if (mongoose.connection.readyState >= 1) return;

    const uri = process.env.MONGO_DB_URI;
    try {
        await mongoose.connect(uri!);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Could not connect to MongoDB', err);
        throw err;
    }
}