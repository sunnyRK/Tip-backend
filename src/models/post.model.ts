// import { Schema, model, Document } from 'mongoose';

// interface IPost extends Document {
//   userId: Schema.Types.ObjectId;
//   content: string;
//   tips: {
//     amount: number;
//     from: string;
//   }[];
//   createdBy: Schema.Types.ObjectId;
//   isSelfCreated: boolean;
//   createdAt: Date;
//   updatedAt: Date;
// }

// const postSchema = new Schema<IPost>({
//   userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
//   content: { type: String, required: true },
//   tips: [
//     {
//       amount: { type: Number, required: true },
//       from: { type: String, ref: 'User', required: true }
//     }
//   ],
//   createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
//   isSelfCreated: { type: Boolean, required: true },
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now }
// });

// const Post = model<IPost>('Post', postSchema);
// export default Post;
import { Schema, model, Document, Types } from 'mongoose';

export interface ITip extends Document {
  amount: number;
  from: Types.ObjectId;
}

export interface IPost extends Document {
  userId: Types.ObjectId;
  content: string;
  tips: ITip[];
  createdBy: Types.ObjectId;
  isSelfCreated: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Optional method to calculate total tip amount
  calculateTotalTips(): number;
}

const tipSchema = new Schema({
  amount: { type: Number, required: true },
  from: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

const postSchema = new Schema<IPost>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  tips: [tipSchema],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isSelfCreated: { type: Boolean, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Method to calculate total tip amount
postSchema.methods.calculateTotalTips = function (): number {
  let total = 0;
  this.tips.forEach((tip: any) => {
    total += tip.amount;
  });
  return total;
};

const Post = model<IPost>('Post', postSchema);

export default Post;
