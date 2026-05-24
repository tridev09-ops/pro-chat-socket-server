import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    sender: {
        type: String,
        required: true,
    },
    receiver: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    }
}, {
    timestamps: true // This automatically adds createdAt and updatedAt fields
}
);

const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);

export default Message;