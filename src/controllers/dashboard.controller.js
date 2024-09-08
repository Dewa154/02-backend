import mongoose from "mongoose";
import {Video} from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js";
import {Like} from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
    const { channelId } = req.body;
    const videoCount = await Video.countDocuments({ channel: channelId });
    const subscriptionCount = await Subscription.countDocuments({ subscriber: channelId });
    const likeCount = await Like.countDocuments({ user: channelId });
    res.json(new ApiResponse(200, "Channel statistics fetched successfully", { videoCount, subscriptionCount, likeCount }));

})

const getChannelVideos = asyncHandler(async (req, res) => {
    const { channelId, page = 1, limit = 10 } = req.query;
    const startIndex = (page - 1) * limit;
    const videos = await Video.find({ channel: channelId })
       .sort({ createdAt: -1 })
       .limit(limit)
       .skip(startIndex)
       .populate("user");
    res.json(new ApiResponse(200, "Channel videos fetched successfully", videos));
 
})

export {
    getChannelStats,
    getChannelVideos,
}