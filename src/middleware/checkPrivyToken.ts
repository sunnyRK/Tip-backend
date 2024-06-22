import { NextFunction, Request, Response } from 'express';
import { privy } from '../helpers/privyClient';
import { AuthTokenClaims } from '@privy-io/server-auth';
import User from '../models/user.model';

export interface User {
    appId: string;
    issuer: string;
    issuedAt: number;
    expiration: number;
    sessionId: string;
    userId: string;
}

export const checkPrivyToken2 = async (req: any, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies['privy-token'];

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: No token provided' });
        }

        const verifiedClaims: AuthTokenClaims = await privy.verifyAuthToken(token);

        if (!verifiedClaims) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }

        // Assign verifiedClaims to req.user with the User type
        req.user = {
            appId: verifiedClaims.appId,
            issuer: verifiedClaims.issuer,
            issuedAt: verifiedClaims.issuedAt,
            expiration: verifiedClaims.expiration,
            sessionId: verifiedClaims.sessionId,
            userId: verifiedClaims.userId
        } as User;

        next();
    } catch (error) {
        console.error('Error in checkPrivyToken middleware:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const checkPrivyToken = async (req: any, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies['privy-token'];
  
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
      }
  
      const verifiedClaims = await privy.verifyAuthToken(token);
  
      if (!verifiedClaims) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
      }
  
      const privyUserId = verifiedClaims.userId;
      const privyUser = await privy.getUser(privyUserId);
  
      let user = await User.findOne({ privyUserId });
  
      if (!user) {
        user = new User({
          privyUserId: privyUser.id,
          createdAt: privyUser.createdAt,
          linkedAccounts: privyUser.linkedAccounts,
          wallet: privyUser.wallet,
          farcaster: privyUser.farcaster
        });
        await user.save();
      }
  
      console.log(user)
      req.user = user;
      next();
    } catch (error) {
      console.error('Error in checkPrivyToken middleware:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };