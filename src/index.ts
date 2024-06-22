import express, { NextFunction, Request, Response } from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
import connectToDatabase from './db/connection';
import { ResponseStatus } from './helpers/constants';
import v1 from './v1';
import { checkPrivyToken } from './middleware/checkPrivyToken';
import { privy } from './helpers/privyClient';
require("dotenv").config();

const app = express();

app.use(cors({
  origin: ["http://localhost:3000", "https://app.defilens.tech", "https://defilens.tech"],
  credentials: true,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());

const server = http.createServer(app);

app.get('/protected', checkPrivyToken, async (req: any, res: Response) => {
  try {

    const { privyUserId } = req.user;
    console.log(privyUserId)
    const user = await privy.getUser(privyUserId);

    if (!user) {
      res.status(401).json({ message: 'User Not found' });
    }

    res.status(200).json({ message: 'Access granted to protected route', user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Something wrong happened' });
  }
});


app.use('/api', v1)

app.use('*', (_req: express.Request, res: express.Response) =>
  res.status(ResponseStatus.NOT_FOUND).send('This path not found!')
)

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(ResponseStatus.INTERNAL_SERVER_ERROR).send({
    error: err?.message || 'Something unexpected happened!'
  })
})

connectToDatabase();
const PORT = process.env.PORT || 9090

server.listen(PORT, () => {
  console.log(`Server is running on PORT = http://localhost:${PORT}`)
})
