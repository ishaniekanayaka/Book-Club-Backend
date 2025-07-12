import {NextFunction, Response, Request} from "express";
import mongoose from "mongoose";
import {ApiErrors} from "../errors/ApiErrors";

export const errorHandler = (
    error : any,
    req : Request,
    res : Response,
    next : NextFunction
)=>{
    if (error instanceof  mongoose.Error){
        res.status(400).json({message: error.message})
        return
    }


    if(error instanceof ApiErrors){
        res.status(error.status).json({message : error.message})
        return;
    }
    res.status(500).json({message : "Internal Server Error"})
}