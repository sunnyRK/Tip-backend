import express from "express";
import { createPost, getPosts, getProfile, tipPost } from "../../controller/post.controller";
import { checkPrivyToken } from "../../middleware/checkPrivyToken";

const userRouter = express.Router();

userRouter.get("/", checkPrivyToken, getProfile);
userRouter.post("/post", checkPrivyToken, createPost);
userRouter.get("/post", getPosts);
userRouter.post('/post/tip', checkPrivyToken, tipPost);

export default userRouter;
