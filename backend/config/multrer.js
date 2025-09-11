import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import cloudinary from './cloudinary.js'; // Adjust the import path as necessary

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'videos', 
        resource_type: 'video',
        format: async (req, file) => 'mp4', 
    },
});

const upload = multer({ storage: storage });

export default upload;
