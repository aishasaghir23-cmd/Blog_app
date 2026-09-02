import express from 'express';
import Session from '../models/Session.js';

const router = express.Router();
router.get('/', async (req, res, next) => {
  try {
    const sessions = await Session.find().sort({ createdAt: -1 });
    res.status(200).json(sessions);
  } catch (error) {
    next(error);
  }
});


router.get('/:id', async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      res.status(404);
      throw new Error('Session not found');
    }
    res.status(200).json(session);
  } catch (error) {
    next(error);
  }
});
router.post('/', async (req, res, next) => {
  try {
    const { title, topic, hours, notes, completed } = req.body;
    const session = await Session.create({ title, topic, hours, notes, completed });
    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
});


router.put('/:id', async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      res.status(404);
      throw new Error('Session not found');
    }

    session.title = req.body.title || session.title;
    session.topic = req.body.topic || session.topic;
    session.hours = req.body.hours ?? session.hours;
    session.notes = req.body.notes ?? session.notes;
    session.completed = req.body.completed ?? session.completed;

    const updatedSession = await session.save();
    res.status(200).json(updatedSession);
  } catch (error) {
    next(error);
  }
});


router.delete('/:id', async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      res.status(404);
      throw new Error('Session not found');
    }

    await session.deleteOne();
    res.status(200).json({ message: 'Session deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
