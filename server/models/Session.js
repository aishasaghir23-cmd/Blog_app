import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      minlength: [3, 'Title must be at least 3 characters'],
    },
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      enum: ['React', 'Node', 'Database', 'Other'],
    },
    hours: {
      type: Number,
      required: [true, 'Hours are required'],
      min: [1, 'Hours must be at least 1'],
      max: [24, 'Hours cannot exceed 24'],
    },
    notes: {
      type: String,
      default: '',
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Session = mongoose.model('Session', sessionSchema);
export default Session;
