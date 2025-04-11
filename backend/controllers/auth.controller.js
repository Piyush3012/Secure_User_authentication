//different auth functions such as login register 

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'
import { userModel } from '../models/user.model.js';

export const registerUser=async(req,res)=>{
      try {
        const {userName,email,password}=req.body;

        if(!userName || !email || !password){
            return res.status(400).json({message:"All fields are required!!"});
        }

        //if the user exists
        const userExist=await userModel.findOne({email});//findone name method

        if(userExist){
            return res.status(400).json({message:"User already exists!!"});
        }

        
        //encrypting the password 
        const hashPassword=await bcrypt.hash(password,10);
        
        //storing it in the database 
        const user=new userModel({
            userName,
            email,
            password:hashPassword
        });
        //making it save in the database 
        await user.save();
        //token generartion for the authentication

        const token=jwt.sign({id: user._id},process.env.JWT_SECRET,{expiresIn:'7d'});
        //sending this token to the user using the cookie
        res.cookie('token',token,{
            httpOnly:true,
            secure:process.env.NODE_ENV==="production",
            sameSite:process.env.NODE_ENV==="production"?"none":"strict",
            maxAge:7*24*60*60*1000
        });

        res.status(200).json({message:"User Registered Successfully"})
        


      } 
      catch (error) {
        console.log("Register user error",error)
        res.status(500).json({message:"Server error"});
      }
}

export const login=async(req,res)=>{
    try {
        const {email,password}=req.body;

        if(!email || ! password){
            return res.status(400).json({message:"All fields are required!!"});
        }
        const user=await userModel.findOne({email});
        if(!user){
            return res.status(400).json({message:"Invalid email or password"});
        }
        //compare password
        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(400).json({message:"Invalid email or password"});
        }
        //generating token for the user
        const token=jwt.sign({id: user._id},process.env.JWT_SECRET,{expiresIn:'7d'});
        //sending this token to the user using the cookie
        res.cookie('token',token,{
            httpOnly:true,
            secure:process.env.NODE_ENV==="production",
            sameSite:process.env.NODE_ENV==="production"?"none":"strict",
            maxAge:7*24*60*60*1000
        });
        return res.status(200).json({
            message:"Login Successfull",
            user:{
                id:user._id,
                name:user.userName,
                email:user.email
            }
        })

    } catch (error) {
        console.log("Login Error!!",error)
        res.status(500).json({message:"Server Error!!"});
    }
}

export const logout=async(req,res)=>{
    try {
        res.clearCookie("token",{
            httpOnly:true,
            secure:process.env.NODE_ENV==="production",
            sameSite:process.env.NODE_ENV==="production"?"none":"strict",
            maxAge:7*24*60*60*1000
        });
        return res.status(200).json({message:"LogOut Successfully"});
    } catch (error) {
        console.log("Server Error!!",error);
        return res.status(500).json({message:"Server Error"});
    }
}