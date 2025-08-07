// app.ts
import Fastify from 'fastify';
import { Types } from "mongoose";
import mongoosePlugin from './plugins/mongoose.plugins';
import TripPlanModel from './models/trips.model';
import { TripPlan, TripPlanResponse } from './types/trip';
import { FastifySchema } from 'fastify';

const fastify = Fastify();
fastify.register(require('@fastify/cors'),{
  origin: "http://localhost:3000"
});
fastify.register(mongoosePlugin);

// Schema definitions for validation
const tripPlanSchema: FastifySchema = {
  body: {
    type: 'object',
    required: ['title', 'destination', 'days', 'budget'],
    properties: {
      title: { type: 'string' },
      destination: { type: 'string' },
      days: { type: 'integer', minimum: 1 },
      budget: { type: 'number', minimum: 0 }
    }
  }
};

const tripPlanUpdateSchema: FastifySchema = {
  body: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      destination: { type: 'string' },
      days: { type: 'integer', minimum: 1 },
      budget: { type: 'number', minimum: 0 }
    }
  }
};

const idParamSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'string', minLength: 24, maxLength: 24 } }
  }
};

// POST /api/add-trips
fastify.post<{ Body: TripPlan, Reply: TripPlanResponse }>(
  '/api/add-trips',
  { schema: tripPlanSchema },
  async (request, reply) => {
    const trip = new TripPlanModel({ ...request.body, createdAt: new Date() });
    const saved = await trip.save();
    reply.code(201).send({
      _id: (saved._id as Types.ObjectId).toString(),
      title: saved.title,
      destination: saved.destination,
      days: saved.days,
      budget: saved.budget,
      createdAt: saved.createdAt
    });
  }
);

// GET /api/get-trips
fastify.get<{ Querystring: { destination?: string, minBudget?: number, maxBudget?: number, page?: number, limit?: number }, Reply: TripPlanResponse[] }>(
  '/api/get-trips',
  {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          destination: { type: 'string' },
          minBudget: { type: 'number', minimum: 0 },
          maxBudget: { type: 'number', minimum: 0 },
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 }
        },
        additionalProperties: false
      }
    }
  },
  async (request, reply) => {
    const {
      destination,
      minBudget,
      maxBudget,
      page = 1,
      limit = 10
    } = request.query;

    const filter: Record<string, any> = {};
    if (destination) filter.destination = destination;
    if (typeof minBudget === 'number' || typeof maxBudget === 'number') {
      filter.budget = {};
      if (typeof minBudget === 'number') filter.budget.$gte = minBudget;
      if (typeof maxBudget === 'number') filter.budget.$lte = maxBudget;
    }

    const trips = await TripPlanModel.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    reply.send(
      trips.map((t) => ({
        _id: (t._id as Types.ObjectId).toString(),
        title: t.title,
        destination: t.destination,
        days: t.days,
        budget: t.budget,
        createdAt: t.createdAt
      }))
    );
  }
);

// PUT /api/update-trips/:id
fastify.put<{ Params: { id: string }, Body: Partial<TripPlan>, Reply: TripPlanResponse | { message: string } }>(
  '/api/update-trips/:id',
  { schema: { ...tripPlanUpdateSchema, ...idParamSchema } },
  async (request, reply) => {
    const { id } = request.params;
    const update = request.body;
    const trip = await TripPlanModel.findByIdAndUpdate(
      id,
      update,
      { new: true }
    );
    if (!trip) {
      reply.code(404).send({ message: 'Trip not found' });
      return;
    }
    reply.send({
     _id: (trip._id as Types.ObjectId).toString(),
      title: trip.title,
      destination: trip.destination,
      days: trip.days,
      budget: trip.budget,
      createdAt: trip.createdAt
    });
  }
);

// Start server
fastify.listen({ port: 4000 }, (err, address) => {
  if (err) throw err;
  console.log('Server listening at', address);
});
