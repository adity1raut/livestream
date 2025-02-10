import express from 'express';
import bodyParser from 'body-parser';
import ConnectDB from "./db/DbConnection.js";
import userRoutes from "./route/Login.js";
import router1 from "./route/Signin.js";
import router from './route/ForgetPass.js';
import cors from "cors";
import router4 from "./route/StroreRoute.js"
import env from 'dotenv';
import videoroute from "./route/videoRoute.js"

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
app.use(router1);
app.use(router);
app.use(router4);
app.use("/api" , videoroute);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});