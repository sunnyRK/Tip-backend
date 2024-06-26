import express from "express";
import { addBookmark, createPost, dislikePost, getBookmarkedPosts, getPosts, getUserPosts, likePost, removeBookmark, tipPost, uploadImage } from "../../controller/post.controller";
import { checkPrivyToken } from "../../middleware/checkPrivyToken";
import multer from 'multer';

const postRouter = express.Router();



const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // Set an appropriate limit for your use case
});

postRouter.put("/upload-img", checkPrivyToken, upload.single('picture'), uploadImage);



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
