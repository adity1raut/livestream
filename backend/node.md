import express from "express" ;
import dotenv from "dotenv" ;
import cors from "cors" ;

dotenv.config() ;

const PORT = 3000  || process.env.PORT ;
const app = express() ;

//Middleware

app.use(bodyParser.json());
app.use(cors()) ;

// app.get("/api/jocks" , (req , res)=>{
//     const jocks = [
//         {
//             id : 1 ,
//             heading : "Chota Ustad" ,
//             content : "Manjil ko bhulakar jiya to kya jiya...."
//         },
//         {
//             id : 2 ,
//             heading : "Booyah!" ,
//             content : "Hellow bhai dar rah hai kya....."
//         } ,
//         {
//             id : 3 ,
//             heading : "Hole lobby" ,
//             content : "Khan khach booyah!"
//         },
//         {
//             id : 4 ,
//             heading : "Sultan" ,
//             content :"Phon baja paise wala seen nahi hai wrong number..."
//         },
//         {
//             id : 5 ,
//             heading : "Pushpa" ,
//             content : "zhukega nahi sala...."
//         }
//     ]
//     res.send(jocks) ;
// })
app.listen(PORT , ()=>{
    console.log(`Your server will run http://localhost:${PORT}`)  
})