import express from 'express';
import bodyParser from 'body-parser';
import ConnectDB from "./db/DbConnection.js";
import userRoutes from "./route/Login.js";
import useSignin from "./route/Signin.js";
import useForget from './route/ForgetPass.js';
import useStore from "./route/StroreRoute.js"
import useVideo from "./route/videoRoute.js"
import env from 'dotenv';
import cors from "cors";

env.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

ConnectDB();

app.use(userRoutes);
app.use(useSignin);
app.use(useStore);
app.use(useForget);
app.use("/api" , useVideo);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});