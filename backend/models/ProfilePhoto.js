import mongoose from "mongoose";
import User from "./UserSchema";

const userProfileSchema = new mongoose.Schema(
  {
    username: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref : User ,
    },
    bio: {
      type: String,
      default: '',
    },
    instaLink: {
      type: String,
      default: '',
    },
    websiteLink: {
      type: String,
      default: '',
    },
    coverPicture: {
      type: String,
      default: '/path/to/default/cover-picture.jpg',
    },
    profilePicture: {
      type: String, 
      default: '/path/to/default/profile-picture.jpg',
    },
  },
  {
    timestamps: true, 
  }
);

const UserProfile = mongoose.model('UserProfile', userProfileSchema);
module.exports = UserProfile;
