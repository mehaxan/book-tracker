import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true
    },
    cover: {
      type: String,
      default: ''
    },
    totalPages: {
      type: Number,
      required: true,
      default: 1,
      min: 1
    },
    currentPage: {
      type: Number,
      default: 0,
      min: 0
    },
    status: {
      type: String,
      enum: ['wishlist', 'bought', 'reading', 'finished', 'dnf'],
      default: 'wishlist',
      index: true
    },
    genre: {
      type: String,
      default: 'Fiction',
      index: true
    },
    format: {
      type: String,
      enum: ['Paperback', 'Hardcover', 'E-Book', 'Audiobook'],
      default: 'Paperback'
    },
    price: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium'
    },
    startDate: {
      type: String,
      default: null
    },
    finishDate: {
      type: String,
      default: null
    },
    boughtDate: {
      type: String,
      default: null
    },
    favoriteQuote: {
      type: String,
      default: ''
    },
    review: {
      type: String,
      default: ''
    },
    notes: {
      type: String,
      default: ''
    },
    gradient: {
      type: String,
      default: 'linear-gradient(135deg, #1e3a8a, #0f172a)'
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      }
    }
  }
);

export const Book = mongoose.model('Book', bookSchema);
