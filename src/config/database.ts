import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  uri: process.env.MONGODB_URI,
  options: {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  },
}));
