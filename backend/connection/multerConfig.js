import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import cloudinary from './cloudinaryConfig.js'; // Adjust the import path as necessary

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'videos', // Optional: folder in which to store files
        resource_type: 'video', // Set resource type to video
        format: async (req, file) => 'mp4', // Optional: format of the files
    },
});

const upload = multer({ storage: storage });

export default upload;
