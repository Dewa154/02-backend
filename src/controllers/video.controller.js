import mongoose, {isValidObjectId} from "mongoose";
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.body
    //
    const videos = await Video.find({
        title: { $regex: query, $options: "i" },
        user: userId? isValidObjectId(userId)? userId : new mongoose.Types.ObjectId(userId) : null
    })
    const totalVideos = videos.length
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedVideos = videos.slice(startIndex, endIndex)
    res.json(new ApiResponse(200, "Videos retrieved successfully", { videos: paginatedVideos, totalVideos }))
    
})

const publishAllVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    //
    const { userId } = req.user
    const video = await Video.create({ title, description, user: userId })
    if (!video) {
        throw new ApiError(500, "Failed to publish video")
    }
    res.json(new ApiResponse(201, "Video published successfully", video))


})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }
    const video = await Video.findById(videoId).populate("user")
    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    res.json(new ApiResponse(200, "Video retrieved successfully", video))


})


const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body
    //
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }
    const video = await Video.findByIdAndUpdate(videoId, { title, description }, { new: true })
    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    res.json(new ApiResponse(200, "Video updated successfully", video))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }
    const video = await Video.findByIdAndDelete(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    res.json(new ApiResponse(200, "Video deleted successfully", video))
})


const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }
    const video = await Video.findByIdAndUpdate(videoId, { isPublished:!req.body.isPublished }, { new: true })
    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    res.json(new ApiResponse(200, "Video status updated successfully", video))
})


export {
    getAllVideos,
    publishAllVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
 
}