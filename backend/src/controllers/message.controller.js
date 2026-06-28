import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { hasImageKitConfig, uploadChatMedia } from "../lib/imagekit.js"

export async function getUsersForSidebar(req, res) {
    try {
        const loggedInuserId = req.user._id;

        const filteredUsers = await User.find({ _id: { $ne: loggedInuserId } }).select("-clerkId");

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getConversationsForSidebar() {
    try {
        const loggedInUserId = req.user._id;

        const coversations = await Message.aggregate([
            { $match: { $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }] } },
            {
                $group: {
                    _id: { $cond: [{ $eq: ["$senderId", loggedInUserId] }, "$receiverId", "$senderId"] },
                    lastMessageAt: { $max: "$createdAt" },
                },
            },
            { $sort: { lastMessageAt: -1 } },
            { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
            { $replaceRoot: { newRoot: { $first: "$user" } } },
            { $project: { clerkId: 0 } }
        ]);

        res.status(200).json(coversations)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal server error" });
    }
}

export async function getMessages(req, res) {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ]
        }).sort({ createdAt: 1 });

        res.status(200).json(message);

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" })
    }
}

export async function sendMessage(params) {
    try {
        const { text } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrl;
        let videoUrl;

        if (req.file) {
            if (!hasImageKitConfig()) {
                return res.status(500).json({ message: "Media upload is not configured." })
            }
            const url = await uploadChatMedia(req.file);
            if(req.file.mimetype.startsWith("video/")) videoUrl = url;
            else imageUrl = url;
        }
        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
            video: videoUrl,
        });

        await newMessage.save();



        res.statsu(201).json(newMessage);
    } catch (error) {
        res.status(500).json({message:"Internal server error"});
    }
}