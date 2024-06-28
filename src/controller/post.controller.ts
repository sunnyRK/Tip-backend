import { Request, Response } from 'express';
import { User } from '../models/user.model';
import mongoose from 'mongoose';
import cloudinary from '../db/cloudinary';
import { Post, PostTip } from '../models/post.model';

// POST route to create a new post
export const createPost = async (req: any, res: Response) => {
  try {
    const { content, links, forOther, otherUserProfile, smartWalletAddress, tips, imgUrl } = req.body;
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
      links: links || [],
      forOther,
      otherUserProfile: forOther ? otherUserProfile : null,
      smartWalletAddress,
      tips,
      imgUrl,
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
      .populate('userId') // Adjust according to what you want to populate
      .populate('tips') // Adjust according to what you want to populate
      .sort({ createdAt: -1 })
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

export const getUserPosts = async (req: any, res: Response) => {
  const { page = '1', limit = '10', dappName } = req.query;

  const { _id } = req.user;
  const userId = _id;
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
      .populate('userId') // Adjust according to what you want to populate
      .sort({ createdAt: -1 })
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
  const { userId, amount, token } = req.body;
  const { _id } = req.user; // Assuming req.user contains the authenticated user's ID

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ message: 'Invalid post ID' });
  }

  try {
    // Find the post by postId
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Create a new tip
    const newTip = new PostTip({
      amount,
      from: _id,
      to: userId,
      token,
    });

    // Save the new tip
    await newTip.save();

    // Add the tip to the post
    const newTipId: any = newTip._id;
    post.tips.push(newTipId);

    // Update total tips on the post
    await post.calculateTotalTips();

    // Save the updated post
    await post.save();

    res.status(200).json({ message: 'Tip sent successfully', post });
  } catch (error) {
    console.error('Error sending tip:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Liking a post
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

// Disliking a post
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
// Add bookmark a post
export const addBookmark = async (req: any, res: Response) => {
  const { postId } = req.body;
  const { _id } = req.user;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.bookmarks.includes(_id)) {
      return res.status(400).json({ message: 'You have already bookmarked this post' });
    }

    post.bookmarks.push(_id);
    await post.save();

    res.status(200).json({ message: 'Post liked successfully', post });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Remove bookmark a post
export const removeBookmark = async (req: any, res: Response) => {
  const { postId } = req.body;
  const { _id } = req.user;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (!post.bookmarks.includes(_id)) {
      return res.status(400).json({ message: 'You have not bookmarked this post yet' });
    }

    post.bookmarks = post.bookmarks.filter(userId => userId.toString() !== _id.toString());
    await post.save();

    res.status(200).json({ message: 'Post disliked successfully', post });
  } catch (error) {
    console.error('Error disliking post:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// API endpoint to get all bookmarked posts of authenticated user
export const getBookmarkedPosts = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    const bookmarkedPosts = await Post.find({ bookmarks: new mongoose.Types.ObjectId(userId) })
      .populate('userId') // Adjust according to what you want to populate
      .sort({ createdAt: -1 })
      .exec();

    res.json({
      totalBookmarkedPosts: bookmarkedPosts.length,
      bookmarkedPosts,
    });
  } catch (error) {
    console.error('Error fetching bookmarked posts:', error);
    res.status(500).json({ message: 'Error fetching bookmarked posts', error });
  }
};


export const uploadImage = async (req: Request, res: Response) => {
  try {
    let url;
    if (req.body.picture) {
      const userImage = await cloudinary.uploader.upload(req.body.picture, {
        folder: "defi-posts",
        public_id: 'posts'
      });
      url = userImage.secure_url;
    }

    res.status(200).json({ msg: "Image Uploaded", url });
  } catch (error) {
    res.status(500).json({ message: 'Error Uploading Image', error });
  }
};