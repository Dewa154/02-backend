import mongoose, {isValidObjectId} from "mongoose";
import {Like} from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    const user = req.user;
    const like = await Like.findOne({ user: user._id, video: videoId });

    if (like) {
        await Like.findByIdAndDelete(like._id);
        video.likes--;
    } else {
        like = new Like({ user: user._id, video: videoId });
        await like.save();
        video.likes++;
    }
    await video.save();
    res.json(new ApiResponse(200, "Like toggled successfully", video));

 });

 const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }
    const user = req.user;
    const like = await Like.findOne({ user: user._id, comment: commentId });
    if (like) {
        await Like.findByIdAndDelete(like._id);
        comment.likes--;
    }
    else {
        like = new Like({ user: user._id, comment: commentId });
        await like.save();
        comment.likes++;
    }
    await comment.save();
    res.json(new ApiResponse(200, "Like toggled successfully", comment));
   
 })

 const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }
    const user = req.user;
    const like = await Like.findOne({ user: user._id, tweet: tweetId });
    if (like) {
        await Like.findByIdAndDelete(like._id);
        tweet.likes--;
    }
    else {
        like = new Like({ user: user._id, tweet: tweetId });
        await like.save();
        tweet.likes++;
    }
    await tweet.save();
    res.json(new ApiResponse(200, "Like toggled successfully", tweet));
 })

 const getLikedVideos = asyncHandler(async (req, res) => {
    const user = req.user;
    const likes = await Like.find({ user: user._id }).populate("video");
    res.json(new ApiResponse(200, "Liked videos fetched successfully", likes));
 })

 export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos,
 }