import express from 'express';
import bodyParser from 'body-parser';
import ConnectDB from "./db/ConnectDB.js";
import router from './mainRouter/router.js';
import cookieParser from 'cookie-parser';
import env from 'dotenv';
import cors from "cors";

env.config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173/',
  credentials: true 
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));


ConnectDB();

app.use(router)


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});