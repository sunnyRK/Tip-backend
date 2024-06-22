// models/User.ts
import { Schema, model, Document } from 'mongoose';

interface ILinkedAccount {
  type: string;
  fid?: number;
  ownerAddress?: string;
  displayName?: string;
  username?: string;
  bio?: string;
  pfp?: string;
  verifiedAt?: Date;
  address?: string;
  chainType?: string;
  chainId?: string;
  walletClientType?: string;
  connectorType?: string;
}

interface IUser extends Document {
  privyUserId: string;
  createdAt: Date;
  linkedAccounts: ILinkedAccount[];
  wallet: {
    address: string;
    chainType: string;
    chainId: string;
    walletClientType: string;
    connectorType: string;
  };
  farcaster: {
    fid: number;
    ownerAddress: string;
    displayName: string;
    username: string;
    bio: string;
    pfp: string;
  };
}

const linkedAccountSchema = new Schema<ILinkedAccount>({
  type: { type: String, required: true },
  fid: { type: Number },
  ownerAddress: { type: String },
  displayName: { type: String },
  username: { type: String },
  bio: { type: String },
  pfp: { type: String },
  verifiedAt: { type: Date },
  address: { type: String },
  chainType: { type: String },
  chainId: { type: String },
  walletClientType: { type: String },
  connectorType: { type: String }
});

const userSchema = new Schema<IUser>({
  privyUserId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  linkedAccounts: [linkedAccountSchema],
  wallet: {
    address: { type: String, required: true },
    chainType: { type: String, required: true },
    chainId: { type: String, required: true },
    walletClientType: { type: String, required: true },
    connectorType: { type: String, required: true }
  },
  farcaster: {
    fid: { type: Number, required: true },
    ownerAddress: { type: String, required: true },
    displayName: { type: String, required: true },
    username: { type: String, required: true },
    bio: { type: String, required: true },
    pfp: { type: String, required: true }
  }
});

const User = model<IUser>('User', userSchema);
export default User;
