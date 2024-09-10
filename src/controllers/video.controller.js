import mongoose, {isValidObjectId} from "mongoose";
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = 'createdAt', sortType = '1', userId } = req.query
    
    if(!userId){
        throw new ApiError(400, "User ID is required")
    }

    const currentUserVideos = Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
            },
        },
    ])

    if(!currentUserVideos){
        throw new ApiError(404, "User does not have any videos")
    }

    const options = {
        page,
        limit,
        sort: {[sortBy]: Number(sortType)}
    }

    // console.log(currentUserVideos);

    const response = await currentUserVideos.paginateExec(options)

    if(!response){
        throw new ApiError(500, "something went wrong")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, response.docs, "Videos Posted by user"))

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    
    if([title, description].some((field) => field?.trim() === "")){
        throw new ApiError(400, "Title and Description are required")
    }

    const videoFilePath = req.files?.videoFile[0].videoFilePath

    if(!videoFilePath){
        throw new ApiError(400, "Video file is required")
    }

    let thumbnailPath;
    if(req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length>0){
        thumbnailPath = req.files?.thumbnail[0]?.path;
    }

    const videoFile = await uploadOnCloudinary(videoFilePath)
    const thumbnail = await uploadOnCloudinary(thumbnailPath)

    // console.log(videoFile);

    if(!videoFile){
        throw new ApiError(500, "Failed to upload video")
    }

    const video = await Video.create({
        videoFile: videoFile?.secure_url,
        thumbnail: thumbnail?.secure_url || "",
        title,
        description,
        duration: videoFile.duration,
        views: 0,
        isPublished: false,
        owner: req.user?._id
    })
    
    if(!video){
        throw new ApiError(500, "Something went wrong while uploading vidoe")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video Uploaded successfully"))

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    if(!videoId){
        throw new ApiError(400, "Video ID is required")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "Video not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video Found Successfully"))

})


const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const { title, description } = req.body
    
    const thumbnailPath = req.file?.path

    // console.log(thumbnailPath);

    if(title.trim() === "" && description.trim() === "" && thumbnailPath === ""){
        throw new ApiError(400, "Title, Description or Thumbnail are required")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "Video not found")
    }

    if(title?.trim() !== ""){
        video.title = title
    }

    if(description?.trim() !== ""){
        video.description = description
    }
    
    if(thumbnailPath !== undefined){
        const thumbnail = await uploadOnCloudinary(thumbnailPath)

        // console.log(thumbnail);
        
        if(!thumbnail){
            throw new ApiError(401, "Failed to upload thumbnail")
        }

        video.thumbnail = thumbnail?.secure_url
    }

    await video.save()

    return res
       .status(200)
       .json(new ApiResponse(200, video, "Video updated successfully"))
 
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "Video not found")
    }

    console.log(vidoe);

    const deletedVideo = await deleteFromCloudinary(video.videoFile, "video")

    console.log(deletedVideo);

    if(!deletedVideo){
        throw new ApiError(500, "Error deleting Video")
    }

    if(video.thumbnail !== ""){
        const deletedThumbnail = await deleteFromCloudinary(video.thumbnail, "thumbnail")

        if(!deletedThumbnail){
            throw new ApiError(500, "Error deleting Thumbnail")
        }
    }
    
    const deletedLikes = await Like.deleteMany({video:videoId})

    if(!deletedLikes){
        throw new ApiError(500, "Error deleting Likes on video")
    }

    const deletedCommnets = await Comment.deleteMany({video: videoId})

    if(!deletedCommnets){
        throw new ApiError(500, "Error deleting Comments on video")
    }

    const deleteObj = await video.findByIdAndDelete(videoId);

    console.log(deleteObj);
    
    if(!deleteObj){
        throw new ApiError(500, "Error deleting Video")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, deleteObj, "Video deleted successfully"))
    
})


const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    if(!videoId){
        throw new ApiError(400, "Video not found")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(501, "Couldn't toggle publish status")
    }

    video.isPublished = !video.isPublished

    await video.save()

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video status updated successfully"))
})


export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
 
}