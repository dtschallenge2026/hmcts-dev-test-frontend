import { Application } from 'express';
import axios from 'axios';

const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';

export default function (app: Application): void {
  app.get('/tasks', async (req, res) => {
    try {
      const response = await axios.get(`${backendUrl}/tasks`);
      res.render('tasks/list', { tasks: response.data });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.render('tasks/list', { tasks: [] });
    }
  });

  app.get('/tasks/new', (req, res) => {
    res.render('tasks/create');
  });

  app.post('/tasks', async (req, res) => {
    const errors: { text: string }[] = [];

    const day = parseInt(req.body['due-day'], 10);
    const month = parseInt(req.body['due-month'], 10);
    const year = parseInt(req.body['due-year'], 10);
    const hour = parseInt(req.body['due-hour'], 10);
    const minute = parseInt(req.body['due-minute'], 10);

    if (!req.body['due-day'] || isNaN(day) || day < 1 || day > 31) errors.push({ text: 'Enter a valid day' });
    if (!req.body['due-month'] || isNaN(month) || month < 1 || month > 12) errors.push({ text: 'Enter a valid month' });
    if (!req.body['due-year'] || isNaN(year) || String(year).length !== 4) errors.push({ text: 'Enter a valid 4-digit year' });
    if (!req.body['due-hour'] || isNaN(hour) || hour < 0 || hour > 23) errors.push({ text: 'Enter a valid hour between 0 and 23' });
    if (!req.body['due-minute'] || isNaN(minute) || minute < 0 || minute > 59) errors.push({ text: 'Enter a valid minute between 0 and 59' });

    if (errors.length === 0) {
      const parsed = new Date(year, month - 1, day);
      if (parsed.getMonth() !== month - 1) errors.push({ text: 'The day does not exist in that month' });
    }

    if (errors.length > 0) {
      return res.render('tasks/create', { errors, values: req.body });
    }

    try {
      const dueDateTime = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;

      await axios.post(`${backendUrl}/tasks`, {
        title: req.body.title,
        description: req.body.description,
        status: req.body.status,
        dueDateTime,
      });
      res.redirect('/tasks');
    } catch (error) {
      console.error('Error creating task:', error);
      res.render('tasks/create', { errors: [{ text: 'Failed to create task. Please try again.' }], values: req.body });
    }
  });

  app.get('/tasks/:id', async (req, res) => {
    try {
      const response = await axios.get(`${backendUrl}/tasks/${req.params.id}`);
      res.render('tasks/view', { task: response.data });
    } catch (error) {
      console.error('Error fetching task:', error);
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        res.status(404).render('tasks/not-found');
      } else {
        res.redirect('/tasks');
      }
    }
  });

  app.get('/tasks/:id/edit-status', async (req, res) => {
    try {
      const response = await axios.get(`${backendUrl}/tasks/${req.params.id}`);
      res.render('tasks/edit-status', { task: response.data });
    } catch (error) {
      console.error('Error fetching task:', error);
      res.redirect('/tasks');
    }
  });

  app.post('/tasks/:id/edit-status', async (req, res) => {
    try {
      await axios.patch(`${backendUrl}/tasks/${req.params.id}/status`, req.body.status, {
        headers: { 'Content-Type': 'application/json' },
      });
      res.redirect(`/tasks/${req.params.id}`);
    } catch (error) {
      console.error('Error updating task status:', error);
      res.redirect(`/tasks/${req.params.id}/edit-status`);
    }
  });

  app.post('/tasks/:id/delete', async (req, res) => {
    try {
      await axios.delete(`${backendUrl}/tasks/${req.params.id}`);
      res.redirect('/tasks');
    } catch (error) {
      console.error('Error deleting task:', error);
      res.redirect('/tasks');
    }
  });
}
