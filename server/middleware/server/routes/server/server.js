import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import logger from './middleware/logger.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import sessionRoutes from './routes/sessions.js';

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);

app.use('/api/sessions', sessionRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
