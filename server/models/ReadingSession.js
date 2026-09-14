import mongoose from 'mongoose';

const readingSessionSchema = new mongoose.Schema(
  {
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: false
    },
    bookTitle: {
      type: String,
      default: ''
    },
    date: {
      type: String,
      required: true,
      default: () => new Date().toISOString().split('T')[0],
      index: true
    },
    pagesRead: {
      type: Number,
      default: 0,
      min: 0
    },
    minutes: {
      type: Number,
      default: 0,
      min: 0
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        if (ret.bookId) ret.bookId = ret.bookId.toString();
        delete ret.__v;
        return ret;
      }
    }
  }
);

export const ReadingSession = mongoose.model('ReadingSession', readingSessionSchema);
