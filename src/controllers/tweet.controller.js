import mongoose, { isValidObjectId } from "mongoose";
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const tweet = new Tweet({
        content,
        user: user._id
    });
    await tweet.save();
    res.status(201).json(new ApiResponse(tweet));
    return;
})

const getUserTweets = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        throw new ApiError(400, "Invalid tweet ID");
    }
    const tweet = await Tweet.findById(id);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }
    res.status(200).json(new ApiResponse(tweet));
    return;
})

const updateTweet = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        throw new ApiError(400, "Invalid tweet ID");
    }
    const tweet = await Tweet.findByIdAndUpdate(id, req.body, { new: true });
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }
    res.status(200).json(new ApiResponse(tweet));
    return;
})

const deleteTweet = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        throw new ApiError(400, "Invalid tweet ID");
    }
    const tweet = await Tweet.findByIdAndDelete(id);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }
    res.status(204).json(new ApiResponse(null, "Tweet deleted successfully"));
    return;
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
}