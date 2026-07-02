import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/error.middleware.js';
import authRoutes from './routes/auth.routes.js';

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);

// Error Handling Middleware
app.use(errorHandler);

export default app;
