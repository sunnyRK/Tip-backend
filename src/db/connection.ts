import { connect } from "mongoose";

let isConnected: boolean = false;
let db: any;

export const connectToDatabase = async (): Promise<any> => {
  if (isConnected && db) return db;

  try {
    console.log('Connecting to DB');

    db = await connect(process.env.MONGO_URL || '');

    isConnected = !!db.connections[0].readyState;

    console.log(`DB: ${db.connections[0].name} Connected`);
    
    if (db) {
      return db;
    } else {
      throw new Error('Connection to database failed.');
    }
  } catch (err: any) {
    throw new Error(err);
  }
};

export default connectToDatabase;
