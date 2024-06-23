import { Request, Response } from 'express';
import Post, { IPost, ITip } from '../models/post.model';
import { User } from '../models/user.model';

export const getProfile = async (req: any, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Error in getProfile:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// POST route to create a new post
export const createPost = async (req: any, res: Response) => {
  try {
    const { content, links, forOther, otherUserProfile, smartWalletAddress, tips } = req.body;
    const { _id } = req.user;

    // Validate user exists
    const user = await User.findById(_id);
    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid user ID' });
    }

    // Create a new post
    const newPost = new Post({
      userId: _id,
      content,
      links,
      forOther,
      otherUserProfile: forOther ? otherUserProfile : null,
      smartWalletAddress,
      tips,
      totalTips: 0, // Initialize total tips as 0
    });

    // Save the new post to the database
    await newPost.save();

    // Calculate and update the total tips
    newPost.calculateTotalTips();
    await newPost.save();

    res.status(201).json({ success: true, data: newPost });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error creating post' });
  }
};

import mongoose from 'mongoose';

interface GetPostsQuery {
  page?: string;
  limit?: string;
  userId?: string;
  dappName?: string;
}

// Function to fetch posts with pagination and filters
export const getPosts = async (req: Request<{}, {}, {}, GetPostsQuery>, res: Response) => {
  const { page = '1', limit = '10', userId, dappName } = req.query;

  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  const filters: any = {};

  if (userId) {
    filters.userId = new mongoose.Types.ObjectId(userId);
  }

  if (dappName) {
    filters['otherUserProfile.dappName'] = dappName;
  }

  try {
    const posts = await Post.find(filters)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .populate('userId', 'name image') // Adjust according to what you want to populate
      .exec();

    const totalPosts = await Post.countDocuments(filters);

    res.json({
      totalPages: Math.ceil(totalPosts / limitNumber),
      currentPage: pageNumber,
      totalPosts,
      posts,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts', error });
  }
};


export const tipPost = async (req: any, res: Response) => {
  const { postId } = req.params;
  const { amount, token } = req.body;
  const { _id } = req.user;

  try {
    // Find the post by postId
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Create a new tip
    const newTip: any = {
      amount,
      from: _id,
      token,
      createdAt: new Date(),
    };

    // Add the tip to the post
    post.tips.push(newTip);

    // Update total tips on the post
    post.totalTips = post.calculateTotalTips();

    // Save the updated post
    await post.save();

    res.status(200).json({ message: 'Tip sent successfully', post });
  } catch (error) {
    console.error('Error sending tip:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Backend: Express.js API for liking a post
// export const likePost = async (req: Request<any, any, { postId: string }>, res: Response) => {
export const likePost = async (req: any, res: Response) => {
  const { postId } = req.body;
  const { _id } = req.user; // Assuming _id is retrieved from authenticated user

  try {
    // Find the post by postId
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the user has already liked the post
    if (post.likes.includes(_id)) {
      return res.status(400).json({ message: 'You have already liked this post' });
    }

    // Add user's id to the likes array
    post.likes.push(_id);

    // Save the updated post
    await post.save();

    res.status(200).json({ message: 'Post liked successfully', post });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Backend: Express.js API for disliking a post
// export const dislikePost = async (req: Request<any, any, { postId: string }>, res: Response) => {
export const dislikePost = async (req: any, res: Response) => {
  const { postId } = req.body;
  const { _id } = req.user; // Assuming _id is retrieved from authenticated user

  try {
    // Find the post by postId
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the user has already liked the post
    if (!post.likes.includes(_id)) {
      return res.status(400).json({ message: 'You have not liked this post yet' });
    }

    // Remove user's id from the likes array
    post.likes = post.likes.filter(userId => userId.toString() !== _id.toString());

    // Save the updated post
    await post.save();

    res.status(200).json({ message: 'Post disliked successfully', post });
  } catch (error) {
    console.error('Error disliking post:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
