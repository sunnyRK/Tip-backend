import { Schema } from "mongoose";

const mongoose = require('mongoose');

const linkedAccountSchema = new mongoose.Schema({
  address: String,
  type: String,
  verifiedAt: Date,
  firstVerifiedAt: Date,
  latestVerifiedAt: Date,
  chainType: String,
  chainId: String,
  walletClient: String,
  walletClientType: String,
  connectorType: String,
  fid: Number,
  ownerAddress: String,
  displayName: String,
  username: String,
  bio: String,
  pfp: String,
});

const userSchema = new mongoose.Schema({
  did: { type: String, required: true, unique: true },
  createdAt: { type: Date, required: true },
  linkedAccounts: [linkedAccountSchema],
  wallet: {
    address: { type: String, required: true },
    chainType: String,
    chainId: String,
    walletClient: String,
    walletClientType: String,
    connectorType: String,
  },
  image: String,
  name: String,
  bio: String,
  smartAccountAddress: String,
  followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

export const User = mongoose.model('User', userSchema);

