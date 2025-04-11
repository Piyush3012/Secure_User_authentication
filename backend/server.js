import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import connectDB from "./db/mongodb.js";
import authRouter from "./routes/auth.routes.js";
//configurations
const app=express();
const port=process.env.PORT ||4000

//database connection
await connectDB();


//middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({credentials:true}))

//routes
app.get('/',(req,res)=>{
   res.send("Api is working");
})
app.use('/api/auth',authRouter)


//start server 
app.listen(port,()=>{
    console.log(`server is running on the port:${port}`)
})

