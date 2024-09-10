import mongoose, {isValidObjectId} from "mongoose";
import {User} from "../models/user.model.js"
import {Subscription} from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    
    if (!channelId){
        throw new ApiError(400, "Channel ID is required")
    }

    const user = req.user

    if(channelId === user?._id?.toString()){
        throw new ApiError(400, "Cannot subscribe to your own channel")
    }

    const Subscribed = await Subscription.find({subscriber: user, channel: channelId})

    if(Subscribed.length == 0){

        const Subscriber = await Subscription.create({
            subscriber: user?._id,
            channel: channelId
        })

        if(!Subscriber){
            throw new ApiError(501, "Internal Server Error")
        }

        return res
            .status(200)
            .json(new ApiResponse(200, Subscriber, "Subscription Added"))
    }

    const deleted = await Subscription.deleteOne({subscriber: user, channel: channelId})

    if(!deleted){
        throw new ApiError(500, "Error in deleting subscription")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Subscription Remove Successfully"))

})

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    const {page = 1, limit = 10} = req.query

    if(!channelId){
        throw new ApiError(400, "Channel ID is required")
    }

    const subscribers = Subscription.aggregate([
        {
            $match: 
            {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        }
    ])

    const options = {
        page,
        limit
    }

    const response = await subscribers.paginateExec(options)

    if(!response){
        throw new ApiError(400, "Channel not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, response.docs, "Subscribers for the channel"))

})

const getSubscribedChannels = asyncHandler(async (req, res) => {
    
    const {page=1, limit=10} = req.body

    const options = {
        page,
        limit
    }

    const channels = Subscription.aggregate([
        {
            $match: 
            {
                subscriber: new mongoose.Types.ObjectId(req.user?._id),
            }
        }
    ])

    const response = await channels.paginateExec(options)

    if(!response){
        throw new ApiError(500, "Something went wrong")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, response.docs, "Subscribed Channels"))

})

export { 
    toggleSubscription, 
    getUserChannelSubscribers, 
    getSubscribedChannels 
}