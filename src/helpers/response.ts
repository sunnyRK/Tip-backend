import express, { Response } from "express";
import { ResponseStatus } from "./constants";

const sendSuccessResponse = async (res: Response<any>, data: any = {}) => {
  return res.status(ResponseStatus.OK).json(data);
};

const sendErrorResponse = async (res: Response<any>, error: string = "Something went wrong") => {
  return res.status(ResponseStatus.NOT_FOUND).json({ error });
};

const withError = (handler: (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<void>) => async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    await handler(req, res, next);
  } catch (error) {
    next(error);
  }
};

export { sendSuccessResponse, sendErrorResponse, withError };
