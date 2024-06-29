import { Request, Response } from "express";
import { User } from "../models/user.model";
import mongoose, { Types } from "mongoose";
import cloudinary from "../db/cloudinary";
import { PostTip } from "../models/post.model";

export const createUser1 = async (req: Request, res: Response) => {
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

export const createUser2 = async (req: Request, res: Response) => {
    try {
        const { id, createdAt, linkedAccounts, wallet, smartAccountAddress } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ did: id });

        if (existingUser) {
            const farcasterAccount = existingUser.linkedAccounts.find((account: any) => account.type === 'farcaster');
            if (farcasterAccount) {
                // Set a cookie indicating the user is logged in
                // res.cookie('privy-token', 'login_true', { httpOnly: true, secure: true });
                res.cookie('login_true', { httpOnly: true, secure: true });
                return res.status(200).json({ message: 'User already exists and linked Farcaster', alreadyReg: true });
            } else {
                return res.status(200).json({ message: 'User already exists but needs to link Farcaster', alreadyReg: false });
            }
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

        // Set a cookie indicating the user is logged in
        // res.cookie('privy-token', 'login_true', { httpOnly: true, secure: true });
        res.cookie('login_true', { httpOnly: true, secure: true });
        res.status(201).json({ savedUser, alreadyReg: false });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create user', message: error });
    }
};


export const createUser = async (req: Request, res: Response) => {
    try {
        const { id, createdAt, linkedAccounts, wallet, smartAccountAddress } = req.body;

        console.log(req.body)
        // Check if user already exists
        let user = await User.findOne({ did: id });

        if (user) {
            res.cookie('login-token', user._id, { httpOnly: true });
            return res.status(200).json({ message: 'User already exists', alreadyReg: true });
        }

        user = new User({
            did: id,
            createdAt,
            linkedAccounts,
            wallet,
            smartAccountAddress
        });

        const savedUser = await user.save();

        // res.cookie('user-id', savedUser._id, { httpOnly: true });
        return res.status(201).json({ savedUser, alreadyReg: false });
    } catch (error) {
        console.error('Error in connect-wallet:', error);
        return res.status(500).json({ error: 'Failed to connect wallet', message: error });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    const { id, createdAt, linkedAccounts, wallet, smartAccountAddress } = req.body;

    try {
        // Check if user already exists
        let user = await User.findOne({ did: id });

        if (!user) {
            res.cookie('login-token', user._id, { httpOnly: true });
            return res.status(200).json({ message: 'User not exist, Sign up first.', alreadyReg: false });
        }

        return res.status(201).json({ user, alreadyReg: true });
    } catch (error) {
        console.error('Error in connect-wallet:', error);
        return res.status(500).json({ error: 'Failed to connect wallet', message: error });
    }
};

export const addFarcasterAccount = async (req: any, res: Response) => {
    try {
        const userId = req.user._id;
        const { farcasterAccount } = req.body;

        console.log(req.body)
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.linkedAccounts = farcasterAccount.linkedAccounts;
        user.name = farcasterAccount.farcaster.username || "";
        user.bio = farcasterAccount.farcaster.bio || "";
        user.image = farcasterAccount.farcaster.pfp || "";

        // {
        //     "fid": 689453,
        //     "ownerAddress": "0x9dECa0ee05776B629aB6DCEbAE00547E683EC025",
        //     "displayName": "Akshay",
        //     "username": "akshayjangra",
        //     "bio": "I am software developer",
        //     "pfp": "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/20ea16ea-d8b9-4a95-7d3b-512cf9f9f900/original"
        // }

        const updatedUser = await user.save();

        res.cookie('login-token', updatedUser._id, { httpOnly: true });
        return res.status(200).json({ updatedUser });
    } catch (error) {
        console.error('Error in addFarcasterAccount:', error);
        return res.status(500).json({ error: 'Failed to add Farcaster account', message: error });
    }
};


export const logOut = async (req: any, res: Response) => {
    try {
        res.clearCookie('login-token');
        return res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Error in logout:', error);
        return res.status(500).json({ error: 'Failed to logout', message: error });
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

        // Fetch the list of users the specified user is following
        let followedUsers: any = [];
        if (userId) {
            const user = await User.findById(userId).select('following');
            if (user) {
                followedUsers = user.following.map((id: mongoose.Types.ObjectId) => id.toString());
            }
        }

        // Add the specified user to the list of excluded users
        followedUsers.push(userId);

        const randomUsers = await User.aggregate([
            { $match: { _id: { $nin: followedUsers.map((id: any) => new mongoose.Types.ObjectId(id)) } } }, // Exclude followed users and the specified user
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

        const updatedUser = await User.findById(currentUserId);


        res.status(200).json({
            message: isFollowing ? 'Unfollowed user successfully' : 'Followed user successfully',
            isFollowing: !isFollowing,
            updatedUser
        });
    } catch (error) {
        console.error('Error toggling follow status:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


export const getFollowers = async (req: any, res: Response) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId).populate('followers');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ followers: user.followers });
    } catch (error) {
        console.error('Error fetching followers:', error);
        res.status(500).json({ message: 'Error fetching followers', error });
    }
};


export const getFollowing = async (req: any, res: Response) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId).populate('following');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ following: user.following });
    } catch (error) {
        console.error('Error fetching following:', error);
        res.status(500).json({ message: 'Error fetching following', error });
    }
};


export const uploadProfileImage = async (req: any, res: Response) => {
    try {
        const userId = req.user._id;

        const { picture } = req.body;

        if (!picture) {
            return res.status(400).json({ error: 'Image URL is required' });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        let url;
        if (req.body.picture) {
            const userImage = await cloudinary.uploader.upload(req.body.picture, {
                folder: "defi-posts",
                public_id: 'posts'
            });
            url = userImage.secure_url;
        }

        user.image = url;
        await user.save();
        res.status(200).json({ msg: "Image Uploaded", url });
    } catch (error) {
        console.error('Error updating user image:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


export const getUserTipStats = async (req: any, res: Response) => {
    const userId = req.user._id;

    try {
        // Get all tips given by the user
        const tipsGiven = await PostTip.find({ from: userId }).populate('to');

        // Calculate total tips received by the user
        const tipsReceived = await PostTip.find({ to: userId });

        const totalTipsReceived = tipsReceived.reduce((total, tip) => total + tip.amount, 0);
        const totalTipsGiven = tipsGiven.reduce((total, tip) => total + tip.amount, 0);

        res.status(200).json({
            tipsGiven,
            totalTipsGiven,
            totalTipsReceived
        });
    } catch (error) {
        console.error('Error fetching user tip stats:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


export const updateUserProfile = async (req: any, res: Response) => {
    const userId = req.user._id;
    const { name, bio, image } = req.body;

    try {
        // Find the user by userId and update the provided fields
        const user = await User.findByIdAndUpdate(
            userId,
            { name, bio, image },
            { new: true } // Return the updated document
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


export const searchUsers = async (req: Request, res: Response) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ message: 'Query string is required' });
    }

    try {
        const users = await User.find({
            $or: [
                { bio: { $regex: query, $options: 'i' } },
                { name: { $regex: query, $options: 'i' } },
                { smartAccountAddress: { $regex: query, $options: 'i' } },
                { 'wallet.address': { $regex: query, $options: 'i' } }
            ]
        }); // Select only the required fields

        res.json(users);
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ message: 'Error searching users', error });
    }
};
