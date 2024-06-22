import express from "express";
import userRouter from "./user/user.routes";
const v1 = express.Router();

//authentication routes
v1.use("/user", userRouter);

export default v1;
