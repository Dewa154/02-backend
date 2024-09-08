import mongoose, {isValidObjectId} from "mongoose";
import {Playlist} from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const playlist = new Playlist({
        title,
        description,
        user: user._id
    });
    await playlist.save();
    res.status(201).json(new ApiResponse(playlist));
 });

 const getUserPlaylists = asyncHandler(async (req, res) => {
    const {UserId} = req.params
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const playlists = await Playlist.find({user: userId}).populate("user");
    res.json(new ApiResponse(200, "Playlists retrieved successfully", playlists));

 })

 const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }
    const playlist = await Playlist.findById(playlistId).populate("user");
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    res.json(new ApiResponse(200, "Playlist retrieved successfully", playlist));

 })

 const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    if (!isValidObjectId(playlistId) ||!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid IDs");
    }
    const playlist = await Playlist.findByIdAndUpdate(playlistId, { $push: { videos: videoId } }, { new: true });
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    res.json(new ApiResponse(200, "Video added to playlist successfully", playlist));

 })

 const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    if (!isValidObjectId(playlistId) ||!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid IDs");
    }
    const playlist = await Playlist.findByIdAndUpdate(playlistId, { $pull: { videos: videoId } }, { new: true });
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    res.json(new ApiResponse(200, "Video removed from playlist successfully", playlist));
 })

 const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const {name, description} = req.body
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }
    const playlist = await Playlist.findByIdAndDelete(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    res.json(new ApiResponse(200, "Playlist deleted successfully", playlist));
   
 })

 const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { title, description } = req.body
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }
    const playlist = await Playlist.findByIdAndUpdate(playlistId, { title, description }, { new: true });
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    res.json(new ApiResponse(200, "Playlist updated successfully", playlist));
 })

 export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,
 }
