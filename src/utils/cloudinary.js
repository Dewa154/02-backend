import {v2 as cloudinary} from "cloudinary"
import { response } from "express";
import fs from "fs"


// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET   // Click 'View API Keys' above to copy your API secret
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        // file has been uploaded successfull

        // console.log("file is uploaded in cloudinary", response.url);
        fs.unlinkSync(localFilePath)
        return response;
        
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

const deleteFromCloudinary = async(cloudinaryPath, filetype="image") => {
    try {
        let public_id = ""
        for(let i = cloudinaryPath.length-1; i>=0; i--) // fixed the decrement operator
        {
            if(cloudinaryPath[i] != "/")
                public_id = cloudinaryPath[i] + public_id; // concatenate the characters
            else
                break;
        }

        // no need to reverse the string, we already built it in reverse order
        public_id = public_id.split('.').shift(); // remove the file extension

        // console.log("Image public_id: ", public_id);

        const response = await cloudinary.api.delete_resources(
            [{ public_id, type: 'upload', resource_type: filetype }]
        )
        
        // console.log(response);
        
        return response

    } catch (error) {
        console.log("Error", error);
        
    }
}


export {uploadOnCloudinary, deleteFromCloudinary}

