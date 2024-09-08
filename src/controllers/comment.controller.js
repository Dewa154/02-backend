import mongoose from "mongoose";
import {Comment} from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }
    const comments = await Comment.find({videoId})
    .sort({createdAt: -1})
    .limit(limit * 1)
    .skip((page - 1) * limit)
    res.json(new ApiResponse(200, "Comments fetched successfully", comments))
    const totalComments = await Comment.countDocuments({videoId})
    res.json(new ApiResponse(200, "Total comments", totalComments))
})

const addComment = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {comment} = req.body
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }
    const newComment = new Comment({videoId, comment, userId: req.user._id})
    await newComment.save()
    res.json(new ApiResponse(201, "Comment added successfully", newComment))
    
})

const updateComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const {comment} = req.body
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }
    const updatedComment = await Comment.findByIdAndUpdate(commentId, {comment}, {new: true})
    if (!updatedComment) {
        throw new ApiError(404, "Comment not found")
    }
    res.json(new ApiResponse(200, "Comment updated successfully", updatedComment))
})

const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }
    const deletedComment = await Comment.findByIdAndDelete(commentId)
    if (!deletedComment) {
        throw new ApiError(404, "Comment not found")
    }
    res.json(new ApiResponse(200, "Comment deleted successfully", deletedComment))
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment,
}