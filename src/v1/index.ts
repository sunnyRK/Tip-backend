import express from "express";
import userRouter from "./user/user.routes";
import postRouter from "./post/post.routes";
const v1 = express.Router();

//authentication routes
v1.use("/user", userRouter);
v1.use("/post", postRouter);

export default v1;
