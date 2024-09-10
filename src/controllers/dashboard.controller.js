import mongoose from "mongoose";
import {Video} from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js";
import {Like} from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {

    const VideoStats = await Video.aggregate([
        {
            $group: {
                _id: "$owner",
                allVideos: {
                    $push: "$_id",
                },
                totalVideos: {
                    $sum: 1,
                },
                totalViews: {
                    $sum: "$views",
                },
            },
        },
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user?._id),
            },
        },
    ])

    if (!VideoStats) {
        throw new ApiError(404, "Error finding Channel");
    }

    const allLikes = (VideoStats.length !== 0) ? await Like.aggregate([
        {
            $match: {
                Video: {
                    $in: VideoStats[0].allVideos,
                }
            }
        },
        {
            $count: "allVideoLikes"
        },
    ]) : []

    if(!allLikes){
        throw new ApiError(500, "Error finding likes");
    }

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(req.user?._id),
            },
        },
        {
            $count: "subscriberCount",
        },
    ])

    if(!subscribers){
        throw new ApiError(500, "Error finding subscribers");
    }

    const response = {
        totalVideos: (VideoStats.length !== 0) ? VideoStats[0].totalVideos:0,
        totalViews: (VideoStats.length !== 0) ? VideoStats[0].totalViews:0,
        allVideoLikes: (allLikes.length !== 0) ? allLikes[0].allVideoLikes:0,
        totalSubscribers: (subscribers.length !== 0) ? subscribers[0].subscriberCount : 0,
    }

    return res
        .status(200)
        .json(new ApiResponse(200, response, "Channel stats fetched successfully"));

})

const getChannelVideos = asyncHandler(async (req, res) => {
    const {page = 1, limit = 10} = req.params

    const channelVideos = Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user?._id),
            },
        }
    ])

    const options = {
        page,
        limit,
    }

    const response = await channelVideos.paginateExec(options)

    if(!response){
        throw new ApiError(500, "Error Finding Channel Videos")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, response.docs, "Channel Videos fetched successfully"));
 
})

export {
    getChannelStats,
    getChannelVideos,
}