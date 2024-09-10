import mongoose, { isValidObjectId } from "mongoose";
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
    const {content = ""} = req.body

    if(!content){
        throw new ApiError(400, "Content is required");
    }

    const tweet = await Tweet.create({
        owner: req.user?._id,
        content
    })

    if(!tweet){
        throw new ApiError(500, "Error creating tweet");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, tweet, "Tweet Created Successfully"));
})

const getUserTweets = asyncHandler(async (req, res) => {
    const {userId} = req.params

    if(!userId || userId === ":userId"){
        throw new ApiError(400, "Valid userId required");
    }

    // console.log(userId);

    const usertweets = await Tweet.find({owner: userId})
    
    // console.log(usertweets);
    
    if(!usertweets){
        throw new ApiError(404, "No tweets found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, usertweets, "Fetched user tweets successfully"));

})

const updateTweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.params

    const {content = ""} = req.body

    if(!tweetId || tweetId === ":tweetId"){
        throw new ApiError(400, "Valid tweetId required");
    }

    if(!content){
        throw new ApiError(400, "Content is required");
    }

    const tweet = await Tweet.findByIdAndUpdate(tweetId, {content})

    if(!tweet){
        throw new ApiError(500, "Error in updating tweet");
    }

    return res
       .status(200)
       .json(new ApiResponse(200, tweet, "Tweet updated successfully"));
 
})

const deleteTweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.params

    if(!tweetId || tweetId === ":tweetId"){
        throw new ApiError(400, "Valid tweetId required");
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId)

    if(!deletedTweet){
        throw new ApiError(404, "Error in deleting tweet");
    }

    return res  
        .status(200)
        .json(new ApiResponse(200, deletedTweet, "Tweet deleted successfully"))

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
}