const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Get notes for an entity
router.get('/:entityType/:entityId', async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const notes = await db.getNotes(entityType, entityId);
    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create note
router.post('/', async (req, res) => {
  try {
    const note = await db.createNote(req.body);
    await db.logActivity({
      entityType: req.body.entityType,
      entityId: req.body.entityId,
      activityType: 'NoteCreated',
      description: `Note created on ${req.body.entityType}`,
      userId: req.user?.id
    });
    res.status(201).json(note);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update note
router.put('/:id', async (req, res) => {
  try {
    const note = await db.updateNote(req.params.id, req.body);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete note
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await db.deleteNote(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

