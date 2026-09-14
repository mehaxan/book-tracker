import express from 'express';
import { Settings } from '../models/Settings.js';

export const settingsRouter = express.Router();

// GET settings
settingsRouter.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: 'global_config' });
    if (!settings) {
      settings = await Settings.create({ key: 'global_config', annualGoal: 24, theme: 'dark' });
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings', message: err.message });
  }
});

// UPDATE settings
settingsRouter.put('/', async (req, res) => {
  try {
    const { annualGoal, theme } = req.body;
    const settings = await Settings.findOneAndUpdate(
      { key: 'global_config' },
      { ...(annualGoal && { annualGoal }), ...(theme && { theme }) },
      { new: true, upsert: true }
    );
    res.json(settings);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update settings', message: err.message });
  }
});
