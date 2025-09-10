import mongoose from "mongoose";

const MessegeSchema = mongoose.Schema({
name :{}
})

const Message = mongoose.model("Message" , MessegeSchema)
export default Message ;