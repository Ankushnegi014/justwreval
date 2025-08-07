// plugins/mongoose.ts
import fp from 'fastify-plugin';
import mongoose from 'mongoose';

export default fp(async (fastify) => {
  await mongoose.connect('mongodb://localhost:27017/tripdb');
  console.log("db connected.........")
  fastify.decorate('mongoose', mongoose);
});
