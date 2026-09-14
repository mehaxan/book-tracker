import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'global_config',
      unique: true
    },
    annualGoal: {
      type: Number,
      default: 24,
      min: 1
    },
    theme: {
      type: String,
      enum: ['dark', 'warm'],
      default: 'dark'
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

export const Settings = mongoose.model('Settings', settingsSchema);
