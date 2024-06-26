import mongoose, { Schema, model, Document, Types } from 'mongoose';

// Define interfaces for Tip and Post documents
export interface ITip extends Document {
  amount: number;
  from: mongoose.Types.ObjectId; // Reference to User model
  token: string;
  createdAt?: Date;
}

export interface IPost extends Document {
  userId: Types.ObjectId;
  content: string;
  imgUrl: string;
  links: string[];
  forOther: boolean;
  otherUserProfile?: {
    dappName: string;
    profileImage: string;
    profileName: string;
  };
  smartWalletAddress: string;
  tips: ITip[];
  likes: Types.ObjectId[];
  bookmarks: Types.ObjectId[];
  totalTips: number;
  calculateTotalTips: () => number;
}

// Define Tip schema
const tipSchema = new Schema<ITip>({
  amount: { type: Number, required: true },
  from: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});


// Define Post schema
const postSchema = new Schema<IPost>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  imgUrl: { type: String },
  links: { type: [String], default: [] }, // Array of links
  forOther: { type: Boolean, default: false },
  otherUserProfile: {
    dappName: { type: String, default: "" },
    profileImage: { type: String, default: "" },
    profileName: { type: String, default: "" },
  },
  smartWalletAddress: { type: String, default: "" },
  tips: [tipSchema],
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  bookmarks: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  totalTips: { type: Number, default: 0 }, // Field to store total tips amount
}, {
  timestamps: true,
});

// Method to calculate total tip amount and update totalTips field
postSchema.methods.calculateTotalTips = function (): number {
  const total = this.tips.reduce((sum: number, tip: ITip) => sum + tip.amount, 0);
  this.totalTips = total;
  return total;
};

// Export the Post model
const Post = model<IPost>('Post', postSchema);

export default Post;
