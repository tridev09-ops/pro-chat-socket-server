import { Server } from "socket.io";
import connectDb from "./db/db.ts";
import Conversation from "./db/models/conversationModel.ts";
import Message from "./db/models/messageModel.ts";

const sendMessage = async (messageObj: {
    conversationId: string;
    sender: string;
    message: string;
}) => {
    if (!messageObj.conversationId || !messageObj.sender || !messageObj.message) {
        return;
    }

    await connectDb();

    const conversation = await Conversation.findById(messageObj.conversationId);
    if (!conversation) {
        return;
    }

    const receiverId = conversation.participants.find((p: string) => p.toString() !== messageObj.sender);
    if (!receiverId) {
        return;
    }

    const newMessage = await Message.create({
        sender: messageObj.sender,
        receiver: receiverId.toString(),
        message: messageObj.message,
    });

    await Conversation.findByIdAndUpdate(messageObj.conversationId, {
        $push: { messages: newMessage._id }
    });
};

const initSocket = (server: any) => {
    const io = new Server(server, {
        cors: {
            origin:  ["*"],
            methods: ["GET", "POST"]
        }
    });

    const userMap: { name: string; userId: string; socketId: string }[] = [];

    const broadcastOnline = () => {
        const onlineUserIds = userMap.map((u) => u.userId);
        io.emit("users-online", onlineUserIds);
    };

    io.on("connection", (socket) => {
        socket.on("set user", (data: { name: string; userId: string }) => {
            for (let i = userMap.length - 1; i >= 0; i--) {
                if (userMap[i].socketId === socket.id || userMap[i].name === data.name) {
                    userMap.splice(i, 1);
                }
            }
            userMap.push({
                name: data.name,
                userId: data.userId,
                socketId: socket.id,
            });

            console.log("User added:", data.name);
            broadcastOnline();
        });

        socket.on("chat message", (messageObj) => {
            let receiverSocketId: string | undefined;
            userMap.forEach((user) => {
                if (user.name === messageObj.receiverName) {
                    receiverSocketId = user.socketId;
                }
            });

            if (receiverSocketId) {
                io.to(receiverSocketId).emit("chat message", messageObj);
            }

            sendMessage({
                conversationId: messageObj.conversationId,
                sender: messageObj.sender,
                message: messageObj.message,
            }).catch((error) => {
                console.error("Error saving message:", error);
            });
        });

        socket.on("disconnect", () => {
            userMap.forEach((user, i) => {
                if (user.socketId === socket.id) {
                    userMap.splice(i, 1);
                }
            });
            broadcastOnline();
        });
    });
};

export default initSocket;
