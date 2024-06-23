import { NextFunction, Response } from 'express';
import { privy } from '../helpers/privyClient';
import { AuthTokenClaims } from '@privy-io/server-auth';
import { User } from '../models/user.model';

export const checkPrivyToken = async (req: any, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies['privy-token'];

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const verifiedClaims: AuthTokenClaims = await privy.verifyAuthToken(token);

    if (!verifiedClaims) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }

    const privyUserId = verifiedClaims.userId;

    // Fetch user data from backend using privy.getUser(privyUserId)
    const privyUser = await privy.getUser(privyUserId);
    if (!privyUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = await User.findOne({ did: privyUserId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error('Error in checkPrivyToken middleware:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
