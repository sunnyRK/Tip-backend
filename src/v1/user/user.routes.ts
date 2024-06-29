import express from "express";
import { checkPrivyToken } from "../../middleware/checkPrivyToken";
import { addFarcasterAccount, createUser, getFollowers, getFollowing, getRandomUsers, getUser, getUserTipStats, logOut, loginUser, searchUsers, toggleFollowUser, updateUserProfile, uploadProfileImage } from "../../controller/user.contoller";
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // Set an appropriate limit for your use case
});
const userRouter = express.Router();


userRouter.post("/", createUser);
userRouter.post("/login", loginUser);
userRouter.post("/link-farcaster", checkPrivyToken, addFarcasterAccount);
userRouter.post("/logout", logOut);

userRouter.get("/search", searchUsers);

userRouter.get("/", checkPrivyToken, getUser);
userRouter.get("/get-follows", getRandomUsers);
userRouter.post("/follow", checkPrivyToken, toggleFollowUser);

userRouter.get('/user-followers', checkPrivyToken, getFollowers);
userRouter.get('/user-following', checkPrivyToken, getFollowing);

userRouter.put("/profile-img", checkPrivyToken, upload.single('picture'), uploadProfileImage);

userRouter.get('/tip-stats', checkPrivyToken, getUserTipStats);


userRouter.put('/update-info', checkPrivyToken, updateUserProfile);

export default userRouter;
