import mongoose, {isValidObjectId} from "mongoose";
import {User} from "../models/user.model.js"
import {Subscription} from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }
    const user = await User.findById(req.user.id)
    const channel = await Channel.findById(channelId)
    if (!user ||!channel) {
        throw new ApiError(404, "User or channel not found")
    }
    const subscription = await Subscription.findOne({
        user: user._id,
        channel: channel._id
    })
    if (subscription) {
        await Subscription.findByIdAndDelete(subscription._id)
        return res.json(new ApiResponse("Subscription cancelled"))
    }
    const newSubscription = new Subscription({
        user: user._id,
        channel: channel._id
    })
    await newSubscription.save()
    return res.json(new ApiResponse("Subscription created"))
})

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }
    const channel = await Channel.findById(channelId)
    if (!channel) {
        throw new ApiError(404, "Channel not found")
    }
    const subscribers = await Subscription.find({channel: channel._id})
    const userIds = subscribers.map(subscription => subscription.user)
    const users = await User.find({_id: {$in: userIds}})
    return res.json(new ApiResponse(users))

})

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { SubscriberId } = req.params
    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID")
    }
    const subscriber = await User.findById(subscriberId)
    if (!subscriber) {
        throw new ApiError(404, "Subscriber not found")
    }
    const subscriptions = await Subscription.find({user: subscriber._id})
    const channelIds = subscriptions.map(subscription => subscription.channel)
    const channels = await Channel.find({_id: {$in: channelIds}})
    return res.json(new ApiResponse(channels))

})

export { 
    toggleSubscription, 
    getUserChannelSubscribers, 
    getSubscribedChannels 
}