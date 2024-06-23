import { Request, Response } from "express";
import { User } from "../models/user.model";

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
