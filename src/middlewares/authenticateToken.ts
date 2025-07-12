import express from "express";
import jwt, {TokenExpiredError} from "jsonwebtoken";
import {ApiErrors} from "../errors/ApiErrors";

export const authenticateToken = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    try{
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if(!token){
            throw new ApiErrors(401, "Access token not found")
        }

        jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET!,
            (err, decoded) => {
                if (err) {
                    if (err instanceof TokenExpiredError){
                        return next(new ApiErrors(401, "Access token expired"))
                    }
                    else if (err instanceof jwt.JsonWebTokenError){
                        return next(new ApiErrors(401, "Invalid access token"))
                    }else{
                        return next(new ApiErrors(401, "Error verifying access token"))
                    }
                }
                if (!decoded || typeof decoded === "string") {
                    return next(new ApiErrors(500, "Access token Payload error"))
                }

                (req as any).user = decoded;
                next()
            }
        )
    }catch (err) {
        next(err)
    }
}