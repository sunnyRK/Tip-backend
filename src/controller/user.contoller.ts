import { Request, Response } from "express";
import { User } from "../models/user.model";
import mongoose, { Types } from "mongoose";

export const createUser = async (req: Request, res: Response) => {
    try {
        const { id, createdAt, linkedAccounts, wallet, smartAccountAddress } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ did: id });

        if (existingUser) {
            return res.status(200).json({ message: 'User already exists', alreadyReg: true });
        }

        // Determine user image, name, and bio with default values
        let image = "";
        let name = "";
        let bio = "";

        const farcasterAccount = linkedAccounts.find((account: any) => account.type === 'farcaster');

        if (farcasterAccount) {
            image = farcasterAccount.pfp || "";
            name = farcasterAccount.displayName || "";
            bio = farcasterAccount.bio || "";
        }

        const newUser = new User({
            did: id,
            createdAt,
            linkedAccounts,
            wallet,
            image,
            name,
            bio,
            smartAccountAddress
        });

        const savedUser = await newUser.save();
        res.status(201).json({ savedUser, alreadyReg: false });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create user', message: error });
    }
};

export const getUser = async (req: any, res: Response) => {
    try {
        const user = req.user;
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const getRandomUsers = async (req: Request, res: Response) => {
    try {
        const userId: any = req.query.user;

        let matchStage = {};
        if (userId) {
            matchStage = { _id: { $ne: new mongoose.Types.ObjectId(userId) } };
        }

        const randomUsers = await User.aggregate([
            { $match: matchStage },   // Exclude the specified user if userId is provided
            { $sample: { size: 5 } }  // Sample 5 random users
        ]);

        res.json(randomUsers);
    } catch (error) {
        console.error('Error fetching random users:', error);
        res.status(500).json({ message: 'Error fetching random users', error });
    }
};

export const toggleFollowUser = async (req: any, res: Response) => {
    const currentUserId = req.user.id;
    const { targetUserId } = req.body;

    try {
        // Find the current user and the target user
        const currentUser = await User.findById(currentUserId);
        const targetUser = await User.findById(targetUserId);

        if (!currentUser || !targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isFollowing = currentUser.following.includes(targetUserId);

        if (isFollowing) {
            // Unfollow: Remove the target user ID from the current user's following array
            currentUser.following.pull(targetUserId);
            // Remove the current user ID from the target user's followers array
            targetUser.followers.pull(currentUserId);
        } else {
            // Follow: Add the target user ID to the current user's following array
            currentUser.following.push(targetUserId);
            // Add the current user ID to the target user's followers array
            targetUser.followers.push(currentUserId);
        }

        await currentUser.save();
        await targetUser.save();

        res.status(200).json({
            message: isFollowing ? 'Unfollowed user successfully' : 'Followed user successfully',
            isFollowing: !isFollowing,
        });
    } catch (error) {
        console.error('Error toggling follow status:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
