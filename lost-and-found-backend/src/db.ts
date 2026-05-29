// import mongoose from "mongoose";

// const connectDB = async (): Promise<void> => {
//   try {
//     const MONGO_URI = process.env.MONGO_URI;

//     if (!MONGO_URI) {
//       throw new Error("❌ MONGO_URI is not defined in .env");
//     }

//     await mongoose.connect(MONGO_URI);

//     console.log("✅ MongoDB Connected Successfully");
//   } catch (error) {
//     console.error("❌ MongoDB Connection Failed");

//     if (error instanceof Error) {
//       console.error(error.message);
//     }

//     process.exit(1);
//   }
// };

// export default connectDB;

import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI!;

if (!MONGO_URI) {
  throw new Error("MONGO_URI is missing");
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = {
    conn: null,
    promise: null,
  };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI).then((mongoose) => {
      console.log("✅ MongoDB Connected");
      return mongoose;
    });
  }

  cached.conn = await cached.promise;

  return cached.conn;
}

export default connectDB;
