import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

const healthCheck = asyncHandler(async (req, res) => {
    res.json(new ApiResponse(200, "Server is healthy"));

})

export {
    healthCheck,
}

