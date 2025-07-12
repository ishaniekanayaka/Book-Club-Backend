import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinary } from "../utils/cloudinary";

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async(req, file)=>{
        return{
            folder: "user-profiles",
            format: "png",
            transformation: [{width:300, height: 300, crop: "limit" }]
        };
    },
});

export const upload = multer({ storage });
