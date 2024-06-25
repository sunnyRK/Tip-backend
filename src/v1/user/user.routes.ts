import express from "express";
import { checkPrivyToken } from "../../middleware/checkPrivyToken";
import { createUser, getRandomUsers, getUser, toggleFollowUser } from "../../controller/user.contoller";

const userRouter = express.Router();

userRouter.post("/", createUser);
userRouter.get("/", checkPrivyToken, getUser);
userRouter.get("/get-follows", getRandomUsers);
userRouter.post("/follow", checkPrivyToken, toggleFollowUser);

export default userRouter;
