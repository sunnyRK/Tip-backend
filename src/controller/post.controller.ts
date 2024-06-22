import { Request, Response } from 'express';
import Post, { IPost, ITip } from '../models/post.model';

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

export const createPost2 = async (req: any, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }

    const { content } = req.body;
    const newPost = new Post({
      userId: user._id,
      content
    });

    await newPost.save();
    res.status(201).json({ message: 'Post created successfully', post: newPost });
  } catch (error) {
    console.error('Error in createPost:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};


// export const getPosts = async (req: Request, res: Response) => {
//     try {
//         const posts = await Post.find().populate('userId', '-_id -__v -createdAt'); // Excluding some fields from user model

//         res.status(200).json(posts);
//     } catch (error) {
//         console.error('Error in getPosts:', error);
//         return res.status(500).json({ message: 'Internal Server Error' });
//     }
// };
// controllers/postController.ts

export const createPost = async (req: any, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }

    const { content, userId } = req.body;
    const isSelfCreated = user._id === userId;
    const newPost = new Post({
      userId: user._id,
      content,
      createdBy: userId,
      isSelfCreated
    });

    await newPost.save();
    res.status(201).json({ message: 'Post created successfully', post: newPost });
  } catch (error) {
    console.error('Error in createPost:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// controllers/postController.ts
export const getPosts = async (req: Request, res: Response) => {
  try {
    const posts = await Post.find().populate('userId createdBy tips.from').sort({ createdAt: -1 }); // Populate user details
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error in getPosts:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

//   // controllers/postController.ts
// export const tipPost = async (req: any, res: Response) => {
//     try {
//       const user = req.user;
//       if (!user) {
//         return res.status(401).json({ message: 'Unauthorized: User not found' });
//       }

//       const { postId, amount } = req.body;

//       const post = await Post.findById(postId);
//       if (!post) {
//         return res.status(404).json({ message: 'Post not found' });
//       }

//       post.tips.push({ amount, from: user._id });
//       await post.save();

//       res.status(200).json({ message: 'Tip added successfully', post });
//     } catch (error) {
//       console.error('Error in tipPost:', error);
//       return res.status(500).json({ message: 'Internal Server Error' });
//     }
//   };

// export const tipPost = async (req: Request<any, any, { postId: string, amount: number }>, res: Response) => {
export const tipPost = async (req: any, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }

    const { postId, amount } = req.body;

    // Validate if postId is a valid ObjectId (optional)
    if (!postId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid postId format' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Add tip to the post
    post.tips.push({ amount, from: user._id } as ITip);
    await post.save();

    // Calculate total tips for the updated post
    const updatedPost: IPost | null = await Post.findById(postId);
    const totalTips = updatedPost ? updatedPost.calculateTotalTips() : 0;

    res.status(200).json({ message: 'Tip added successfully', post: updatedPost, totalTips });
  } catch (error) {
    console.error('Error in tipPost:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};