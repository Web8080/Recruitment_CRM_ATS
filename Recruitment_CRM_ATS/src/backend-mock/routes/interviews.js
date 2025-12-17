const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Get all interviews
router.get('/', async (req, res) => {
  try {
    const interviews = await db.getInterviews(req.query);
    res.json(interviews);
  } catch (error) {
    console.error('Error fetching interviews:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get interview by ID
router.get('/:id', async (req, res) => {
  try {
    const interview = await db.getInterviewById(req.params.id);
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }
    res.json(interview);
  } catch (error) {
    console.error('Error fetching interview:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create interview
router.post('/', async (req, res) => {
  try {
    const interview = await db.createInterview(req.body);
    res.status(201).json(interview);
  } catch (error) {
    console.error('Error creating interview:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update interview
router.put('/:id', async (req, res) => {
  try {
    const interview = await db.updateInterview(req.params.id, req.body);
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }
    res.json(interview);
  } catch (error) {
    console.error('Error updating interview:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete interview
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await db.deleteInterview(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Interview not found' });
    }
    res.json({ message: 'Interview deleted successfully' });
  } catch (error) {
    console.error('Error deleting interview:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

