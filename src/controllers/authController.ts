import express, { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import { ApiErrors } from "../errors/ApiErrors";
import { UserModel } from "../models/User";


const createAccessToken = (user: any) => {
    return jwt.sign(
        { userId: user._id, role: user.role },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: "15m" }
    );
};

const createRefreshToken = (user: any) => {
    return jwt.sign(
        { userId: user._id },
        process.env.REFRESH_TOKEN_SECRET!,
        { expiresIn: "7d" }
    );
};

// ✅ Sign Up
export const signUp = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const {
            name,
            email,
            password,
            role,
            phone,
            address,
            dateOfBirth,
            nic,
        } = req.body;

        const profileImage = req.file?.path;

        // Check for duplicate email
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) throw new ApiErrors(400, "Email already registered");

        // Hash password
        const hashPassword = await bcrypt.hash(password, 10);

        const newUser = new UserModel({
            name,
            email,
            password: hashPassword,
            role,
            phone,
            address,
            dateOfBirth,
            nic,
            profileImage,
        });

        await newUser.save();

        const userResponse = {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            phone: newUser.phone,
            address: newUser.address,
            dateOfBirth: newUser.dateOfBirth,
            profileImage: newUser.profileImage,
            memberId: newUser.memberId,
            nic: newUser.nic,
            createdAt: newUser.createdAt,
        };

        res.status(201).json({
            message: "User registered successfully",
            user: userResponse,
        });
    } catch (err) {
        next(err);
    }
};

export const getAllUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const users = await UserModel.find({ isActive: true }).select("-password");
        res.status(200).json(users);
    } catch (err) {
        next(err);
    }
};
