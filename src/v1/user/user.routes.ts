import express from "express";
import { createPost, getPosts, getProfile, tipPost } from "../../controller/post.controller";
import { checkPrivyToken } from "../../middleware/checkPrivyToken";
import { createUser } from "../../controller/user.contoller";

const userRouter = express.Router();

userRouter.post("/", createUser);

userRouter.get("/", checkPrivyToken, getProfile);
userRouter.post("/post", checkPrivyToken, createPost);
userRouter.get("/post", checkPrivyToken, getPosts);
userRouter.post('/post/tip/:postId', checkPrivyToken, tipPost);

export default userRouter;
