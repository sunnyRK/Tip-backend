import express from "express";
import { addBookmark, createPost, dislikePost, getBookmarkedPosts, getPosts, getUserPosts, likePost, removeBookmark, tipPost } from "../../controller/post.controller";
import { checkPrivyToken } from "../../middleware/checkPrivyToken";

const postRouter = express.Router();

postRouter.post("/", checkPrivyToken, createPost);

postRouter.get("/", checkPrivyToken, getPosts);
postRouter.get("/userPosts", checkPrivyToken, getUserPosts);

postRouter.post('/tip/:postId', checkPrivyToken, tipPost);


postRouter.post('/likePost', checkPrivyToken, likePost);
postRouter.post('/dislikePost', checkPrivyToken, dislikePost);

postRouter.post('/addBookmark', checkPrivyToken, addBookmark);
postRouter.post('/removeBookmark', checkPrivyToken, removeBookmark);
postRouter.get('/bookmarked', checkPrivyToken, getBookmarkedPosts);

export default postRouter;
