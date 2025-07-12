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

export const refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.cookies.refreshToken;
        if (!token) throw new ApiErrors(401, "Refresh token missing");

        jwt.verify(
            token,
            process.env.REFRESH_TOKEN_SECRET!,
            async (err: unknown, decoded: any) => {
                if (err instanceof jwt.TokenExpiredError) {
                    return next(new ApiErrors(403, "Refresh token expired"));
                }
                if (err) {
                    return next(new ApiErrors(403, "Invalid refresh token"));
                }

                const user = await UserModel.findById(decoded.userId);
                if (!user) throw new ApiErrors(404, "User not found");

                const accessToken = createAccessToken(user);
                return res.status(200).json({ accessToken });
            }
        );

    } catch (err) {
        next(err);
    }
};


export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, password } = req.body;

        const user = await UserModel.findOne({ email });
        if (!user) throw new ApiErrors(404, "User not found");

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new ApiErrors(401, "Invalid credentials");

        const accessToken = createAccessToken(user);
        const refreshToken = createRefreshToken(user);

        const isProd = process.env.NODE_ENV === "production";

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false, // <-- force false in dev
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/api/auth/refresh-token",
        });


        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            accessToken,
        });
    } catch (err) {
        next(err);
    }
};



export const getLoggedInUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = (req as any).user.userId;

        const user = await UserModel.findById(userId).select("-password");
        if (!user) throw new ApiErrors(404, "User not found");

        res.status(200).json({ message: "User fetched", user });
    } catch (err) {
        next(err);
    }
};


export const deleteUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.params.id;

        const user = await UserModel.findById(userId);
        if (!user) throw new ApiErrors(404, "User not found");

        user.isActive = false;
        await user.save();

        res.status(200).json({ message: "User deactivated successfully" });
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

export const logout = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            path: "/api/auth/refresh-token", // Same path used in login
        });

        res.status(200).json({ message: "Logout successful" });
    } catch (err) {
        next(err);
    }
};
